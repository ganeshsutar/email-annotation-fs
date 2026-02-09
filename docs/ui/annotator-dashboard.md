> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Annotator Dashboard Screen

> **Module Reference**: [Annotation Interface](../modules/annotation-interface.md) (AN-1, AN-8)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator                                                         Alice Johnson ▼  [Sign Out]    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  My Jobs                                                                                                     │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────────     │
│                                                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │   Assigned: 5       In Progress: 2       Completed: 18       Rejected: 1       Total: 26            │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                              │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐                                            │
│  │ 🔍 Search by file name... │  │ Status: All ▼                │                                            │
│  └────────────────────────────┘  └──────────────────────────────┘                                            │
│                                                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ File Name             │ Dataset           │ Status         │ Updated     │ Action                     │  │
│  ├───────────────────────┼───────────────────┼────────────────┼─────────────┼────────────────────────────┤  │
│  │ A000210_t1_1.eml      │ HR Communications │ ● ASSIGNED     │ Feb 4       │ [Start Annotation]         │  │
│  │ A000211_t1_1.eml      │ HR Communications │ ● ASSIGNED     │ Feb 4       │ [Start Annotation]         │  │
│  │ A000189_t1_1.eml      │ Customer Q4       │ ● IN_PROGRESS  │ Feb 3       │ [Continue]                 │  │
│  │ A000195_t1_1.eml      │ Customer Q4       │ ● IN_PROGRESS  │ Feb 2       │ [Continue]                 │  │
│  │ A000192_t1_1.eml      │ Customer Q4       │ ● REJECTED     │ Feb 3       │ [Rework]                   │  │
│  │ ├─ QA Feedback: "Missing phone numbers in email body.      │             │                            │  │
│  │ │   Please re-check lines 45-60." — David M., Feb 3        │             │                            │  │
│  │ A000186_t1_1.eml      │ Customer Q4       │ ✓ ANNOTATED    │ Feb 2       │ [View]                     │  │
│  │ A000187_t1_1.eml      │ Customer Q4       │ ✓ DELIVERED    │ Feb 5       │ [View]                     │  │
│  │ A000188_t1_1.eml      │ Support Tickets   │ ● ASSIGNED     │ Feb 3       │ [Start Annotation]         │  │
│  │ A000193_t1_1.eml      │ Customer Q4       │ ✓ DELIVERED    │ Feb 5       │ [View]                     │  │
│  │ A000196_t1_1.eml      │ Support Tickets   │ ✓ ANNOTATED    │ Feb 4       │ [View]                     │  │
│  │                       │                   │                │             │                            │  │
│  ├───────────────────────┴───────────────────┴────────────────┴─────────────┴────────────────────────────┤  │
│  │  Showing 1-10 of 26 jobs                                                  ◀  1  2  3  ▶               │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Top Bar | App name + user name (annotator) + Sign Out |
| 2 | Page Title | "My Jobs" — annotator-specific dashboard |
| 3 | Summary Bar | Count badges: Assigned, In Progress, Completed, Rejected, Total |
| 4 | Search & Filter | Search by file name, filter by status dropdown |
| 5 | Jobs Table | All jobs assigned to this annotator |
| 6 | Status Badges | Color-coded: ● ASSIGNED (blue), ● IN_PROGRESS (orange), ● REJECTED (red), ✓ ANNOTATED (purple), ✓ DELIVERED (green) |
| 7 | Action Buttons | Context-dependent: Start Annotation, Continue, Rework, View |
| 8 | QA Feedback Row | Inline expanded row below REJECTED jobs showing QA comments |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Summary Badge | Click | Filters table to that status |
| Search Input | Type | Filters by file name |
| Status Filter | Select | Filters table by status |
| "Start Annotation" | Click (ASSIGNED jobs) | Opens Annotation Interface, sets status to IN_PROGRESS |
| "Continue" | Click (IN_PROGRESS jobs) | Opens Annotation Interface with saved draft |
| "Rework" | Click (REJECTED jobs) | Opens Annotation Interface in rework mode with QA feedback |
| "View" | Click (ANNOTATED/DELIVERED) | Opens read-only annotation view |
| QA Feedback Row | Auto-expanded for REJECTED | Shows rejection comments inline |
| Column Headers | Click | Sorts table |

## Status-to-Action Mapping

| Job Status | Action Button | Behavior |
|------------|---------------|----------|
| ASSIGNED | "Start Annotation" | Opens annotation workspace (blank canvas) |
| IN_PROGRESS | "Continue" | Opens annotation workspace with draft loaded |
| REJECTED | "Rework" | Opens annotation workspace with latest annotations + QA feedback banner |
| ANNOTATED | "View" | Opens read-only view (awaiting QA) |
| DELIVERED | "View" | Opens read-only view (QA accepted) |

## QA Feedback Display

- REJECTED jobs show an expanded sub-row below the job entry
- Contains: QA reviewer name, rejection date, and rejection comments
- Styled with a left border accent (red) to draw attention
- The "Rework" button is prominent (primary color) to guide the annotator

## Navigation Flow

```
Annotator Dashboard
  ├─ Start Annotation    → /annotator/jobs/{id}/annotate  (Annotation Interface)
  ├─ Continue            → /annotator/jobs/{id}/annotate  (with draft loaded)
  ├─ Rework              → /annotator/jobs/{id}/annotate  (rework mode)
  ├─ View                → /annotator/jobs/{id}/view      (read-only)
  └─ Sign Out            → /login
```
