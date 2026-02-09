> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Dataset Management Module

## Purpose & Scope

Handles the upload, storage, extraction, and management of email datasets. An Admin uploads a `.zip` archive containing `.eml` files. The system stores the archive in MEDIA_ROOT, processes extraction via a Django view or Celery task to extract individual `.eml` files, and creates a Job record for each file. The module provides dataset listing, detail views, and deletion capabilities.

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-1 | Upload `.zip` of `.eml` files; system extracts and creates jobs |
| A-2 | View datasets, job counts, status summaries |
| Workflow 3.1 | Dataset Upload & Job Creation |

## Components

### 1. DatasetListPage
- Paginated table of all datasets
- Columns: Name, Uploaded By, Upload Date, File Count, Status Summary (jobs by status), Actions
- Search by dataset name
- Bulk actions: Delete selected datasets
- "Upload Dataset" button opens DatasetUploadDialog
- Row click navigates to DatasetDetailPage
- Checkbox selection for bulk operations

### 2. DatasetDetailPage
- Header: Dataset name, uploader, upload date, total file count
- Status summary cards: count of jobs in each status (UPLOADED, ASSIGNED, IN_PROGRESS, ANNOTATED, etc.)
- Filterable/sortable jobs table:
  - Columns: File Name, Status, Assigned Annotator, Assigned QA, Created Date, Actions
  - Filter by status
  - Search by file name
  - Actions per job: View (opens email viewer), Assign (opens assignment), View History
- Assignment actions at dataset level (link to Job Assignment module)

### 3. DatasetUploadDialog (Modal)
- **Dataset Name** — text input (required, must be unique)
- **File Drop Zone** — drag-and-drop area or file browser for `.zip` file
  - Validates file extension (`.zip` only)
  - Shows file name and size after selection
- **Upload Progress** — progress bar during server upload
- **Extraction Status** — real-time status as backend processes the archive:
  - "Uploading..." → "Extracting..." → "Creating jobs..." → "Complete (N files)"
  - Error state if extraction fails (invalid zip, no .eml files found)
- Upload button disabled until name and file are provided

### 4. DatasetDeleteConfirmDialog
- Shows dataset name, file count
- Warns that deletion removes all associated jobs, annotations, and versions
- Requires typing dataset name to confirm (destructive action)

## Data Flow

### Upload Flow
```
Admin fills dataset name + selects .zip file
        │
        ▼
Frontend sends multipart POST request with .zip file
(progress bar tracks upload % via XMLHttpRequest/axios)
        │
        ▼
API: POST /api/datasets/upload/
  Input: { name, file (multipart) }
        │
        ▼
Backend saves .zip to MEDIA_ROOT, creates Dataset record (status: PROCESSING)
        │
        ▼
Backend triggers extraction (inline or via Celery task)
        │
        ▼
Extraction logic:
  ├─ Reads .zip from MEDIA_ROOT
  ├─ Validates archive (rejects if no .eml files)
  ├─ For each .eml file:
  │     ├─ Reads raw content as string
  │     ├─ Stores raw .eml to MEDIA_ROOT: datasets/{datasetId}/{filename}
  │     └─ Creates Job record:
  │           { dataset_id, file_name, file_path, status: UPLOADED }
  ├─ Updates Dataset: { status: READY, file_count: N }
  └─ On error: Updates Dataset: { status: ERROR, error_message }
        │
        ▼
Frontend polls for dataset status via GET /api/datasets/{id}/status/
        │
        ▼
DatasetUploadDialog shows completion or error
```

### Deletion Flow
```
Admin clicks Delete → DatasetDeleteConfirmDialog
        │
        ▼
Admin types dataset name to confirm
        │
        ▼
API: deleteDataset mutation
        │
        ▼
Backend:
  ├─ Validates no jobs are IN_PROGRESS or QA_IN_PROGRESS
  ├─ Deletes all Annotations → AnnotationVersions → QAReviewVersions → Jobs
  ├─ Deletes media files (zip + extracted .eml files)
  └─ Deletes Dataset record
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| DatasetListPage | DatasetUploadDialog | Opens upload dialog |
| DatasetUploadDialog | API | Multipart POST upload to `/api/datasets/upload/` |
| Django View | FileSystemStorage | Saves .zip, extracts individual .eml files to MEDIA_ROOT |
| Django View / Celery Task | Django ORM | Creates Job records, updates Dataset status |
| DatasetDetailPage | Job Assignment Module | Links to assignment interface filtered by dataset |
| DatasetDetailPage | Version History Module | Links to job version history |
| DatasetDetailPage | Annotation/QA Interface | Links to view/annotate/review individual jobs |
| Admin Dashboard | Dataset Management | Shows recent datasets summary |

## State Management

### Dataset List State
```typescript
interface DatasetListState {
  datasets: DatasetSummary[];
  loading: boolean;
  search: string;
  selectedIds: string[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };
  uploadDialogOpen: boolean;
}

interface DatasetSummary {
  id: string;
  name: string;
  uploadedBy: string;
  uploadDate: string;
  fileCount: number;
  statusSummary: Record<JobStatus, number>;
}
```

### Dataset Detail State
```typescript
interface DatasetDetailState {
  dataset: Dataset;
  jobs: Job[];
  loading: boolean;
  filters: {
    status: JobStatus | 'ALL';
    search: string;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };
}
```

### Upload State
```typescript
interface UploadState {
  datasetName: string;
  file: File | null;
  uploadProgress: number;        // 0-100
  extractionStatus: 'idle' | 'uploading' | 'extracting' | 'creating_jobs' | 'complete' | 'error';
  extractedCount: number;
  errorMessage: string | null;
}
```

### Data Models
```typescript
interface Dataset {
  id: string;
  name: string;
  uploadedBy: string;
  uploadDate: string;
  fileCount: number;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  filePath: string;
  errorMessage?: string;
}

type JobStatus = 'UPLOADED' | 'ASSIGNED' | 'IN_PROGRESS' | 'ANNOTATED'
  | 'QA_ASSIGNED' | 'QA_IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'DELIVERED';

interface Job {
  id: string;
  datasetId: string;
  fileName: string;
  status: JobStatus;
  assignedAnnotator?: string;
  assignedQA?: string;
  createdAt: string;
  updatedAt: string;
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/datasets/` | GET | `?search=&page=` | `{ results[], count }` | Summary with status counts |
| `/api/datasets/{id}/` | GET | — | `Dataset` | Full dataset details |
| `/api/datasets/{id}/jobs/` | GET | `?status=&search=&page=` | `{ results[], count }` | Filterable jobs list |
| `/api/jobs/{id}/` | GET | — | `Job` | Full job details including raw content file path |
| `/api/datasets/upload/` | POST | `{ name, file }` (multipart) | `Dataset` | Creates dataset record, triggers extraction |
| `/api/datasets/{id}/` | DELETE | — | `{ success }` | Cascading delete of all related records |

### Polling Endpoint
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/datasets/{id}/status/` | GET | — | `{ status, fileCount, errorMessage }` | Poll for extraction progress |

## Validation Rules

- Dataset name: required, 1–200 characters, unique
- Upload file: must be `.zip` extension, max 500MB
- Zip must contain at least one `.eml` file
- Non-`.eml` files in the archive are skipped (logged as warnings)
- Dataset cannot be deleted if any jobs are in IN_PROGRESS or QA_IN_PROGRESS status
