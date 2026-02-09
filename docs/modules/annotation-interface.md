> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Annotation Interface Module

## Purpose & Scope

The core annotation workflow — the primary workspace where Annotators identify and tag PII spans in raw `.eml` files. Features a two-panel layout: the left panel displays raw email content with colored span highlights and text selection; the right panel provides tabs for email viewer, email preview, and an annotation summary list. Supports initial annotation, save-as-draft, submission (creating AnnotationVersions), and rework mode after QA rejection.

## Related Requirements

| ID | Requirement |
|----|-------------|
| AN-1 | Dashboard — table of assigned jobs with status |
| AN-2 | Raw .eml viewer — display full raw `.eml` content for annotation |
| AN-3 | Email preview — rendered HTML/text preview |
| AN-4 | Highlight & tag — select text spans and assign PII class |
| AN-5 | Auto-indexing — auto-assign index numbers to tags |
| AN-6 | Annotation summary — review all annotations before submission |
| AN-7 | Submit annotation — submit completed work; job moves to QA pool |
| AN-8 | Rework view — see rejected jobs with QA feedback |
| AN-9 | Version history — view previous annotation versions |
| S-1 | Email viewer — parsed read-only view of `.eml` file |
| Section 7 | Annotation Interface Specification — layout, annotation flow, same-value linking |

## Components

### 1. AnnotationWorkspace (Main Container)
- Two-panel split layout (resizable divider)
- Left panel: RawContentViewer (60% default width)
- Right panel: Tabbed panel with EmailViewer, EmailPreview, AnnotationsList (40% default width)
- Top bar: Job info (file name, dataset, status), navigation (back to dashboard)
- Bottom bar: Save Draft button, Submit button, annotation count
- Rework banner (conditionally shown when job was rejected by QA)

### 2. RawContentViewer (Left Panel)
- Renders the **exact** raw `.eml` string character-for-character in a monospace font
- **Critical**: No reformatting, no line wrapping normalization — the displayed text must have a 1:1 character mapping with the stored `raw_content` string so that `window.getSelection()` ranges map accurately to `start_offset` / `end_offset` values
- Text selection enabled: user highlights a span of text
- Annotated spans shown with colored background matching their class color
- Overlapping annotations: nested highlights with distinct borders
- Clicking an annotated span shows a tooltip/popover with: class name, tag (e.g., `[email_1]`), original text, edit/delete actions
- Line numbers displayed in a gutter (read-only)

### 3. ClassSelectionPopup
- Appears near the cursor after user selects text in the RawContentViewer
- Shows the list of all annotation classes with color swatches and display labels
- Search/filter input at top for quick class lookup
- On class selection:
  1. Checks if selected text exactly matches a previously annotated value of the same class → suggests reusing existing tag (same-value linking)
  2. If no match or user declines, assigns next available index for that class
  3. Creates the annotation with: `{ class_id, tag, start_offset, end_offset, original_text }`
  4. Highlights the span in the RawContentViewer

### 4. SameValueLinkingDialog
- Triggered when selected text matches existing annotation of the same class
- Shows: "This text matches `[email_1]` — use same tag?"
- Options: "Yes, use `[email_1]`" or "No, create new tag `[email_2]`"
- Prevents inconsistent tagging of identical PII values

### 5. ReworkBanner
- Shown when the job status is REJECTED (returned by QA for rework)
- Displays: QA rejection comments, QA reviewer name (if not blind review), rejection date
- Collapsible — can be minimized to save screen space
- Previous annotations are pre-loaded for editing

### 6. EmailViewerTab (Right Panel Tab)
- Parsed, structured view of the `.eml` file (shared component — see email-viewer wireframe)
- Read-only — no annotation actions here
- Shows: sender avatar (initials), From, Date, Subject, Reply-To, To, CC, BCC, body

### 7. EmailPreviewTab (Right Panel Tab)
- Rendered HTML/text preview of the email as it would appear in an email client
- Useful for understanding email context during annotation
- Read-only

### 8. AnnotationsListTab (Right Panel Tab)
- Table/list of all annotations in current session
- Columns: Tag (e.g., `[email_1]`), Class (with color swatch), Original Text (truncated), Start Offset, End Offset
- Sort by offset (default), class, or tag
- Actions per annotation: Click to scroll to/highlight in raw view, Edit (change class), Delete
- Shows total annotation count
- Grouped by class (collapsible sections)

## Data Flow

### Annotation Flow
```
Annotator opens assigned job
        │
        ▼
Load job data: raw_content (from Django backend), parsed email headers/body
        │
        ▼
If REJECTED status: load latest AnnotationVersion + QA feedback
If ASSIGNED status: blank canvas (or load draft if saved)
        │
        ▼
Set status to IN_PROGRESS (if currently ASSIGNED)
        │
        ▼
Annotator selects text in RawContentViewer
        │
        ▼
ClassSelectionPopup appears
        │
        ▼
Annotator picks a class
        │
        ▼
System checks same-value map:
  Map key: `${class_name}:${selected_text}`
  ├─ Match found → SameValueLinkingDialog
  │     ├─ Reuse tag → annotation uses existing index
  │     └─ New tag → annotation uses next index
  └─ No match → assign next available index for class
        │
        ▼
Annotation added to local state:
  { class_id, tag: "[class_N]", start_offset, end_offset, original_text }
        │
        ▼
RawContentViewer re-renders with new highlight
AnnotationsListTab updates
```

