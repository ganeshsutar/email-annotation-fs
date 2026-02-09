> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Dataset Upload Screen (Modal)

> **Module Reference**: [Dataset Management](../modules/dataset-management.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                              │
│         ┌──────────────────────────────────────────────────────────────────────┐              │
│         │  Upload Dataset                                               [✕]   │              │
│         ├──────────────────────────────────────────────────────────────────────┤              │
│         │                                                                      │              │
│         │  Dataset Name                                                        │              │
│         │  ┌──────────────────────────────────────────────────────────┐        │              │
│         │  │ Customer Emails Q4                                       │        │              │
│         │  └──────────────────────────────────────────────────────────┘        │              │
│         │                                                                      │              │
│         │  Upload File (.zip)                                                  │              │
│         │  ┌──────────────────────────────────────────────────────────┐        │              │
│         │  │                                                          │        │              │
│         │  │          ┌──────┐                                        │        │              │
│         │  │          │  📁  │                                        │        │              │
│         │  │          └──────┘                                        │        │              │
│         │  │                                                          │        │              │
│         │  │     Drag and drop your .zip file here                    │        │              │
│         │  │              or                                          │        │              │
│         │  │         [Browse Files]                                   │        │              │
│         │  │                                                          │        │              │
│         │  └──────────────────────────────────────────────────────────┘        │              │
│         │                                                                      │              │
│         │  ── After file selected ──────────────────────────────────────       │              │
│         │                                                                      │              │
│         │  Selected: customer_emails_q4.zip (24.5 MB)        [✕ Remove]       │              │
│         │                                                                      │              │
│         │  ── During upload ────────────────────────────────────────────       │              │
│         │                                                                      │              │
│         │  Uploading...                                                        │              │
│         │  ┌──────────────────────────────────────────────────────────┐        │              │
│         │  │ ████████████████████████████░░░░░░░░░░░░░░░░░░  65%     │        │              │
│         │  └──────────────────────────────────────────────────────────┘        │              │
│         │                                                                      │              │
│         │  ── During extraction ───────────────────────────────────────       │              │
│         │                                                                      │              │
│         │  ⟳ Extracting .eml files...                                         │              │
│         │  ⟳ Creating jobs... (32 of 48 files processed)                      │              │
│         │                                                                      │              │
│         │  ── Completion ──────────────────────────────────────────────       │              │
│         │                                                                      │              │
│         │  ✓ Upload complete! 48 .eml files extracted and 48 jobs created.    │              │
│         │    2 non-.eml files skipped.                                         │              │
│         │                                                                      │              │
│         │  ── Error state ─────────────────────────────────────────────       │              │
│         │                                                                      │              │
│         │  ✗ Error: No .eml files found in the archive.                       │              │
│         │                                                                      │              │
│         │  ┌──────────────────────────┐  ┌───────────────────────────┐        │              │
│         │  │        Cancel            │  │     Upload & Process      │        │              │
│         │  └──────────────────────────┘  └───────────────────────────┘        │              │
│         │                                                                      │              │
│         └──────────────────────────────────────────────────────────────────────┘              │
│                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Modal Header | "Upload Dataset" title with close (✕) button |
| 2 | Dataset Name Input | Required text field for naming the dataset |
| 3 | Drag-and-Drop Zone | File upload area accepting .zip files only |
| 4 | Browse Files Button | Opens system file picker as alternative to drag-and-drop |
| 5 | Selected File Info | Shows filename, size, and remove button after selection |
| 6 | Upload Progress Bar | Shows upload percentage during server upload |
| 7 | Extraction Status | Spinner + status text during backend processing |
| 8 | Completion Message | Success message with file count summary |
| 9 | Error Message | Red error text when upload/extraction fails |
| 10 | Cancel Button | Closes modal (cancels upload if in progress) |
| 11 | Upload & Process Button | Initiates upload (disabled until name + file provided) |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Dataset Name Input | Type | Sets dataset name; validates uniqueness on blur |
| Drag-and-Drop Zone | Drop .zip file | Validates extension, shows file info |
| Browse Files Button | Click | Opens system file picker (accept=".zip") |
| Remove (✕) | Click | Clears selected file |
| Upload & Process | Click (enabled when name + file set) | Starts upload → extraction pipeline |
| Cancel | Click | Closes modal; if uploading, confirms cancellation first |
| ✕ (close) | Click | Same as Cancel |

## States

| State | UI Changes |
|-------|------------|
| **Empty** | Name empty, drop zone shown, Upload button disabled |
| **File Selected** | File info shown, Upload button enabled (if name filled) |
| **Uploading** | Progress bar shown, inputs disabled, Cancel available |
| **Extracting** | Spinner with extraction status, inputs disabled |
| **Complete** | Green success message, "View Dataset" link, Close button |
| **Error** | Red error message, "Try Again" resets to Empty state |

## Navigation Flow

```
Dataset Upload Dialog
  ├─ Success → Close modal, navigate to /admin/datasets/{newId}
  ├─ Cancel  → Close modal, return to Dataset List
  └─ Error   → Stay in dialog, show error, allow retry
```
