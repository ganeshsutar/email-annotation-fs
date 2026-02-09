# Annotation Versioning System

This document describes how annotation versions are stored, created, retrieved, and viewed in the Email PII De-Identification Annotation Platform.

---

## Table of Contents

1. [Data Model](#data-model)
2. [Version Creation Lifecycle](#version-creation-lifecycle)
3. [Access Control](#access-control)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Frontend Routes & UI](#frontend-routes--ui)
6. [Diff Algorithm](#diff-algorithm)
7. [Key Design Decisions](#key-design-decisions)

---

## Data Model

### AnnotationVersion (`backend/annotations/models.py`)

The primary versioning container. Each submission by an annotator creates a new immutable version.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `job` | FK → Job | The job this version belongs to |
| `version_number` | PositiveIntegerField | Sequential number per job (1, 2, 3...) |
| `created_by` | FK → User (nullable) | The user who created this version |
| `source` | CharField | `"ANNOTATOR"` or `"QA"` |
| `created_at` | DateTimeField | Timestamp (auto-set on creation) |

**Constraint:** `unique_together = [["job", "version_number"]]`

### Annotation (`backend/annotations/models.py`)

Individual PII annotations belonging to a version. Each version contains one or more annotations.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `annotation_version` | FK → AnnotationVersion | Parent version (CASCADE delete) |
| `annotation_class` | FK → AnnotationClass (nullable) | The PII class (e.g., NAME, EMAIL) |
| `class_name` | CharField | Denormalized class name |
| `tag` | CharField | Optional grouping tag (blank allowed) |
| `start_offset` | IntegerField | Start character offset in the email body |
| `end_offset` | IntegerField | End character offset in the email body |
| `original_text` | TextField | The selected text span |
| `created_at` | DateTimeField | Timestamp |

### DraftAnnotation (`backend/annotations/models.py`)

Temporary storage for unsaved work-in-progress. Drafts are **not** versions — they exist separately and are deleted upon submission.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `job` | OneToOneField → Job | One draft per job (CASCADE delete) |
| `annotations` | JSONField | List of annotation dicts |
| `updated_at` | DateTimeField | Last save timestamp (auto-updated) |

### QAReviewVersion (`backend/qa/models.py`)

QA review records linked to a specific annotation version.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique identifier |
| `job` | FK → Job | The reviewed job (CASCADE delete) |
| `version_number` | PositiveIntegerField | Sequential QA review number per job |
| `annotation_version` | FK → AnnotationVersion | The annotation version being reviewed |
| `reviewed_by` | FK → User (nullable) | The QA reviewer |
| `decision` | CharField | `"ACCEPT"` or `"REJECT"` |
| `comments` | TextField | Reviewer comments (blank allowed) |
| `modifications_summary` | TextField | Summary of modifications (blank allowed) |
| `reviewed_at` | DateTimeField | Timestamp (auto-set on creation) |

**Constraint:** `unique_together = [["job", "version_number"]]`

### Entity Relationships

```
Job
 ├── AnnotationVersion v1
 │    ├── Annotation (NAME, offset 10-25)
 │    ├── Annotation (EMAIL, offset 40-65)
 │    └── Annotation (PHONE, offset 80-92)
 ├── AnnotationVersion v2
 │    ├── Annotation (NAME, offset 10-25)
 │    └── Annotation (EMAIL, offset 40-68)  ← modified
 ├── QAReviewVersion (linked to v1, decision=REJECT)
 ├── QAReviewVersion (linked to v2, decision=ACCEPT)
 └── DraftAnnotation (temporary, deleted on submit)
```

---

## Version Creation Lifecycle

### Flow

```
Annotator edits annotations
        │
        ▼
  Save Draft ──► DraftAnnotation (overwritten each save, not a version)
        │
        ▼
  Submit Annotations
        │
        ├── 1. Find max version_number for the job
        ├── 2. Create AnnotationVersion (version_number = max + 1)
        ├── 3. Bulk-create all Annotation records under the new version
        ├── 4. Delete the DraftAnnotation
        └── 5. Update job status to SUBMITTED_FOR_QA
        │
        ▼
  QA Reviews the submission
        │
        ├── Creates QAReviewVersion linked to the AnnotationVersion
        └── Decision:
              ├── ACCEPT → Job status → QA_ACCEPTED / DELIVERED
              └── REJECT → Job status → QA_REJECTED
                              │
                              ▼
                    Annotator reworks (new drafts)
                              │
                              ▼
                    Submit again → AnnotationVersion v2
```

### Submit Endpoint (`backend/annotations/views.py`)

The `submit_annotation` action on the AnnotationViewSet:

1. Validates the job exists and the user is the assigned annotator.
2. Queries `max(version_number)` for the job's existing versions.
3. Creates a new `AnnotationVersion` with `version_number = max + 1`, `source = "ANNOTATOR"`.
4. Bulk-creates `Annotation` objects from the submitted data.
5. Deletes any existing `DraftAnnotation` for the job.
6. Sets job status to `SUBMITTED_FOR_QA`.

### Key Rules

- **Drafts do not create versions.** Saving a draft only upserts the `DraftAnnotation` record.
- **Versions are immutable.** Once created, an `AnnotationVersion` and its `Annotation` records are never modified.
- **Version numbers are sequential per job.** They always increment by 1.

---

## Access Control

All version history endpoints require authentication (`IsAuthenticated`) and a valid role (`IsAnyRole`).

The `_check_job_access(job, user)` method in `backend/history/views.py` enforces per-role access:

| Role | Can View Version History When... |
|------|----------------------------------|
| **Admin** | Always — can view any job's history |
| **Annotator** | Only if `job.assigned_annotator_id == user.id` |
| **QA** | If `job.assigned_qa_id == user.id` **OR** `job.qa_reviews.filter(reviewed_by=user).exists()` |

If access is denied, the API returns **403 Forbidden** with the message: `"You do not have access to this job's history."`

The same access check applies to all three history endpoints (version list, job info, and annotations for a version).

---

## Backend API Endpoints

All endpoints are defined in `backend/history/urls.py` and handled by `HistoryViewSet` in `backend/history/views.py`.

### GET `/api/history/jobs/{job_id}/`

Returns all annotation versions and QA reviews for a job.

**Response:**
```json
{
  "annotation_versions": [
    {
      "id": "uuid",
      "version_number": 1,
      "created_by": { "id": "uuid", "name": "John Doe" },
      "source": "ANNOTATOR",
      "annotation_count": 5,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "qa_review_versions": [
    {
      "id": "uuid",
      "version_number": 1,
      "annotation_version": "uuid",
      "reviewed_by": { "id": "uuid", "name": "Jane Smith" },
      "decision": "REJECT",
      "comments": "Missing phone number annotations.",
      "modifications_summary": "",
      "reviewed_at": "2025-01-15T14:00:00Z"
    }
  ]
}
```

### GET `/api/history/jobs/{job_id}/info/`

Returns job metadata for the version history page header.

**Response:**
```json
{
  "id": "uuid",
  "file_name": "email_001.eml",
  "dataset_name": "January Batch",
  "status": "QA_ACCEPTED",
  "created_at": "2025-01-10T08:00:00Z"
}
```

### GET `/api/history/versions/{version_id}/annotations/`

Returns all annotations for a specific version, ordered by `start_offset`.

**Response:**
```json
[
  {
    "id": "uuid",
    "annotation_class": "uuid",
    "class_name": "NAME",
    "class_color": "#FF5733",
    "class_display_label": "Person Name",
    "tag": "sender",
    "start_offset": 10,
    "end_offset": 25,
    "original_text": "John Doe",
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

`class_color` and `class_display_label` are computed from the related `AnnotationClass` record.

---

## Frontend Routes & UI

### Routes

Each role has a dedicated route, all rendering the same shared `VersionHistoryPage` component:

| Role | Route | Back Link |
|------|-------|-----------|
| Admin | `/admin/jobs/$jobId/history` | `/admin/datasets` |
| Annotator | `/annotator/jobs/$jobId/history` | `/annotator/dashboard` |
| QA | `/qa/jobs/$jobId/history` | `/qa/dashboard` |

**Route files:**
- `frontend/src/app/routes/admin/jobs/$jobId/history.tsx`
- `frontend/src/app/routes/annotator/jobs/$jobId/history.tsx`
- `frontend/src/app/routes/qa/jobs/$jobId/history.tsx`

### React Query Hooks

| Hook | Query Key | API Call | Notes |
|------|-----------|----------|-------|
| `useVersionHistory(jobId)` | `["version-history", jobId]` | `GET /api/history/jobs/{jobId}/` | Returns all versions + QA reviews |
| `useAnnotationsForVersion(versionId)` | `["version-history", "annotations", versionId]` | `GET /api/history/versions/{versionId}/annotations/` | Lazy-loaded; enabled only when `versionId` is set |
| `useJobInfo(jobId)` | `["version-history", "job-info", jobId]` | `GET /api/history/jobs/{jobId}/info/` | Job metadata for page header |

All hooks use the default 60-second stale time from React Query config.

### UI Components

Located in `frontend/src/features/version-history/components/`:

#### VersionHistoryPage

Main layout with a header (back button, job filename, dataset name, status badge) and a resizable two-panel view:

- **Left panel (35%):** Version Timeline
- **Right panel (65%):** Version Comparison Panel

#### VersionTimeline

Chronological list merging annotation versions and QA reviews, sorted newest-first. Each entry displays:

- **Annotation version entries:** Pencil icon (blue), version number, source badge (ANNOTATOR/QA), annotation count, creator name, timestamp. Buttons: "View" (opens detail dialog), "Compare" (loads into comparison panel).
- **QA review entries:** Check icon (green) for ACCEPT, X icon (red) for REJECT, reviewer name, timestamp, comments if present.
- **Job created entry:** File icon (gray) at the bottom of the timeline.

#### VersionComparisonPanel

Side-by-side diff viewer with two version selectors (Version A as "base", Version B as "compare"). Displays a change summary table with color-coded rows:

| Change Type | Color | Meaning |
|-------------|-------|---------|
| Added | Green | Annotation exists only in Version B |
| Removed | Red | Annotation exists only in Version A |
| Modified | Yellow | Same offset range, different class or tag |
| Unchanged | Gray | Identical in both versions |

Each diff row shows: change type badge, class color indicator, tag, original text (monospace, truncated), and start/end offsets. Modified rows show the previous class with strikethrough.

#### VersionDetailView

Dialog triggered by clicking "View" on a timeline entry. Shows:

- Version metadata header: version number, source badge, creator name, timestamp, annotation count.
- Table of all annotations in the version: tag, class (with color indicator), original text, start/end offsets.

---

## Diff Algorithm

Located in `frontend/src/features/version-history/utils/version-diff.ts`.

### Identity Key

Annotations are matched across versions by their **offset range**: `"{startOffset}-{endOffset}"`.

### Classification Logic

Given Version A and Version B:

1. Build a map of annotations by offset key for each version.
2. For each annotation in Version B:
   - If offset key not in A → **added**
   - If offset key in A but `classId` or `tag` differs → **modified** (includes previous values)
   - If offset key in A with same `classId` and `tag` → **unchanged**
3. For each annotation in Version A:
   - If offset key not in B → **removed**

### Output

```typescript
interface DiffResult {
  added: DiffEntry[];
  removed: DiffEntry[];
  modified: DiffEntry[];     // includes `previous` field with old class/tag
  unchanged: DiffEntry[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Immutable versions** | Full audit trail — no version is ever edited or deleted |
| **Drafts are separate** | Work-in-progress doesn't create noise in version history |
| **Sequential numbering per job** | Simple, predictable version identifiers (v1, v2, v3...) |
| **Source tracking on versions** | Distinguishes annotator submissions from QA modifications |
| **Offset-based diff identity** | Natural key for text annotations; detects class/tag changes at the same text span |
| **Lazy-loading annotations** | Annotations for a version are only fetched when the user clicks "View" or selects it for comparison |
| **Shared component across roles** | All three roles use the same `VersionHistoryPage`; only the back-navigation link differs |
| **QA review linked to annotation version** | Each review explicitly references which annotation version was reviewed |