### Save Draft
```
Annotator clicks "Save Draft"
        │
        ▼
API: saveDraft mutation
  Input: { jobId, annotations[] }
        │
        ▼
Backend stores draft (does NOT create AnnotationVersion)
Job status remains IN_PROGRESS
```

### Submit Annotation
```
Annotator clicks "Submit"
        │
        ▼
Confirmation dialog: "Submit N annotations for QA review?"
        │
        ▼
API: submitAnnotation mutation
  Input: { jobId, annotations[] }
        │
        ▼
Backend:
  ├─ Creates new AnnotationVersion:
  │     { job_id, version_number: N, created_by: annotatorId, source: 'ANNOTATOR' }
  ├─ Creates Annotation records for each span:
  │     { annotation_version_id, class_id, tag, start_offset, end_offset, original_text }
  ├─ Updates job status: IN_PROGRESS → ANNOTATED
  └─ Clears any saved draft
        │
        ▼
Annotator redirected to dashboard with success message
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| Annotator Dashboard | AnnotationWorkspace | Opens job for annotation |
| RawContentViewer | ClassSelectionPopup | Text selection triggers popup |
| ClassSelectionPopup | SameValueLinkingDialog | Matching text triggers linking dialog |
| AnnotationsListTab | RawContentViewer | Click annotation scrolls to and highlights span |
| AnnotationWorkspace | API | `saveDraft`, `submitAnnotation`, `getJobForAnnotation` |
| AnnotationWorkspace | Version History Module | "View History" link |
| QA Interface | AnnotationWorkspace | Shares RawContentViewer and EmailViewer components |

## State Management

### Workspace State
```typescript
interface AnnotationWorkspaceState {
  job: Job;
  rawContent: string;
  annotations: Annotation[];
  selectedText: TextSelection | null;
  classPopupOpen: boolean;
  classPopupPosition: { x: number; y: number };
  sameValueMap: Map<string, string>;   // "class:text" → tag (e.g., "[email_1]")
  tagCounters: Map<string, number>;    // class_name → next index
  isDirty: boolean;                    // unsaved changes
  isSubmitting: boolean;
  reworkInfo: {
    qaComments: string;
    qaReviewer: string;
    rejectedAt: string;
  } | null;
  activeRightTab: 'viewer' | 'preview' | 'annotations';
}

interface Annotation {
  id: string;               // client-generated UUID
  classId: string;
  className: string;
  classColor: string;
  classDisplayLabel: string;
  tag: string;              // e.g., "[email_1]"
  startOffset: number;
  endOffset: number;
  originalText: string;
}

interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
}
```

### Same-Value Linking Map
- Client-side `Map<string, string>` keyed by `${class_name}:${original_text}`
- Value is the tag string (e.g., `[email_1]`)
- Built from existing annotations when loading a job or rework session
- Updated when new annotations are added
- Ensures identical PII values share the same tag index

### Tag Counter
- Client-side `Map<string, number>` keyed by class name
- Tracks the highest used index for each class
- Initialized from existing annotations
- Incremented when a new (non-linked) annotation is created

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/annotations/jobs/{jobId}/` | GET | — | `{ job, rawContentUrl, annotations?, reworkInfo? }` | Includes file serving URL for raw content, latest annotations if rework |
| `/api/annotations/jobs/{jobId}/draft/` | GET | — | `{ annotations[] }` | Saved draft annotations (if any) |
| `/api/annotations/jobs/{jobId}/start/` | POST | — | `Job` | Transitions ASSIGNED → IN_PROGRESS |
| `/api/annotations/jobs/{jobId}/draft/` | PUT | `{ annotations[] }` | `{ success }` | Persists draft without creating version |
| `/api/annotations/jobs/{jobId}/submit/` | POST | `{ annotations[] }` | `AnnotationVersion` | Creates version, transitions to ANNOTATED |

### Status Transitions
| From | To | Trigger |
|------|-----|---------|
| `ASSIGNED` | `IN_PROGRESS` | Annotator opens job (`startAnnotation`) |
| `IN_PROGRESS` | `ANNOTATED` | Annotator submits (`submitAnnotation`) |
| `REJECTED` | `ASSIGNED` | Rework: QA rejection resets to ASSIGNED for same annotator |
| `ASSIGNED` (rework) | `IN_PROGRESS` | Annotator reopens rejected job |
| `IN_PROGRESS` (rework) | `ANNOTATED` | Annotator resubmits (creates version N+1) |

## Critical Implementation Notes

### Offset Accuracy
The RawContentViewer must render the raw `.eml` string exactly as stored. The `start_offset` and `end_offset` of each annotation correspond to character indices in that string. Any reformatting (collapsing whitespace, trimming, normalizing line endings) would invalidate all offsets. Use a `<pre>` element or equivalent to preserve exact formatting.

### Selection-to-Offset Mapping
When the user selects text via mouse/keyboard:
1. Use `window.getSelection()` to get the Range
2. Calculate the character offset from the start of the raw content container
3. Account for any DOM nodes inserted for existing highlights (they must not shift text positions)
4. Store `start_offset` and `end_offset` as character indices into the original `rawContent` string

### Highlight Rendering
- Annotations are rendered as `<span>` elements with background colors
- The raw text is split at annotation boundaries and wrapped in styled spans
- Annotations must be rendered in offset order to handle correct splitting
- Overlapping annotations are discouraged but handled via nested spans if they occur
