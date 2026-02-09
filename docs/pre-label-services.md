# Pre-Label Services — Design Document

> **Status**: Design document for a planned future feature. Not implemented in the current version.

This document describes how to integrate pre-labeling (automated PII detection) into the Email Annotation platform. Pre-labeling generates suggested annotations before a human annotator sees a job, reducing manual effort and improving consistency.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Pre-Label JSON Format](#2-pre-label-json-format)
3. [Architecture](#3-architecture)
4. [Backend Design](#4-backend-design)
5. [Frontend Design](#5-frontend-design)
6. [Pre-Label Services](#6-pre-label-services)
7. [Integration Flow](#7-integration-flow)
8. [Implementation Plan](#8-implementation-plan)

---

## 1. Overview

### What is Pre-Labeling?

Pre-labeling runs an automated PII detection service on raw `.eml` file content to produce a set of suggested annotations (entity spans with class labels and offsets). These suggestions are loaded into the annotation workspace as a starting point — the annotator then reviews, corrects, adds, or removes annotations before submitting.

### Goals

- Reduce annotation time by 40-70% for common PII types (emails, phone numbers, names)
- Support multiple pluggable detection backends (AWS Comprehend, Google DLP, local LLMs)
- Keep pre-labels clearly distinguished from human annotations (source tracking)
- Make the feature optional — admins can enable/disable per dataset or globally
- Preserve the existing manual workflow as a fallback

### Non-Goals

- Pre-labels are **not** final annotations — they always require human review
- No real-time/streaming detection during annotation (batch only)
- No model training or fine-tuning within the platform

---

## 2. Pre-Label JSON Format

### Per-Job Format

Each job's pre-label result is a JSON object mapping the job (by file name or job ID) to an array of detected entities:

```json
{
  "version": "1.0",
  "service": "aws_comprehend",
  "generated_at": "2026-02-08T12:00:00Z",
  "annotations": [
    {
      "class_name": "email",
      "display_label": "Email",
      "tag": "",
      "start_offset": 152,
      "end_offset": 178,
      "original_text": "john.smith@example.com",
      "confidence": 0.97
    },
    {
      "class_name": "phone",
      "display_label": "Phone",
      "tag": "",
      "start_offset": 245,
      "end_offset": 259,
      "original_text": "+1-555-867-5309",
      "confidence": 0.94
    },
    {
      "class_name": "full_name_person",
      "display_label": "Full Name (Person)",
      "tag": "",
      "start_offset": 42,
      "end_offset": 52,
      "original_text": "John Smith",
      "confidence": 0.89
    }
  ]
}
```

### Bulk Import Format (Dataset-Level)

For importing pre-labels for an entire dataset at once (e.g., from an offline batch process):

```json
{
  "version": "1.0",
  "service": "google_dlp",
  "generated_at": "2026-02-08T12:00:00Z",
  "jobs": [
    {
      "file_name": "A000188_t1_1.eml",
      "annotations": [
        {
          "class_name": "email",
          "start_offset": 152,
          "end_offset": 178,
          "original_text": "john.smith@example.com",
          "confidence": 0.97
        }
      ]
    },
    {
      "file_name": "A000189_t1_2.eml",
      "annotations": [
        {
          "class_name": "first_name_person",
          "start_offset": 30,
          "end_offset": 34,
          "original_text": "Jane",
          "confidence": 0.91
        }
      ]
    }
  ]
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `class_name` | string | Yes | Must match an existing `AnnotationClass.name` (e.g., `"email"`, `"phone"`, `"first_name_person"`) |
| `display_label` | string | No | Human-readable label; resolved from `AnnotationClass` if omitted |
| `tag` | string | No | De-identification replacement tag (e.g., `[EMAIL_1]`); auto-generated if empty |
| `start_offset` | integer | Yes | Character offset where the entity starts in the raw `.eml` content |
| `end_offset` | integer | Yes | Character offset where the entity ends (exclusive) |
| `original_text` | string | Yes | The exact text span from the file at `[start_offset, end_offset)` |
| `confidence` | float | No | Detection confidence score 0.0–1.0; used for UI filtering/sorting |

### Offset Semantics

Offsets are **byte-position in the UTF-8 decoded text** of the raw `.eml` file — the same coordinate system the annotation workspace already uses. The `original_text` field must exactly match `raw_content[start_offset:end_offset]`, which the backend validates on import.

---

## 3. Architecture

### High-Level Flow

```
                          ┌──────────────────┐
                          │   Admin Action    │
                          │  (trigger or      │
                          │   upload JSON)    │
                          └────────┬─────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     Pre-Label Service        │
                    │  ┌─────────┐ ┌────────────┐  │
                    │  │  AWS    │ │  Google     │  │
                    │  │Compreh. │ │  DLP        │  │
                    │  └─────────┘ └────────────┘  │
                    │  ┌─────────┐ ┌────────────┐  │
                    │  │  Phi-3  │ │  Custom     │  │
                    │  │  LLM    │ │  Service    │  │
                    │  └─────────┘ └────────────┘  │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   PreLabelResult (DB)        │
                    │   - job (FK)                 │
                    │   - service_name             │
                    │   - annotations (JSON)       │
                    │   - status                   │
                    │   - confidence_threshold     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  Annotation Workspace (UI)   │
                    │  - Load pre-labels as        │
                    │    initial suggestions        │
                    │  - Annotator reviews/edits   │
                    │  - Submit as normal           │
                    └─────────────────────────────┘
```

### Plugin Architecture

Each pre-label service implements a common Python interface:

```python
# backend/prelabel/services/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class DetectedEntity:
    class_name: str        # matches AnnotationClass.name
    start_offset: int
    end_offset: int
    original_text: str
    confidence: float = 1.0
    tag: str = ""


class BasePreLabelService(ABC):
    """Base class for all pre-label services."""

    name: str              # e.g., "aws_comprehend"
    display_name: str      # e.g., "AWS Comprehend PII"

    @abstractmethod
    def detect(self, raw_content: str) -> list[DetectedEntity]:
        """
        Run PII detection on raw email content.

        Args:
            raw_content: The full UTF-8 text of the .eml file.

        Returns:
            List of detected entities with offsets into raw_content.
        """
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this service is configured and ready to use."""
        ...

    def get_class_mapping(self) -> dict[str, str]:
        """
        Map service-specific entity types to our AnnotationClass names.

        Returns:
            Dict mapping service type (e.g., "EMAIL_ADDRESS") to
            our class_name (e.g., "email").
        """
        return {}
```

---

## 4. Backend Design

### 4.1 New Django App: `prelabel`

```
backend/prelabel/
├── __init__.py
├── admin.py
├── apps.py
├── models.py              # PreLabelResult, PreLabelConfig
├── serializers.py
├── views.py               # API endpoints
├── urls.py
├── tasks.py               # Async processing (Celery or Django-Q)
├── validators.py          # Offset validation
├── services/
│   ├── __init__.py
│   ├── base.py            # BasePreLabelService ABC
│   ├── registry.py        # Service registry
│   ├── aws_comprehend.py  # AWS Comprehend implementation
│   ├── google_dlp.py      # Google Cloud DLP implementation
│   └── phi3_llm.py        # Phi-3 local LLM implementation
└── migrations/
```

### 4.2 Models

```python
# backend/prelabel/models.py

import uuid
from django.conf import settings
from django.db import models


class PreLabelConfig(models.Model):
    """Global or per-dataset pre-label configuration."""

    class ServiceChoice(models.TextChoices):
        AWS_COMPREHEND = "aws_comprehend", "AWS Comprehend PII"
        GOOGLE_DLP = "google_dlp", "Google Cloud DLP"
        PHI3_LLM = "phi3_llm", "Phi-3 LLM"
        MANUAL_IMPORT = "manual_import", "Manual JSON Import"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    service = models.CharField(max_length=50, choices=ServiceChoice.choices)
    is_enabled = models.BooleanField(default=True)
    confidence_threshold = models.FloatField(
        default=0.8,
        help_text="Minimum confidence score to include a pre-label (0.0 to 1.0)."
    )
    config_json = models.JSONField(
        default=dict, blank=True,
        help_text="Service-specific configuration (API keys, regions, model IDs, etc.)"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Pre-Label Configuration"

    def __str__(self):
        return f"{self.get_service_display()} (threshold={self.confidence_threshold})"


class PreLabelResult(models.Model):
    """Stores pre-label output for a single job."""

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(
        "datasets.Job", on_delete=models.CASCADE, related_name="prelabel_results"
    )
    config = models.ForeignKey(
        PreLabelConfig, on_delete=models.SET_NULL, null=True, related_name="results"
    )
    service_name = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    annotations = models.JSONField(
        default=list,
        help_text="List of detected entities in the standard pre-label format."
    )
    entity_count = models.IntegerField(default=0)
    confidence_threshold = models.FloatField(default=0.8)
    error_message = models.TextField(blank=True, default="")
    processing_time_ms = models.IntegerField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        # One result per service per job
        unique_together = [["job", "service_name"]]

    def __str__(self):
        return f"PreLabel({self.service_name}) for {self.job_id} - {self.status}"
```

### 4.3 Service Registry

```python
# backend/prelabel/services/registry.py

from .base import BasePreLabelService

_registry: dict[str, type[BasePreLabelService]] = {}


def register_service(service_class: type[BasePreLabelService]):
    """Register a pre-label service class."""
    _registry[service_class.name] = service_class
    return service_class


def get_service(name: str) -> BasePreLabelService | None:
    """Get an instance of a registered service by name."""
    cls = _registry.get(name)
    return cls() if cls else None


def list_services() -> list[dict]:
    """List all registered services with availability status."""
    return [
        {
            "name": cls.name,
            "display_name": cls.display_name,
            "available": cls().is_available(),
        }
        for cls in _registry.values()
    ]
```

### 4.4 API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/prelabel/services/` | ADMIN | List available pre-label services |
| `GET` | `/api/prelabel/config/` | ADMIN | Get current pre-label configuration |
| `PUT` | `/api/prelabel/config/` | ADMIN | Update pre-label configuration |
| `POST` | `/api/prelabel/run/` | ADMIN | Trigger pre-labeling for selected jobs |
| `POST` | `/api/prelabel/import/` | ADMIN | Import pre-labels from JSON file |
| `GET` | `/api/prelabel/jobs/{job_id}/` | ADMIN, ANNOTATOR | Get pre-label results for a job |
| `GET` | `/api/prelabel/jobs/{job_id}/status/` | ADMIN, ANNOTATOR | Poll pre-label processing status |
| `DELETE` | `/api/prelabel/jobs/{job_id}/` | ADMIN | Delete pre-labels for a job |
| `POST` | `/api/prelabel/datasets/{dataset_id}/run/` | ADMIN | Run pre-labeling on all UPLOADED jobs in dataset |
| `GET` | `/api/prelabel/datasets/{dataset_id}/status/` | ADMIN | Batch status for dataset pre-labeling |

#### Key Endpoint Details

**POST `/api/prelabel/run/`** — Trigger pre-labeling

```json
// Request
{
  "job_ids": ["uuid1", "uuid2"],
  "service": "aws_comprehend",
  "confidence_threshold": 0.8
}

// Response
{
  "queued": 2,
  "results": [
    { "job_id": "uuid1", "status": "PENDING" },
    { "job_id": "uuid2", "status": "PENDING" }
  ]
}
```

**POST `/api/prelabel/import/`** — Import pre-labels from JSON

```json
// Request (multipart/form-data)
// - file: JSON file in bulk import format
// - dataset_id: UUID of the target dataset
// - confidence_threshold: float (optional, default 0.8)

// Response
{
  "imported": 15,
  "skipped": 2,
  "errors": [
    { "file_name": "unknown.eml", "error": "No matching job found" }
  ]
}
```

**GET `/api/prelabel/jobs/{job_id}/`** — Get pre-labels for annotation workspace

```json
// Response
{
  "id": "uuid",
  "job_id": "uuid",
  "service_name": "aws_comprehend",
  "status": "COMPLETED",
  "entity_count": 8,
  "confidence_threshold": 0.8,
  "annotations": [
    {
      "class_name": "email",
      "display_label": "Email",
      "tag": "",
      "start_offset": 152,
      "end_offset": 178,
      "original_text": "john.smith@example.com",
      "confidence": 0.97
    }
  ],
  "created_at": "2026-02-08T12:00:00Z"
}
```

### 4.5 Offset Validation

The backend validates every imported pre-label against the actual file content:

```python
# backend/prelabel/validators.py

def validate_prelabel_annotations(annotations: list[dict], raw_content: str) -> list[dict]:
    """
    Validate pre-label annotations against the actual file content.
    Returns list of validation errors (empty = all valid).
    """
    errors = []
    for i, ann in enumerate(annotations):
        start = ann["start_offset"]
        end = ann["end_offset"]

        # Check bounds
        if start < 0 or end < 0 or start >= end:
            errors.append({"index": i, "error": f"Invalid offsets: [{start}, {end})"})
            continue
        if end > len(raw_content):
            errors.append({"index": i, "error": f"end_offset {end} exceeds content length {len(raw_content)}"})
            continue

        # Check text match
        actual_text = raw_content[start:end]
        if actual_text != ann["original_text"]:
            errors.append({
                "index": i,
                "error": f"Text mismatch at [{start}:{end}]: expected '{ann['original_text']}', got '{actual_text}'"
            })

    return errors
```

### 4.6 Processing Flow (Sync vs Async)

For small batches (< 10 jobs), the pre-labeling can run synchronously in the request. For larger batches, use background processing:

**Option A: Synchronous (Simple, no extra infra)**

```python
# backend/prelabel/views.py (simplified)

@transaction.atomic
def run_prelabel(self, request):
    job_ids = request.data["job_ids"]
    service_name = request.data["service"]
    service = get_service(service_name)

    jobs = Job.objects.filter(id__in=job_ids)
    results = []

    for job in jobs:
        with open(job.file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        entities = service.detect(raw_content)
        annotations = [
            {
                "class_name": e.class_name,
                "start_offset": e.start_offset,
                "end_offset": e.end_offset,
                "original_text": e.original_text,
                "confidence": e.confidence,
            }
            for e in entities
            if e.confidence >= threshold
        ]

        # Validate offsets
        errors = validate_prelabel_annotations(annotations, raw_content)
        # Filter out invalid annotations
        valid = [a for i, a in enumerate(annotations) if not any(e["index"] == i for e in errors)]

        PreLabelResult.objects.update_or_create(
            job=job, service_name=service_name,
            defaults={
                "status": PreLabelResult.Status.COMPLETED,
                "annotations": valid,
                "entity_count": len(valid),
            }
        )
        results.append({"job_id": str(job.id), "count": len(valid)})

    return Response({"results": results})
```

**Option B: Async with Celery/Django-Q (Recommended for production)**

Add a `tasks.py` that processes jobs in background workers. The API returns immediately with `PENDING` status, and the frontend polls for completion.

---

## 5. Frontend Design

### 5.1 New Feature Module: `prelabel`

```
frontend/src/features/prelabel/
├── api/
│   ├── prelabel-mapper.ts          # Type mapping
│   ├── get-prelabel-services.ts    # List available services
│   ├── get-prelabel-result.ts      # Get pre-labels for a job
│   ├── get-prelabel-status.ts      # Poll processing status
│   ├── run-prelabel.ts             # Trigger pre-labeling
│   ├── import-prelabels.ts         # Import JSON file
│   └── delete-prelabel.ts          # Remove pre-labels
└── components/
    ├── PreLabelConfigPanel.tsx      # Admin settings panel
    ├── PreLabelTriggerDialog.tsx    # Dialog to select service + run
    ├── PreLabelImportDialog.tsx     # Upload JSON pre-labels
    └── PreLabelStatusBadge.tsx      # Shows pre-label availability on jobs
```

### 5.2 TypeScript Types

```typescript
// frontend/src/types/enums.ts (additions)

export const PreLabelStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type PreLabelStatus = (typeof PreLabelStatus)[keyof typeof PreLabelStatus];

export const PreLabelService = {
  AWS_COMPREHEND: "aws_comprehend",
  GOOGLE_DLP: "google_dlp",
  PHI3_LLM: "phi3_llm",
  MANUAL_IMPORT: "manual_import",
} as const;
export type PreLabelService = (typeof PreLabelService)[keyof typeof PreLabelService];
```

```typescript
// frontend/src/types/models.ts (additions)

export interface PreLabelAnnotation {
  className: string;
  displayLabel: string;
  tag: string;
  startOffset: number;
  endOffset: number;
  originalText: string;
  confidence: number;
}

export interface PreLabelResult {
  id: string;
  jobId: string;
  serviceName: string;
  status: PreLabelStatus;
  entityCount: number;
  confidenceThreshold: number;
  annotations: PreLabelAnnotation[];
  createdAt: string;
}

export interface PreLabelServiceInfo {
  name: string;
  displayName: string;
  available: boolean;
}
```

### 5.3 Annotation Workspace Integration

The key UI change is in `useAnnotationWorkspace` hook — when a job has pre-labels and the annotator has not yet started working, load the pre-labels as initial annotations:

```typescript
// In useAnnotationWorkspace.ts — initialization logic (pseudocode)

// 1. Check for existing draft (highest priority — user's in-progress work)
// 2. Check for existing annotation versions (rework or previously submitted)
// 3. Check for pre-label results (NEW — auto-suggestions)
// 4. Start with empty annotations (fallback)

const { data: preLabelResult } = usePreLabelResult(jobId);

useEffect(() => {
  if (draft?.annotations?.length) {
    // Load from draft (user already started editing)
    setAnnotations(mapDraftAnnotations(draft.annotations));
  } else if (job?.latestAnnotations?.length) {
    // Load from previous submission (rework)
    setAnnotations(mapSubmittedAnnotations(job.latestAnnotations));
  } else if (preLabelResult?.status === "COMPLETED" && preLabelResult.annotations.length) {
    // Load pre-labels as initial suggestions
    const preLabelAnnotations = mapPreLabelAnnotations(
      preLabelResult.annotations,
      annotationClasses  // resolve class_name → class UUID + color
    );
    setAnnotations(preLabelAnnotations);
    setIsDirty(true);  // Mark as dirty so user knows there are unsaved pre-labels
  }
}, [draft, job, preLabelResult]);
```

**Visual Differentiation**: Pre-labeled annotations could show a small indicator (e.g., a sparkle icon or slightly different highlight opacity) in the `RawContentViewer` and `AnnotationsListTab` so annotators can distinguish machine-generated from human annotations. Once the annotator edits or submits, the source distinction is no longer tracked (they become regular annotations).

**Confidence Filtering**: The right panel could include a confidence slider allowing annotators to hide low-confidence pre-labels and focus on high-confidence ones:

```
┌─────────────────────────────────────┐
│ Annotations (12)   [Auto-labeled]   │
│                                     │
│ Confidence: [========|--] 0.85      │
│                                     │
│ ● EMAIL_1: john@example.com  0.97   │
│ ● PHONE_1: +1-555-0123      0.94   │
│ ● NAME_1: John Smith         0.89   │
│ ○ CITY_1: Springfield        0.72   │  ← below threshold, dimmed
│                                     │
└─────────────────────────────────────┘
```

### 5.4 Admin UI Integration Points

#### Dataset Detail Page

After uploading a dataset, the admin sees a new action button:

```
┌─────────────────────────────────────────────────┐
│ Dataset: Medical Emails Q4           READY       │
│ 150 files                                        │
│                                                  │
│ [Assign Jobs]  [Run Pre-Label ▾]  [Export]       │
│                                                  │
│ Pre-Label Status: 142/150 completed (3 failed)   │
│ Service: AWS Comprehend | Threshold: 0.80        │
└─────────────────────────────────────────────────┘
```

The **"Run Pre-Label"** dropdown shows available services:
- AWS Comprehend PII
- Google Cloud DLP
- Phi-3 LLM (Local)
- Import from JSON...

#### Job Assignment Table

The jobs table gains a "Pre-Label" column showing status per job:

| File Name | Status | Pre-Label | Annotator | QA |
|-----------|--------|-----------|-----------|-----|
| email_001.eml | UPLOADED | Completed (8) | — | — |
| email_002.eml | UPLOADED | Completed (3) | — | — |
| email_003.eml | ASSIGNED | Completed (12) | Alice | — |
| email_004.eml | UPLOADED | Failed | — | — |
| email_005.eml | UPLOADED | — | — | — |

#### Settings Page

The existing `/admin/settings` page gains a "Pre-Label Services" section:

```
┌─────────────────────────────────────────────────┐
│ Pre-Label Services                               │
│                                                  │
│ Default Service: [AWS Comprehend PII ▾]          │
│ Confidence Threshold: [0.80]                     │
│ Auto-run on upload: [ ] (checkbox)               │
│                                                  │
│ Service Configuration:                           │
│ ┌─────────────────────────────────────────┐      │
│ │ AWS Comprehend                          │      │
│ │ Region: [us-east-1]                     │      │
│ │ Status: ✓ Connected                     │      │
│ ├─────────────────────────────────────────┤      │
│ │ Google Cloud DLP                        │      │
│ │ Project ID: [my-project]                │      │
│ │ Status: ✗ Not configured                │      │
│ ├─────────────────────────────────────────┤      │
│ │ Phi-3 LLM (Local)                      │      │
│ │ Model Path: [/models/phi3-mini]         │      │
│ │ Status: ✓ Available                     │      │
│ └─────────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

---

## 6. Pre-Label Services

### 6.1 AWS Comprehend PII Detection

[AWS Comprehend PII](https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html) is a managed NLP service that detects PII entities in text.

```python
# backend/prelabel/services/aws_comprehend.py

import boto3
from django.conf import settings
from .base import BasePreLabelService, DetectedEntity
from .registry import register_service


# Map AWS Comprehend PII entity types → our AnnotationClass names
AWS_CLASS_MAPPING = {
    "EMAIL": "email",
    "PHONE": "phone",
    "NAME": "full_name_person",
    "ADDRESS": "address",
    "CREDIT_DEBIT_NUMBER": "card_number",
    "BANK_ACCOUNT_NUMBER": "account_number",
    # AWS types we may not have a class for (skip or map to nearest):
    # "SSN", "PASSPORT_NUMBER", "DRIVER_ID", "DATE_TIME", "IP_ADDRESS", "URL", etc.
}


@register_service
class AWSComprehendService(BasePreLabelService):
    name = "aws_comprehend"
    display_name = "AWS Comprehend PII"

    def __init__(self):
        self.region = getattr(settings, "AWS_COMPREHEND_REGION", "us-east-1")
        self.language = getattr(settings, "AWS_COMPREHEND_LANGUAGE", "en")

    def is_available(self) -> bool:
        try:
            client = boto3.client("comprehend", region_name=self.region)
            # Quick check — list endpoints (no-op, validates credentials)
            client.list_endpoints(MaxResults=1)
            return True
        except Exception:
            return False

    def detect(self, raw_content: str) -> list[DetectedEntity]:
        client = boto3.client("comprehend", region_name=self.region)

        # AWS Comprehend has a 100KB limit per request — chunk if needed
        entities = []
        chunk_size = 99_000  # leave margin
        for offset in range(0, len(raw_content), chunk_size):
            chunk = raw_content[offset : offset + chunk_size]
            response = client.detect_pii_entities(
                Text=chunk, LanguageCode=self.language
            )
            for entity in response["Entities"]:
                class_name = AWS_CLASS_MAPPING.get(entity["Type"])
                if not class_name:
                    continue

                start = entity["BeginOffset"] + offset
                end = entity["EndOffset"] + offset

                entities.append(
                    DetectedEntity(
                        class_name=class_name,
                        start_offset=start,
                        end_offset=end,
                        original_text=raw_content[start:end],
                        confidence=entity["Score"],
                    )
                )

        return entities

    def get_class_mapping(self) -> dict[str, str]:
        return AWS_CLASS_MAPPING
```

**Django Settings for AWS Comprehend:**

```python
# backend/config/settings.py (additions)

# Pre-Label: AWS Comprehend
AWS_COMPREHEND_REGION = env("AWS_COMPREHEND_REGION", default="us-east-1")
AWS_COMPREHEND_LANGUAGE = env("AWS_COMPREHEND_LANGUAGE", default="en")
# AWS credentials via standard boto3 mechanisms:
# - Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# - IAM role (if running on AWS)
# - ~/.aws/credentials file
```

**Dependencies**: `pip install boto3` (add to `pyproject.toml`)

### 6.2 Google Cloud DLP (De-identification)

[Google Cloud DLP](https://cloud.google.com/sensitive-data-protection/docs/apis) provides infoType detectors for PII in text.

```python
# backend/prelabel/services/google_dlp.py

import google.cloud.dlp_v2 as dlp
from django.conf import settings
from .base import BasePreLabelService, DetectedEntity
from .registry import register_service


GOOGLE_CLASS_MAPPING = {
    "EMAIL_ADDRESS": "email",
    "PHONE_NUMBER": "phone",
    "PERSON_NAME": "full_name_person",
    "FIRST_NAME": "first_name_person",
    "LAST_NAME": "last_name_person",
    "STREET_ADDRESS": "address",
    "CREDIT_CARD_NUMBER": "card_number",
    "US_BANK_ROUTING_MICR": "account_number",
    # Also available: US_SOCIAL_SECURITY_NUMBER, PASSPORT, DATE_OF_BIRTH, etc.
}


@register_service
class GoogleDLPService(BasePreLabelService):
    name = "google_dlp"
    display_name = "Google Cloud DLP"

    def __init__(self):
        self.project_id = getattr(settings, "GOOGLE_DLP_PROJECT_ID", "")

    def is_available(self) -> bool:
        if not self.project_id:
            return False
        try:
            client = dlp.DlpServiceClient()
            # Validate by calling a lightweight API
            client.list_info_types(request={"parent": f"projects/{self.project_id}"})
            return True
        except Exception:
            return False

    def detect(self, raw_content: str) -> list[DetectedEntity]:
        client = dlp.DlpServiceClient()
        parent = f"projects/{self.project_id}"

        inspect_config = {
            "info_types": [
                {"name": info_type}
                for info_type in GOOGLE_CLASS_MAPPING.keys()
            ],
            "min_likelihood": "POSSIBLE",
            "include_quote": True,
        }
        item = {"value": raw_content}

        response = client.inspect_content(
            request={"parent": parent, "inspect_config": inspect_config, "item": item}
        )

        entities = []
        for finding in response.result.findings:
            class_name = GOOGLE_CLASS_MAPPING.get(finding.info_type.name)
            if not class_name:
                continue

            # Google DLP provides location with byte offsets
            for location in finding.location.content_locations:
                char_range = location.code_point_range
                start = char_range.start
                end = char_range.end

                entities.append(
                    DetectedEntity(
                        class_name=class_name,
                        start_offset=start,
                        end_offset=end,
                        original_text=raw_content[start:end],
                        confidence=finding.likelihood / 5.0,  # VERY_UNLIKELY=1 to VERY_LIKELY=5
                    )
                )

        return entities

    def get_class_mapping(self) -> dict[str, str]:
        return GOOGLE_CLASS_MAPPING
```

**Django Settings for Google DLP:**

```python
# backend/config/settings.py (additions)

# Pre-Label: Google Cloud DLP
GOOGLE_DLP_PROJECT_ID = env("GOOGLE_DLP_PROJECT_ID", default="")
# Google credentials via standard mechanisms:
# - GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account JSON
# - Application Default Credentials (if on GCP)
```

**Dependencies**: `pip install google-cloud-dlp` (add to `pyproject.toml`)

### 6.3 Phi-3 LLM (Local Model — Future)

A local LLM-based approach using Microsoft's Phi-3 (or similar small model) for PII detection without sending data to cloud services.

```python
# backend/prelabel/services/phi3_llm.py

import json
import re
from .base import BasePreLabelService, DetectedEntity
from .registry import register_service


SYSTEM_PROMPT = """You are a PII detection assistant. Given email text, identify all
Personally Identifiable Information (PII) entities. For each entity found, output a
JSON array of objects with these fields:
- "type": one of ["EMAIL", "PHONE", "FULL_NAME", "FIRST_NAME", "LAST_NAME", "ADDRESS", "CITY", "STATE", "ZIP", "CARD_NUMBER", "ACCOUNT_NUMBER"]
- "text": the exact text span as it appears in the input
- "start": character offset where the entity starts
- "end": character offset where the entity ends

Output ONLY the JSON array, no other text."""


PHI3_CLASS_MAPPING = {
    "EMAIL": "email",
    "PHONE": "phone",
    "FULL_NAME": "full_name_person",
    "FIRST_NAME": "first_name_person",
    "LAST_NAME": "last_name_person",
    "ADDRESS": "address",
    "CITY": "city",
    "STATE": "state",
    "ZIP": "zip_code",
    "CARD_NUMBER": "card_number",
    "ACCOUNT_NUMBER": "account_number",
}


@register_service
class Phi3LLMService(BasePreLabelService):
    name = "phi3_llm"
    display_name = "Phi-3 LLM (Local)"

    def __init__(self):
        self.model_path = getattr(settings, "PHI3_MODEL_PATH", "")
        self._model = None

    def is_available(self) -> bool:
        if not self.model_path:
            return False
        try:
            # Check if model files exist and transformers is installed
            import transformers  # noqa: F401
            import os
            return os.path.isdir(self.model_path)
        except ImportError:
            return False

    def _load_model(self):
        if self._model is None:
            from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
            tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            model = AutoModelForCausalLM.from_pretrained(self.model_path)
            self._model = pipeline("text-generation", model=model, tokenizer=tokenizer)
        return self._model

    def detect(self, raw_content: str) -> list[DetectedEntity]:
        pipe = self._load_model()

        # Truncate if too long for the model context window
        max_chars = 8000
        truncated = raw_content[:max_chars]

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": truncated},
        ]

        output = pipe(messages, max_new_tokens=2048, temperature=0.1)
        response_text = output[0]["generated_text"]

        # Parse JSON from response
        try:
            # Find JSON array in response
            match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if not match:
                return []
            raw_entities = json.loads(match.group())
        except (json.JSONDecodeError, AttributeError):
            return []

        entities = []
        for ent in raw_entities:
            class_name = PHI3_CLASS_MAPPING.get(ent.get("type", ""))
            if not class_name:
                continue

            start = ent.get("start", 0)
            end = ent.get("end", 0)
            text = ent.get("text", "")

            # Verify the text actually exists at the given offsets
            if raw_content[start:end] == text:
                entities.append(
                    DetectedEntity(
                        class_name=class_name,
                        start_offset=start,
                        end_offset=end,
                        original_text=text,
                        confidence=0.75,  # LLM doesn't provide calibrated scores
                    )
                )
            else:
                # Try to find the text in the content as fallback
                idx = raw_content.find(text)
                if idx >= 0:
                    entities.append(
                        DetectedEntity(
                            class_name=class_name,
                            start_offset=idx,
                            end_offset=idx + len(text),
                            original_text=text,
                            confidence=0.60,  # Lower confidence for re-located text
                        )
                    )

        return entities

    def get_class_mapping(self) -> dict[str, str]:
        return PHI3_CLASS_MAPPING
```

**Django Settings for Phi-3:**

```python
# backend/config/settings.py (additions)

# Pre-Label: Phi-3 LLM
PHI3_MODEL_PATH = env("PHI3_MODEL_PATH", default="")
# Path to local model directory (e.g., "/models/microsoft/Phi-3-mini-4k-instruct")
```

**Dependencies**: `pip install transformers torch` (add to `pyproject.toml`, only if using local LLM)

### 6.4 Adding a Custom Service

To add a new pre-label service, create a file in `backend/prelabel/services/` and implement the interface:

```python
# backend/prelabel/services/my_custom_service.py

from .base import BasePreLabelService, DetectedEntity
from .registry import register_service


@register_service
class MyCustomService(BasePreLabelService):
    name = "my_custom"
    display_name = "My Custom PII Detector"

    def is_available(self) -> bool:
        # Check if your service is reachable
        return True

    def detect(self, raw_content: str) -> list[DetectedEntity]:
        # Call your service, parse results, return DetectedEntity list
        entities = []
        # ... your detection logic ...
        return entities
```

The `@register_service` decorator automatically makes it available in the service registry. No other changes needed — it will appear in the admin UI service dropdown and API listings.

---

## 7. Integration Flow

### 7.1 Workflow: Admin Triggers Pre-Labeling

```
1. Admin uploads dataset (.zip of .eml files)
   └── System extracts → creates Jobs with status=UPLOADED

2. Admin clicks "Run Pre-Label" on dataset detail page
   └── Selects service (e.g., AWS Comprehend) + confidence threshold
   └── POST /api/prelabel/datasets/{dataset_id}/run/

3. Backend processes each job:
   a. Read raw .eml content from disk
   b. Call service.detect(raw_content)
   c. Map service entity types → AnnotationClass names
   d. Filter by confidence threshold
   e. Validate offsets against actual content
   f. Store PreLabelResult (status=COMPLETED or FAILED)

4. Admin assigns jobs to annotators (normal flow)
   └── Jobs table shows pre-label status per job

5. Annotator opens job in workspace
   └── Workspace loads pre-labels as initial annotations
   └── Annotator reviews, edits, adds, removes
   └── Submits as normal (creates AnnotationVersion)
```

### 7.2 Workflow: Admin Imports Pre-Labels from JSON

```
1. External system (or manual process) produces JSON file
   └── Uses the bulk import format from Section 2

2. Admin opens "Import Pre-Labels" dialog
   └── Selects dataset + uploads JSON file
   └── POST /api/prelabel/import/ (multipart)

3. Backend processes import:
   a. Parse JSON, validate schema
   b. Match file_name → Job records in the dataset
   c. For each matched job:
      - Read raw .eml content
      - Validate offsets against content
      - Store PreLabelResult
   d. Report imported/skipped/error counts

4. Continue with normal workflow (assign → annotate → QA)
```

### 7.3 Workflow: Auto Pre-Label on Upload (Optional)

If enabled in settings, pre-labeling runs automatically after dataset extraction:

```
1. Admin uploads dataset
2. System extracts .eml files → creates Jobs
3. System automatically triggers pre-labeling with default service
4. Admin sees dataset with pre-label progress
5. Once pre-labeling complete, admin assigns jobs
```

---

## 8. Implementation Plan

### Phase 1: Backend Foundation

1. Create `prelabel` Django app (`python manage.py startapp prelabel`)
2. Define models: `PreLabelConfig`, `PreLabelResult`
3. Create and run migrations
4. Implement `BasePreLabelService` ABC and service registry
5. Implement `validators.py` (offset validation)
6. Implement manual JSON import endpoint (`POST /api/prelabel/import/`)
7. Implement pre-label result retrieval (`GET /api/prelabel/jobs/{job_id}/`)
8. Add URL configuration to `config/urls.py`
9. Tests for validators and import logic

### Phase 2: First Service (AWS Comprehend)

1. Implement `AWSComprehendService` with entity type mapping
2. Implement `POST /api/prelabel/run/` trigger endpoint
3. Implement `POST /api/prelabel/datasets/{dataset_id}/run/` batch endpoint
4. Add status polling endpoint
5. Add Django settings for AWS configuration
6. Integration tests with mocked AWS responses

### Phase 3: Frontend Integration

1. Add TypeScript types (`PreLabelResult`, `PreLabelAnnotation`, etc.)
2. Create `prelabel` feature module with API hooks
3. Modify `useAnnotationWorkspace` to load pre-labels as initial annotations
4. Add confidence indicator/filter to `AnnotationsListTab`
5. Add "Run Pre-Label" action to dataset detail page
6. Add "Import Pre-Labels" dialog
7. Add pre-label status column to jobs table
8. Add pre-label section to admin settings page

### Phase 4: Additional Services

1. Implement `GoogleDLPService`
2. Implement `Phi3LLMService` (or other local model)
3. Add service-specific configuration forms in admin settings
4. Add async processing support (Celery/Django-Q) for large batches

### Phase 5: Polish

1. Auto pre-label on upload (optional setting)
2. Pre-label statistics on dashboard (entities detected, confidence distribution)
3. Annotator metrics: time-to-annotate with vs. without pre-labels
4. Bulk re-run pre-labels (e.g., after adding new annotation classes)
