> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Dataset List Screen

> **Module Reference**: [Dataset Management](../modules/dataset-management.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator                                                              Admin User ▼  [Sign Out]  │
├────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┤
│                │                                                                                             │
│   NAVIGATION   │  Datasets                                                         [+ Upload Dataset]        │
│                │  ───────────────────────────────────────────────────────────────────────────────────────     │
│  □ Dashboard   │                                                                                             │
│  ■ Datasets    │  ┌─────────────────────────────────────┐  ┌──────────────────────────┐                      │
│  □ Annotation  │  │  🔍 Search datasets...              │  │  Bulk Actions ▼          │                      │
│    Classes     │  └─────────────────────────────────────┘  └──────────────────────────┘                      │
│  □ Users       │                                                                                             │
│  □ Job         │  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│    Assignment  │  │ ☐ │ Name                │ Uploaded By  │ Date        │ Files │ Status Summary │ Actions│  │
│  □ Export      │  ├───┼─────────────────────┼──────────────┼─────────────┼───────┼────────────────┼────────┤  │
│  □ Settings    │  │ ☐ │ Customer Emails Q4  │ Admin User   │ 2026-02-05  │  48   │ ▓▓▓▓▓▓▓░░  85% │ ⋯      │  │
│                │  │ ☐ │ Support Tickets     │ Admin User   │ 2026-02-03  │  112  │ ▓▓▓▓░░░░░  52% │ ⋯      │  │
│                │  │ ☐ │ Marketing Batch 3   │ Admin User   │ 2026-01-28  │  65   │ ▓▓▓▓▓▓▓▓▓ 100% │ ⋯      │  │
│                │  │ ☐ │ HR Communications   │ Admin User   │ 2026-01-20  │  33   │ ▓░░░░░░░░  15% │ ⋯      │  │
│                │  │ ☐ │ Finance Reports     │ Admin User   │ 2026-01-15  │  90   │ ▓▓▓▓▓▓▓▓░  90% │ ⋯      │  │
│                │  │ ☐ │ Legal Documents     │ Admin User   │ 2026-01-10  │  27   │ ▓▓▓▓▓░░░░  60% │ ⋯      │  │
│                │  │ ☐ │ Sales Outreach      │ Admin User   │ 2026-01-05  │  156  │ ▓▓▓░░░░░░  35% │ ⋯      │  │
│                │  │ ☐ │ Vendor Emails       │ Admin User   │ 2025-12-28  │  44   │ ▓▓▓▓▓▓▓▓▓ 100% │ ⋯      │  │
│                │  │   │                     │              │             │       │                │        │  │
│                │  ├───┴─────────────────────┴──────────────┴─────────────┴───────┴────────────────┴────────┤  │
│                │  │                                                                                        │  │
│                │  │  Showing 1-8 of 12 datasets                              ◀  1  2  ▶                    │  │
│                │  │                                                                                        │  │
│                │  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                │                                                                                             │
│                │  ⋯ Row Actions Menu:                                                                        │
│                │  ┌──────────────────┐                                                                       │
│                │  │  View Details     │                                                                       │
│                │  │  Export Delivered │                                                                       │
│                │  │  Delete           │                                                                       │
│                │  └──────────────────┘                                                                       │
│                │                                                                                             │
└────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Page Title | "Datasets" with upload button |
| 2 | Search Bar | Full-text search across dataset names |
| 3 | Bulk Actions Dropdown | Actions applied to checked datasets (Delete Selected) |
| 4 | Dataset Table | Paginated table with sortable columns |
| 5 | Checkbox Column | Select individual/all datasets for bulk actions |
| 6 | Status Summary | Mini progress bar showing % of jobs delivered |
| 7 | Row Actions Menu (⋯) | Per-row dropdown with View Details, Export, Delete |
| 8 | Pagination Controls | Page navigation with current range indicator |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| "+ Upload Dataset" Button | Click | Opens Dataset Upload modal (see dataset-upload.md) |
| Search Input | Type | Filters table in real-time by dataset name |
| Header Checkbox | Click | Selects/deselects all visible rows |
| Row Checkbox | Click | Toggles selection for that dataset |
| Bulk Actions → Delete | Click (with selections) | Opens delete confirmation for selected datasets |
| Column Headers | Click | Sorts table by that column (toggle asc/desc) |
| Dataset Row | Click | Navigates to Dataset Detail page |
| ⋯ → View Details | Click | Navigates to Dataset Detail page |
| ⋯ → Export Delivered | Click | Navigates to Export page filtered to this dataset |
| ⋯ → Delete | Click | Opens delete confirmation dialog |
| Pagination ◀ ▶ | Click | Navigate between pages |

## Navigation Flow

```
Dataset List
  ├─ "+ Upload Dataset"    → Dataset Upload dialog (modal)
  ├─ Row click / View      → /admin/datasets/{id}  (Dataset Detail)
  ├─ Export Delivered       → /admin/export?dataset={id}
  └─ Delete                → Delete Confirmation dialog
```
