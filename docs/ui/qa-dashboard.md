> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# QA Dashboard Screen

> **Module Reference**: [QA Interface](../modules/qa-interface.md) (QA-1)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator                                                          David Martinez ▼  [Sign Out]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                              │
│  QA Review Jobs                                                                                              │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────────     │
│                                                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │   QA Assigned: 8       In Review: 2       Accepted: 30       Rejected: 5       Total: 45            │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                              │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐                                            │
│  │ 🔍 Search by file name... │  │ Status: All ▼                │                                            │
│  └────────────────────────────┘  └──────────────────────────────┘                                            │
│                                                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ File Name             │ Dataset           │ Annotator    │ Status          │ Updated     │ Action      │  │
│  ├───────────────────────┼───────────────────┼──────────────┼─────────────────┼─────────────┼─────────────┤  │
│  │ A000186_t1_1.eml      │ Customer Q4       │ Alice J.     │ ● QA_ASSIGNED   │ Feb 5       │ [Start QA]  │  │
│  │ A000196_t1_1.eml      │ Support Tickets   │ Bob K.       │ ● QA_ASSIGNED   │ Feb 4       │ [Start QA]  │  │
│  │ A000197_t1_1.eml      │ Support Tickets   │ Carol L.     │ ● QA_ASSIGNED   │ Feb 4       │ [Start QA]  │  │
│  │ A000187_t1_1.eml      │ Customer Q4       │ Bob K.       │ ● QA_IN_PROGRESS│ Feb 5       │ [Continue]  │  │
│  │ A000198_t1_1.eml      │ Support Tickets   │ Alice J.     │ ● QA_IN_PROGRESS│ Feb 4       │ [Continue]  │  │
│  │ A000188_t1_1.eml      │ Customer Q4       │ Alice J.     │ ✓ ACCEPTED      │ Feb 4       │ [View]      │  │
│  │ A000193_t1_1.eml      │ Customer Q4       │ Carol L.     │ ✓ DELIVERED     │ Feb 5       │ [View]      │  │
│  │ A000199_t1_1.eml      │ Support Tickets   │ Bob K.       │ ✗ REJECTED      │ Feb 3       │ [View]      │  │
│  │ A000200_t1_1.eml      │ Support Tickets   │ [Hidden]     │ ● QA_ASSIGNED   │ Feb 4       │ [Start QA]  │  │
│  │                       │                   │              │                 │             │             │  │
│  ├───────────────────────┴───────────────────┴──────────────┴─────────────────┴─────────────┴─────────────┤  │
│  │  Showing 1-9 of 45 jobs                                                     ◀  1  2  3  4  5  ▶       │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                              │
│  Note: When "Blind Review" is enabled by admin, the Annotator column shows "[Hidden]"                        │
│                                                                                                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Top Bar | App name + QA user name + Sign Out |
| 2 | Page Title | "QA Review Jobs" |
| 3 | Summary Bar | Count badges: QA Assigned, In Review, Accepted, Rejected, Total |
| 4 | Search & Filter | Search by file name, filter by status |
| 5 | Jobs Table | All QA jobs assigned to this user |
| 6 | Annotator Column | Shows annotator name or "[Hidden]" if blind review is enabled |
| 7 | Status Badges | ● QA_ASSIGNED, ● QA_IN_PROGRESS, ✓ ACCEPTED/DELIVERED, ✗ REJECTED |
| 8 | Action Buttons | Context-dependent: Start QA, Continue, View |
| 9 | Blind Review Note | Informational text about hidden annotator identity |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Summary Badge | Click | Filters table to that status |
| Search Input | Type | Filters by file name |
| Status Filter | Select | Filters table by status |
| "Start QA" | Click (QA_ASSIGNED) | Opens QA Review Interface, sets status to QA_IN_PROGRESS |
| "Continue" | Click (QA_IN_PROGRESS) | Opens QA Review Interface with review in progress |
| "View" | Click (ACCEPTED/DELIVERED/REJECTED) | Opens read-only review view |
| Column Headers | Click | Sorts table |

## Status-to-Action Mapping

| Job Status | Action Button | Behavior |
|------------|---------------|----------|
| QA_ASSIGNED | "Start QA" | Opens QA review workspace |
| QA_IN_PROGRESS | "Continue" | Opens QA review workspace (in progress) |
| ACCEPTED | "View" | Opens read-only view of the accepted review |
| DELIVERED | "View" | Opens read-only view |
| REJECTED | "View" | Opens read-only view with rejection comments |

## Blind Review Behavior

- When admin enables blind review, the Annotator column shows "[Hidden]" for all jobs
- The QA user cannot see who annotated the job
- This applies globally to all QA users
- The setting is checked at page load and per-job review load

## Navigation Flow

```
QA Dashboard
  ├─ Start QA    → /qa/jobs/{id}/review  (QA Review Interface)
  ├─ Continue    → /qa/jobs/{id}/review  (in progress)
  ├─ View        → /qa/jobs/{id}/view    (read-only)
  └─ Sign Out    → /login
```
