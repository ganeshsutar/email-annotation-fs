> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Version History Screen

> **Module Reference**: [Version History](../modules/version-history.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator      A000186_t1_1.eml  •  Customer Q4  •  DELIVERED                   User ▼  [Sign Out]      │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ← Back                                                                                                             │
│                                                                                                                      │
│  Version History                                                                                                     │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────     │
│                                                                                                                      │
│  ┌───────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┐     │
│  │  TIMELINE                                     │  VERSION COMPARISON                                         │     │
│  │  ─────────                                    │  ──────────────────                                         │     │
│  │                                               │                                                              │     │
│  │  ┌─ Feb 5, 2026  2:30 PM ──────────────────┐ │  Compare:                                                    │     │
│  │  │  ✓ QA Review v1                   ACCEPT │ │  ┌──────────────────────┐  vs  ┌──────────────────────┐     │     │
│  │  │  Reviewed by: David Martinez              │ │  │ Annotation v1  ▼     │      │ Annotation v2 (QA) ▼ │     │     │
│  │  │  ──────────────────────────────────────── │ │  └──────────────────────┘      └──────────────────────┘     │     │
│  │  │  Decision: ● ACCEPTED                     │ │                                                              │     │
│  │  │  Comments: "Good work. Added missing      │ │  Summary: 1 added, 0 removed, 1 modified, 12 unchanged     │     │
│  │  │  state annotation. Minor fix applied."    │ │                                                              │     │
│  │  │  Modifications: 1 added, 0 deleted        │ │  ┌──────────────────────────────────────────────────────┐   │     │
│  │  │  Reviewed version: Annotation v1           │ │  │ Status   │ Tag          │ Class    │ Text    │ Note │   │     │
│  │  │                  [View Annotations]        │ │  ├──────────┼──────────────┼──────────┼─────────┼──────┤   │     │
│  │  └────────────────────────────────────────────┘ │  │          │ [email_1]    │ ██ Email │ mich…   │      │   │     │
│  │       │                                         │  │          │ [email_1]    │ ██ Email │ mich…   │      │   │     │
│  │       │                                         │  │          │ [email_2]    │ ██ Email │ rece…   │      │   │     │
│  │  ┌─ Feb 5, 2026  2:30 PM ──────────────────┐  │  │          │ [first_n…_1]│ ██ First │ Mich…   │      │   │     │
│  │  │  🛡 Annotation v2 (QA)                   │  │  │          │ [last_n…_1] │ ██ Last  │ Ucheh   │      │   │     │
│  │  │  Author: David Martinez                   │  │  │          │ [phone_1]   │ ██ Phone │ +44 …   │      │   │     │
│  │  │  Source: QA                                │  │  │          │ [address_1] │ ██ Addr. │ 42 K…   │      │   │     │
│  │  │  Annotations: 15                           │  │  │          │ [city_1]    │ ██ City  │ Manc…   │      │   │     │
│  │  │                                            │  │  │          │ [zip_co…_1] │ ██ ZIP   │ M1 1…   │      │   │     │
│  │  │        [View]  [Compare ▼]                 │  │  │          │ [card_n…_1] │ ██ Card  │ ****…   │      │   │     │
│  │  └────────────────────────────────────────────┘ │  │          │ [email_3]   │ ██ Email │ john…   │      │   │     │
│  │       │                                         │  │          │ [accou…_1]  │ ██ Acc.  │ 0036…   │      │   │     │
│  │       │                                         │  │  ──────────────────────────────────────────────────  │   │     │
│  │  ┌─ Feb 3, 2026  10:15 AM ─────────────────┐  │  │ MODIFIED │ [zip_co…_1] │ ██ ZIP   │ M1 1…   │ span │   │     │
│  │  │  ✎ Annotation v1                         │  │  │          │             │          │ chang…  │      │   │     │
│  │  │  Author: Alice Johnson                    │  │  │  ADDED   │ [state_1]   │ ██ State │ Grea…   │ QA   │   │     │
│  │  │  Source: ANNOTATOR                         │  │  │          │             │          │         │ add  │   │     │
│  │  │  Annotations: 14                           │  │  └──────────────────────────────────────────────────────┘   │     │
│  │  │                                            │  │                                                              │     │
│  │  │        [View]  [Compare ▼]                 │  │  Legend:                                                     │     │
│  │  └────────────────────────────────────────────┘ │  │    (no icon) = Unchanged    MODIFIED = Changed class/span │     │
│  │       │                                         │  │    ADDED = New in Version B    REMOVED = Deleted           │     │
│  │       │                                         │  │                                                              │     │
│  │  ┌─ Feb 3, 2026  9:00 AM ──────────────────┐  │  │                                                              │     │
│  │  │  ● Job Created                            │  │  │                                                              │     │
│  │  │  Status: UPLOADED                          │  │  │                                                              │     │
│  │  │  Dataset: Customer Emails Q4               │  │  │                                                              │     │
│  │  └────────────────────────────────────────────┘ │  │                                                              │     │
│  │                                                 │  │                                                              │     │
│  └───────────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘     │
│                                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Top Bar | File name, dataset, current status |
| 2 | Back Link | Returns to previous page (dashboard, dataset detail, or annotation/QA interface) |
| 3 | Page Title | "Version History" |
| 4 | Timeline Panel (Left) | Vertical chronological timeline of all versions |
| 5 | QA Review Card | Shows decision (ACCEPT/REJECT), reviewer, comments, modifications summary |
| 6 | Annotation Version Card | Shows author, source (ANNOTATOR/QA), annotation count |
| 7 | Job Created Entry | Initial timeline entry when job was created |
| 8 | "View" Button | Opens VersionDetailView showing all annotations for that version |
| 9 | "Compare" Button | Selects this version for comparison in the right panel |
| 10 | Comparison Panel (Right) | Side-by-side diff between two selected versions |
| 11 | Version A / B Selectors | Dropdowns to pick which two AnnotationVersions to compare |
| 12 | Diff Summary | Count of added, removed, modified, unchanged annotations |
| 13 | Diff Table | All annotations with status indicators (Added/Removed/Modified/Unchanged) |
| 14 | Legend | Color/icon key for diff statuses |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Timeline Card: "View" | Click | Opens all annotations for that version in a detail modal |
| Timeline Card: "Compare" | Click | Sets this version in one of the comparison dropdowns |
| Version A Dropdown | Select | Loads annotations for Version A in comparison |
| Version B Dropdown | Select | Loads annotations for Version B in comparison |
| Diff Table Row | Click | Highlights corresponding annotation in both versions |
| QA Review Card: "View Annotations" | Click | Loads the AnnotationVersion that was reviewed |
| QA Review Comments | Click expand | Shows full rejection/acceptance comments |
| "View in Raw Content" (in detail) | Click | Opens read-only RawContentViewer with highlights for that version |

## Timeline Entry Types

| Type | Icon | Content |
|------|------|---------|
| **Annotation Version (Annotator)** | ✎ (pencil) | Author, source: ANNOTATOR, annotation count, View/Compare buttons |
| **Annotation Version (QA)** | 🛡 (shield) | Author (QA user), source: QA, annotation count, created when QA modifies before accepting |
| **QA Review (Accept)** | ✓ (check) | Reviewer, ACCEPTED badge (green), comments, modifications summary |
| **QA Review (Reject)** | ✗ (cross) | Reviewer, REJECTED badge (red), rejection comments |
| **Job Created** | ● (dot) | Initial entry, shows upload date and dataset |

## Diff Color Coding

| Status | Background | Description |
|--------|-----------|-------------|
| Unchanged | None (default) | Annotation exists in both versions with same class and offsets |
| Added | Green (#E8F5E9) | Annotation exists only in Version B |
| Removed | Red (#FFEBEE) | Annotation exists only in Version A (shown with strikethrough) |
| Modified | Yellow (#FFF8E1) | Same offset range but different class or adjusted span |

## Access by Role

| Role | How They Access | What They See |
|------|----------------|---------------|
| Admin | Dataset Detail → Job → "View History" | Full history for any job |
| Annotator | Annotation Interface → "View History" | History for their own assigned jobs |
| QA | QA Review Interface → "View History" | History for jobs they've reviewed or are assigned |

## Navigation Flow

```
Version History
  ├─ ← Back              → Previous page (dashboard / dataset detail / annotation interface)
  ├─ View (version)       → Version Detail modal (all annotations for that version)
  ├─ View in Raw Content  → Read-only RawContentViewer with version highlights
  └─ Compare              → Selects version for side-by-side comparison
```
