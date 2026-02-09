> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Dataset Detail Screen

> **Module Reference**: [Dataset Management](../modules/dataset-management.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator                                                              Admin User ▼  [Sign Out]  │
├────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┤
│                │                                                                                             │
│   NAVIGATION   │  ← Back to Datasets                                                                        │
│                │                                                                                             │
│  □ Dashboard   │  Customer Emails Q4                                                                         │
│  ■ Datasets    │  Uploaded by Admin User  •  Feb 5, 2026  •  48 files                                        │
│  □ Annotation  │  ───────────────────────────────────────────────────────────────────────────────────────     │
│    Classes     │                                                                                             │
│  □ Users       │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  □ Job         │  │ UPLOADED │ │ ASSIGNED │ │ IN_PROG  │ │ANNOTATED │ │ QA_PROG  │ │DELIVERED │             │
│    Assignment  │  │    8     │ │    6     │ │    5     │ │    7     │ │    4     │ │   12     │             │
│  □ Export      │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│  □ Settings    │                                                                                             │
│                │  Jobs                                               [Assign Selected ▼]  [Export Delivered]  │
│                │  ┌──────────────────┐  ┌────────────────────┐                                               │
│                │  │ 🔍 Search files  │  │ Status: All ▼      │                                               │
│                │  └──────────────────┘  └────────────────────┘                                               │
│                │                                                                                             │
│                │  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│                │  │ ☐ │ File Name           │ Status       │ Annotator   │ QA User    │ Updated    │ Act. │  │
│                │  ├───┼─────────────────────┼──────────────┼─────────────┼────────────┼────────────┼──────┤  │
│                │  │ ☐ │ A000186_t1_1.eml    │ ● DELIVERED  │ Alice J.    │ David M.   │ Feb 5      │  ⋯   │  │
│                │  │ ☐ │ A000187_t1_1.eml    │ ● QA_IN_PROG │ Bob K.      │ Eve P.     │ Feb 4      │  ⋯   │  │
│                │  │ ☐ │ A000188_t1_1.eml    │ ● ANNOTATED  │ Alice J.    │ —          │ Feb 4      │  ⋯   │  │
│                │  │ ☐ │ A000189_t1_1.eml    │ ● IN_PROGRESS│ Carol L.    │ —          │ Feb 3      │  ⋯   │  │
│                │  │ ☐ │ A000190_t1_1.eml    │ ● ASSIGNED   │ Bob K.      │ —          │ Feb 2      │  ⋯   │  │
│                │  │ ☐ │ A000191_t1_1.eml    │ ● UPLOADED   │ —           │ —          │ Feb 1      │  ⋯   │  │
│                │  │ ☐ │ A000192_t1_1.eml    │ ● REJECTED   │ Alice J.    │ David M.   │ Feb 3      │  ⋯   │  │
│                │  │ ☐ │ A000193_t1_1.eml    │ ● DELIVERED  │ Carol L.    │ Frank Q.   │ Feb 5      │  ⋯   │  │
│                │  │   │                     │              │             │            │            │      │  │
│                │  ├───┴─────────────────────┴──────────────┴─────────────┴────────────┴────────────┴──────┤  │
│                │  │  Showing 1-8 of 48 jobs                                    ◀  1  2  3  4  5  6  ▶    │  │
│                │  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                │                                                                                             │
│                │  ⋯ Row Actions:                                                                             │
│                │  ┌──────────────────────┐                                                                   │
│                │  │  View Email           │                                                                   │
│                │  │  View Annotations     │                                                                   │
│                │  │  View History         │                                                                   │
│                │  │  Assign Annotator     │                                                                   │
│                │  │  Assign QA            │                                                                   │
│                │  └──────────────────────┘                                                                   │
│                │                                                                                             │
└────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Back Link | "← Back to Datasets" returns to list |
| 2 | Dataset Header | Name, uploader, date, file count |
| 3 | Status Summary Cards | Count of jobs in each status category |
| 4 | Search & Filter Bar | Search by file name, filter by status dropdown |
| 5 | Jobs Table | Paginated list of all jobs in the dataset |
| 6 | Status Badges | Color-coded status indicators (● dot + label) |
| 7 | Assignment Actions | "Assign Selected" dropdown for batch assignment |
| 8 | Row Actions Menu (⋯) | Per-job actions: View Email, Annotations, History, Assign |
| 9 | Pagination | Page controls |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Status Summary Card | Click | Filters jobs table to that status |
| Search Input | Type | Filters jobs by file name |
| Status Dropdown | Select | Filters jobs by selected status |
| "Assign Selected" | Click with selections | Opens assignment dialog for checked jobs |
| "Export Delivered" | Click | Navigates to export page for this dataset |
| Job Row | Click | Opens email viewer for that job |
| ⋯ → View Email | Click | Opens email viewer (read-only) |
| ⋯ → View Annotations | Click | Opens annotation view (read-only for admin) |
| ⋯ → View History | Click | Opens version history for that job |
| ⋯ → Assign Annotator | Click | Opens annotator assignment dialog |
| ⋯ → Assign QA | Click | Opens QA assignment dialog (only for ANNOTATED jobs) |

## Status Badge Colors

| Status | Color | Dot |
|--------|-------|-----|
| UPLOADED | Gray | ● |
| ASSIGNED | Blue | ● |
| IN_PROGRESS | Orange | ● |
| ANNOTATED | Purple | ● |
| QA_ASSIGNED | Teal | ● |
| QA_IN_PROGRESS | Indigo | ● |
| ACCEPTED | Green | ● |
| REJECTED | Red | ● |
| DELIVERED | Green (dark) | ● |

## Navigation Flow

```
Dataset Detail
  ├─ ← Back to Datasets     → /admin/datasets
  ├─ View Email              → Email Viewer modal/page
  ├─ View Annotations        → Annotation read-only view
  ├─ View History            → /admin/jobs/{id}/history
  ├─ Assign Annotator        → Assignment dialog
  ├─ Assign QA               → QA Assignment dialog
  └─ Export Delivered         → /admin/export?dataset={id}
```
