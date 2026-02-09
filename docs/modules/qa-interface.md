> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# QA Interface Module

## Purpose & Scope

The QA review workflow — where QA users verify, modify, and accept or reject annotations submitted by Annotators. QA users review the raw `.eml` content with highlighted annotations, can modify/add/remove annotations, and either accept (moving the job to DELIVERED) or reject (returning it to the Annotator with comments). Supports blind review mode where annotator identity is hidden.

## Related Requirements

| ID | Requirement |
|----|-------------|
| QA-1 | Dashboard — table of assigned QA jobs with status |
| QA-2 | Annotation review — view raw `.eml` with highlighted annotations and email preview |
| QA-3 | Modify annotations — adjust spans, change classes, add or remove annotations |
| QA-4 | Accept — approve annotation; job moves to Delivered |
| QA-5 | Reject — reject with comments; job returns to annotator for rework |
| QA-6 | Version history — view all annotation and QA review versions; compare diffs |
| A-9 | Blind review toggle — admin configures whether QA sees annotator identity |
| Workflow 3.4 | QA Workflow |

## Components

### 1. QAReviewWorkspace (Main Container)
- Two-panel split layout (mirrors Annotation Interface layout)
- Left panel: RawContentViewer (shared component) with annotation highlights
- Right panel: Tabbed panel with EmailViewer, EmailPreview, AnnotationsReviewList
- Top bar: Job info (file name, dataset, annotator name — if not blind review), job status
- Bottom bar: Accept button, Reject button, modification count
- Edit mode toggle: switches between read-only review and edit mode

### 2. RawContentViewer (Left Panel — shared component)
- Same component as Annotation Interface, displaying raw `.eml` with colored highlights
- In **review mode** (default): clicking a span shows annotation details + status controls
- In **edit mode**: text selection enabled for adding new annotations, existing spans editable
- Per-annotation status indicators: OK (green check), Flagged (yellow warning), QA-added (blue plus)

### 3. AnnotationReviewPopover
- Appears when clicking an annotated span in review mode
- Shows: class name, tag, original text, start/end offsets
- Actions:
  - **Mark OK** — annotation looks correct (visual indicator only)
  - **Flag** — mark for review/comment (yellow highlight)
  - **Edit** — change class or adjust span boundaries
  - **Delete** — remove this annotation (tracked as QA modification)

### 4. EditModeControls
- Toggle button: "Enable Editing" / "Disable Editing"
- When enabled:
  - Text selection in RawContentViewer triggers ClassSelectionPopup (same as Annotation Interface)
  - Can add new annotations (marked as QA-added)
  - Can modify existing annotation spans
  - All changes tracked as QA modifications
- Modification counter badge showing number of changes made

### 5. AnnotationsReviewListTab (Right Panel Tab)
- Enhanced version of the AnnotationsListTab from annotation interface
- Additional columns: Status (OK / Flagged / QA-Added / Deleted), QA Notes
- Per-annotation inline comment field for QA notes
- Color-coded rows: green (OK), yellow (flagged), blue (QA-added), red/strikethrough (deleted)
- Filter: All / OK / Flagged / Added / Deleted
- Summary counts at top

### 6. AcceptDialog
- Confirmation modal for accepting the annotation
- Shows: modification summary (N modified, N added, N deleted)
- If modifications were made: notes that a new QA AnnotationVersion will be created
- "Confirm Accept" button

### 7. RejectDialog
- Modal for rejecting with feedback
- **Required**: Comments/feedback textarea (min 10 characters)
- Optional: per-annotation notes (shown to annotator during rework)
- "Confirm Reject" button
- Warns: "Job will be returned to the annotator for rework"

### 8. QANotesPanel
- Collapsible panel or textarea for overall QA review notes
- Persisted with the QAReviewVersion
- Distinct from rejection comments — used for both accept and reject

### 9. ModificationSummary
- Panel showing a summary of all changes the QA user made
- Grouped: Annotations modified (class change, span adjustment), Annotations added, Annotations removed
- Shown in AcceptDialog before confirmation

## Data Flow

### Review Flow
```
QA user opens assigned job
        │
        ▼
Load job data: raw_content, latest AnnotationVersion with annotations
        │
        ▼
Set status to QA_IN_PROGRESS (if currently QA_ASSIGNED)
        │
        ▼
RawContentViewer renders with annotation highlights
AnnotationsReviewListTab shows all annotations
        │
        ▼
QA reviews each annotation:
  ├─ Mark OK → visual indicator (green)
  ├─ Flag → visual indicator (yellow) + optional note
  ├─ Edit → modify class or span (tracked as modification)
  └─ Delete → remove annotation (tracked as deletion)
        │
        ▼
Optionally: toggle edit mode to add new annotations
```

