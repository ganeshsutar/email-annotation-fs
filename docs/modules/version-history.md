> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Version History Module

## Purpose & Scope

Provides a comprehensive audit trail for every job, displaying all AnnotationVersions and QAReviewVersions in a unified chronological timeline. Enables version comparison with a side-by-side diff view showing added, removed, and modified annotations between any two versions. Accessible to all roles (Admin, Annotator, QA) to maintain full transparency.

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-10 | View full version history (annotation + QA) for any job, with diffs between versions |
| AN-9 | View previous annotation versions and compare changes across submissions |
| QA-6 | View all annotation versions and QA review versions for a job; compare diffs |
| NF-5 | Audit trail — track who annotated, who reviewed, timestamps for all actions |

## Components

### 1. VersionHistoryPage
- Accessed from: Job detail, Annotation Interface, QA Interface, Dataset Detail
- Header: Job file name, dataset name, current job status
- Main content: VersionTimeline + VersionComparisonPanel

### 2. VersionTimeline (Left/Main)
- Vertical timeline mixing both AnnotationVersions and QAReviewVersions in chronological order
- Each timeline entry is a card showing:

  **AnnotationVersion card**:
  - Icon: pencil (annotator) or shield (QA-authored)
  - Title: "Annotation v{N}" (e.g., "Annotation v1")
  - Source badge: "ANNOTATOR" or "QA"
  - Author name
  - Timestamp
  - Annotation count
  - "View" button → loads annotations in diff panel
  - "Compare" button → selects this version for comparison

  **QAReviewVersion card**:
  - Icon: checkmark (ACCEPT) or X (REJECT)
  - Title: "QA Review v{N}"
  - Decision badge: "ACCEPTED" (green) or "REJECTED" (red)
  - Reviewer name
  - Timestamp
  - Comments (collapsible)
  - Modifications summary (if any)
  - "View Reviewed Annotations" link → loads the associated AnnotationVersion

### 3. VersionComparisonPanel (Right/Bottom)
- Side-by-side diff view comparing two selected versions
- **Version A selector**: dropdown of all AnnotationVersions
- **Version B selector**: dropdown of all AnnotationVersions
- Diff display:
  - **Added annotations** (in Version B but not A): green background
  - **Removed annotations** (in Version A but not B): red background with strikethrough
  - **Modified annotations** (same span range, different class or text): yellow background with change details
  - **Unchanged annotations**: no highlight (or gray)
- Each annotation row shows: Tag, Class, Original Text, Start Offset, End Offset, Status (Added/Removed/Modified/Unchanged)
- Summary counts: N added, N removed, N modified, N unchanged

### 4. VersionDetailView
- Modal or inline view showing all annotations for a single AnnotationVersion
- Table: Tag, Class (with color swatch), Original Text, Start Offset, End Offset
- "View in Raw Content" button — opens a read-only RawContentViewer with highlights for this version
- Metadata: version number, author, source, timestamp

## Data Flow

```
User navigates to Version History for a job
        │
        ▼
API: getVersionHistory query
  Input: { jobId }
  Output: {
    annotationVersions: AnnotationVersion[],
    qaReviewVersions: QAReviewVersion[]
  }
        │
        ▼
Merge and sort all versions chronologically
        │
        ▼
Render VersionTimeline
        │
        ▼
User selects two versions to compare
        │
        ▼
API: getAnnotationsForVersion (×2)
  Input: { annotationVersionId }
  Output: { annotations: Annotation[] }
        │
        ▼
Frontend computes diff:
  1. Build map of annotations by (start_offset, end_offset) for each version
  2. For each annotation in Version B:
     ├─ Exists in Version A with same class → UNCHANGED
     ├─ Exists in Version A with different class → MODIFIED
     └─ Not in Version A → ADDED
  3. For each annotation in Version A not in Version B → REMOVED
        │
        ▼
Render VersionComparisonPanel with diff results
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| Annotation Interface | VersionHistoryPage | "View History" link |
| QA Interface | VersionHistoryPage | "View History" link |
| Dataset Detail (Admin) | VersionHistoryPage | Job row action "History" |
| VersionTimeline | VersionComparisonPanel | Selecting versions for comparison |
| VersionDetailView | RawContentViewer | "View in Raw Content" opens read-only viewer |

## State Management

### Version History State
```typescript
interface VersionHistoryState {
  jobId: string;
  jobInfo: {
    fileName: string;
    datasetName: string;
    status: JobStatus;
  };
  annotationVersions: AnnotationVersionSummary[];
  qaReviewVersions: QAReviewVersionSummary[];
  timelineEntries: TimelineEntry[];       // merged & sorted
  comparison: {
    versionAId: string | null;
    versionBId: string | null;
    versionAAnnotations: Annotation[];
    versionBAnnotations: Annotation[];
    diffResult: DiffResult | null;
  };
  loading: boolean;
  detailViewOpen: boolean;
  detailVersionId: string | null;
}

interface TimelineEntry {
  type: 'ANNOTATION_VERSION' | 'QA_REVIEW_VERSION';
  timestamp: string;
  data: AnnotationVersionSummary | QAReviewVersionSummary;
}

interface AnnotationVersionSummary {
  id: string;
  versionNumber: number;
  createdBy: string;
  authorName: string;
  source: 'ANNOTATOR' | 'QA';
  annotationCount: number;
  createdAt: string;
}

interface QAReviewVersionSummary {
  id: string;
  versionNumber: number;
  annotationVersionId: string;
  reviewedBy: string;
  reviewerName: string;
  decision: 'ACCEPT' | 'REJECT';
  comments: string;
  modificationsSummary: string;
  reviewedAt: string;
}

interface DiffResult {
  added: Annotation[];
  removed: Annotation[];
  modified: { before: Annotation; after: Annotation }[];
  unchanged: Annotation[];
  summary: {
    addedCount: number;
    removedCount: number;
    modifiedCount: number;
    unchangedCount: number;
  };
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/history/jobs/{jobId}/` | GET | — | `{ annotationVersions[], qaReviewVersions[] }` | All versions for a job |
| `/api/history/versions/{annotationVersionId}/annotations/` | GET | — | `{ annotations[] }` | Full annotation set for a specific version |

### Diff Algorithm

The comparison is computed client-side:

1. **Build lookup maps** for both versions, keyed by `(start_offset, end_offset)` tuple
2. **Compare Version A → Version B**:
   - Same offsets, same class → `UNCHANGED`
   - Same offsets, different class → `MODIFIED`
   - Offsets only in Version A → `REMOVED`
3. **Compare Version B → Version A**:
   - Offsets only in Version B → `ADDED`
4. **Sort diff results** by start_offset ascending for display

### Access Control
- **Admin**: Can view version history for any job
- **Annotator**: Can view version history for their own assigned jobs
- **QA**: Can view version history for jobs they've reviewed or are assigned to review
