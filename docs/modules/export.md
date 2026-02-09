> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Export Module

## Purpose & Scope

Enables Admins to export QA-accepted (DELIVERED) jobs as de-identified `.eml` files. During export, all annotated PII spans in the raw email content are replaced with their corresponding tags (e.g., `[email_1]`). The module provides dataset-level export, an export preview (side-by-side comparison), and an export history with download links. Replacement uses a descending-offset algorithm to prevent character shifting.

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-8 | Export delivered (QA-accepted) jobs as de-identified `.eml` files |
| Section 9 | Export Format — replacement pattern, output filenames |
| Workflow 3.5 | Delivery & Export |

## Components

### 1. ExportPage
- Dataset selector dropdown (shows datasets with at least one DELIVERED job)
- Delivered jobs table for selected dataset
- Export controls and preview
- Export history section

### 2. DeliveredJobsTable
- Table of DELIVERED jobs in the selected dataset
- Columns: Checkbox, File Name, Annotator, QA Reviewer, Annotation Count, Delivered Date
- Select All / individual checkboxes for export selection
- Shows count of selected jobs vs total delivered

### 3. ExportPreview (Side-by-Side)
- Triggered by "Preview" button after selecting a job
- Two-panel view:
  - **Left: Original** — raw `.eml` content with PII highlighted (colored spans)
  - **Right: De-identified** — same `.eml` with PII replaced by tags
- Highlights corresponding replacements in matching colors
- Scrolls are synchronized between panels
- Shows annotation count and replacement summary

### 4. ExportControls
- "Preview" button — opens ExportPreview for a single selected job
- "Export Selected" button — exports checked jobs as `.zip`
- "Export All" button — exports all delivered jobs in dataset
- Progress indicator during export generation

### 5. ExportHistoryTable
- Table of previous exports
- Columns: Export Date, Dataset Name, Job Count, File Size, Exported By, Download Link
- Download link generates a fresh download URL
- Sorted by date descending (most recent first)

## Data Flow

### Export Generation
```
Admin selects dataset → delivered jobs load
        │
        ▼
Admin selects jobs (checkboxes) → clicks "Export Selected"
        │
        ▼
API: exportJobs mutation
  Input: { jobIds[] }
        │
        ▼
Backend (Django view):
  For each job:
  ├─ Load raw_content (original .eml string)
  ├─ Load latest AnnotationVersion (the accepted one)
  ├─ Load all Annotations for that version
  │
  ├─ Sort annotations by start_offset DESCENDING
  │     (Critical: replacing from end to start prevents offset shifting)
  │
  ├─ For each annotation (in descending offset order):
  │     content = content.substring(0, start_offset)
  │               + tag                              // e.g., "[email_1]"
  │               + content.substring(end_offset)
  │
  ├─ Output filename: REDACTED_{jobId}_{originalFilename}
  │     Example: REDACTED_828_A000186_t1_1.eml
  │
  └─ Write de-identified .eml to MEDIA_ROOT: exports/{exportId}/{filename}
        │
        ▼
Create ExportRecord: { id, datasetId, jobCount, filePath, exportedBy, exportedAt }
        │
        ▼
Package all .eml files into a .zip archive in MEDIA_ROOT
        │
        ▼
Return download URL (Django file serving endpoint)
        │
        ▼
Browser initiates download of .zip file
```

### Preview Flow
```
Admin selects a job → clicks "Preview"
        │
        ▼
API: getExportPreview query
  Input: { jobId }
        │
        ▼
Backend:
  ├─ Loads raw_content + latest AnnotationVersion annotations
  ├─ Generates de-identified content (same algorithm as export)
  └─ Returns { original: string, deidentified: string, annotations[] }
        │
        ▼
ExportPreview renders side-by-side panels
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| Admin Dashboard | ExportPage | Quick action link |
| Sidebar Navigation | ExportPage | "Export" nav link |
| ExportPage | Django API | Download via file serving endpoint |
| ExportPage | API | `exportJobs`, `getExportPreview`, `listExports` |
| Dataset Detail | ExportPage | "Export Delivered" link (pre-selects dataset) |

## State Management

### Export Page State
```typescript
interface ExportPageState {
  selectedDatasetId: string | null;
  datasets: DatasetSummary[];        // only those with delivered jobs
  deliveredJobs: Job[];
  selectedJobIds: Set<string>;
  loading: boolean;
  exporting: boolean;
  exportProgress: number;            // 0-100
  previewOpen: boolean;
  previewData: ExportPreviewData | null;
  exportHistory: ExportRecord[];
}

interface ExportPreviewData {
  jobId: string;
  fileName: string;
  original: string;                  // raw .eml content
  deidentified: string;              // .eml with PII replaced by tags
  annotations: Annotation[];         // for highlight rendering
}

interface ExportRecord {
  id: string;
  datasetId: string;
  datasetName: string;
  jobCount: number;
  fileSize: number;
  exportedBy: string;
  exportedAt: string;
  downloadUrl: string;
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/exports/datasets/` | GET | — | `DatasetSummary[]` | Datasets having at least 1 DELIVERED job |
| `/api/exports/datasets/{datasetId}/jobs/` | GET | — | `Job[]` | All DELIVERED jobs in dataset |
| `/api/exports/preview/{jobId}/` | GET | — | `ExportPreviewData` | Original + de-identified content |
| `/api/exports/` | GET | `?dataset_id=` | `ExportRecord[]` | Export history, optionally filtered |
| `/api/exports/` | POST | `{ jobIds[] }` | `{ exportId, downloadUrl }` | Generates .zip, returns download URL |

## Offset-Descending Replacement Algorithm

The core export algorithm replaces PII spans with tags. **Annotations must be processed in descending `start_offset` order** to prevent character position shifting:

```
Given raw content: "Hello john.doe@email.com, my name is John Doe"
Annotations (sorted descending by start_offset):
  1. "John Doe"  at [38, 46] → [full_name_person_1]
  2. "john.doe@email.com" at [6, 24] → [email_1]

Step 1: Replace [38, 46] → "Hello john.doe@email.com, my name is [full_name_person_1]"
Step 2: Replace [6, 24]  → "Hello [email_1], my name is [full_name_person_1]"

If ascending order were used, the first replacement would shift all subsequent offsets.
```

## Output Format

Based on the example in `docs/output-format/REDACTED_828_A000186_t1_1.eml`:

- **Filename pattern**: `REDACTED_{jobId}_{originalFilename}`
- **Content**: Exact copy of original `.eml` with PII spans replaced by `[class_name_N]` tags
- **Headers preserved**: All email headers (Received, DKIM, etc.) are kept; PII within headers is also replaced
- **Encoding preserved**: Content-Transfer-Encoding and MIME boundaries are not modified; only the PII text values are swapped
- **Same-value consistency**: Multiple occurrences of the same PII value use the same tag (e.g., all `micheal.ucheh@gmail.com` become `[email_1]`)