### Accept Flow
```
QA clicks "Accept"
        │
        ▼
AcceptDialog shows modification summary
        │
        ▼
QA confirms
        │
        ▼
API: acceptAnnotation mutation
  Input: { jobId, qaComments, modifications[] }
        │
        ▼
Backend:
  ├─ Creates QAReviewVersion:
  │     { job_id, version_number: N, annotation_version_id, reviewed_by,
  │       decision: 'ACCEPT', comments, modifications_summary }
  │
  ├─ If modifications exist:
  │     Creates new AnnotationVersion:
  │       { job_id, version_number: M, created_by: qaUserId, source: 'QA' }
  │     With the modified set of annotations
  │
  ├─ Updates job status: QA_IN_PROGRESS → ACCEPTED → DELIVERED
  └─ Returns updated job
        │
        ▼
QA redirected to dashboard with success message
```

### Reject Flow
```
QA clicks "Reject"
        │
        ▼
RejectDialog opens — QA writes feedback comments
        │
        ▼
QA confirms rejection
        │
        ▼
API: rejectAnnotation mutation
  Input: { jobId, comments, annotationNotes[] }
        │
        ▼
Backend:
  ├─ Creates QAReviewVersion:
  │     { job_id, version_number: N, annotation_version_id, reviewed_by,
  │       decision: 'REJECT', comments }
  │
  ├─ Updates job status: QA_IN_PROGRESS → REJECTED
  ├─ Then: REJECTED → ASSIGNED (back to original annotator for rework)
  └─ Returns updated job
        │
        ▼
QA redirected to dashboard
Job appears on Annotator's dashboard with QA feedback
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| QA Dashboard | QAReviewWorkspace | Opens job for review |
| RawContentViewer | AnnotationReviewPopover | Click annotation shows review popover |
| EditModeControls | RawContentViewer | Enables/disables text selection for new annotations |
| QAReviewWorkspace | AcceptDialog / RejectDialog | Accept/Reject buttons open respective dialogs |
| QAReviewWorkspace | API | `startQAReview`, `acceptAnnotation`, `rejectAnnotation` |
| QAReviewWorkspace | Version History Module | "View History" link |
| Reject | Annotator Dashboard | Rejected job appears with feedback for rework |

## State Management

### QA Review State
```typescript
interface QAReviewState {
  job: Job;
  rawContent: string;
  annotatorInfo: {
    name: string;
    id: string;
  } | null;                          // null if blind review enabled
  originalAnnotations: Annotation[]; // from the AnnotationVersion being reviewed
  currentAnnotations: Annotation[];  // working copy with QA modifications
  annotationStatuses: Map<string, AnnotationQAStatus>; // annotation ID → status
  annotationNotes: Map<string, string>;   // annotation ID → QA note
  modifications: QAModification[];
  editModeEnabled: boolean;
  isAccepting: boolean;
  isRejecting: boolean;
  activeRightTab: 'viewer' | 'preview' | 'annotations';
  blindReviewEnabled: boolean;
}

type AnnotationQAStatus = 'PENDING' | 'OK' | 'FLAGGED' | 'QA_ADDED' | 'DELETED';

interface QAModification {
  type: 'MODIFIED' | 'ADDED' | 'DELETED';
  annotationId: string;
  details: string;    // human-readable description of change
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/qa/jobs/{jobId}/` | GET | — | `{ job, rawContentUrl, annotations[], annotatorInfo? }` | annotatorInfo null if blind review |
| `/api/qa/settings/blind-review/` | GET | — | `{ enabled: boolean }` | Platform-level setting |
| `/api/qa/jobs/{jobId}/start/` | POST | — | `Job` | Transitions QA_ASSIGNED → QA_IN_PROGRESS |
| `/api/qa/jobs/{jobId}/accept/` | POST | `{ comments?, modifications[] }` | `QAReviewVersion` | Creates QAReviewVersion (+ optional QA AnnotationVersion) |
| `/api/qa/jobs/{jobId}/reject/` | POST | `{ comments, annotationNotes[] }` | `QAReviewVersion` | Creates QAReviewVersion, returns job to annotator |

### Status Transitions
| From | To | Trigger |
|------|-----|---------|
| `QA_ASSIGNED` | `QA_IN_PROGRESS` | QA user opens job (`startQAReview`) |
| `QA_IN_PROGRESS` | `ACCEPTED` → `DELIVERED` | QA accepts (`acceptAnnotation`) |
| `QA_IN_PROGRESS` | `REJECTED` → `ASSIGNED` | QA rejects (`rejectAnnotation`) — returns to original annotator |

## Blind Review

- Platform-level admin setting (see Admin Dashboard / settings)
- When enabled: `annotatorInfo` is `null` in the QA review response
- QA user sees "Annotator: [Hidden]" instead of the annotator's name
- Does not affect the underlying data — just controls visibility in the QA UI
- Admin can toggle at any time; affects all future QA reviews
