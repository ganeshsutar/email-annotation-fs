> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Admin Dashboard Screen

> **Module Reference**: [Admin Dashboard](../modules/admin-dashboard.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator                                                              Admin User ▼  [Sign Out]  │
├────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┤
│                │                                                                                             │
│   NAVIGATION   │  Dashboard                                                                                  │
│                │  ─────────────────────────────────────────────────────────────────────────────────────────── │
│  ■ Dashboard   │                                                                                             │
│  □ Datasets    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  □ Annotation  │  │ Total       │  │ Total       │  │ Pending     │  │ In          │  │ Delivered   │       │
│    Classes     │  │ Datasets    │  │ Jobs        │  │ Assignment  │  │ Progress    │  │             │       │
│  □ Users       │  │     12      │  │    348      │  │     45      │  │    128      │  │    102      │       │
│  □ Job         │  │             │  │             │  │  [Assign →] │  │             │  │             │       │
│    Assignment  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│  □ Export      │                                                                                             │
│  □ Settings    │  Job Status Distribution                                                                    │
│                │  ┌─────────────────────────────────────────────────────────────────────────────────────┐     │
│                │  │                                                                                     │     │
│                │  │  45 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  UPLOADED                         │     │
│                │  │  38 ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ASSIGNED                         │     │
│                │  │  42 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  IN_PROGRESS                      │     │
│                │  │  35 ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ANNOTATED                        │     │
│                │  │  28 █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  QA_ASSIGNED                      │     │
│                │  │  20 ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  QA_IN_PROGRESS                   │     │
│                │  │  38 ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ACCEPTED                         │     │
│                │  │   8 █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  REJECTED                         │     │
│                │  │ 102 ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░  DELIVERED                        │     │
│                │  │                                                                                     │     │
│                │  └─────────────────────────────────────────────────────────────────────────────────────┘     │
│                │                                                                                             │
│                │  Recent Datasets                                                              [View All →]  │
│                │  ┌──────────────────────────────────────────────────────────────────────────────────────┐    │
│                │  │  Name               │ Upload Date  │ Files │ Status Summary          │ Actions       │    │
│                │  ├─────────────────────┼──────────────┼───────┼─────────────────────────┼───────────────┤    │
│                │  │  Customer Emails Q4  │ 2026-02-05   │  48   │ ████████░░░░  85% done  │ [View]        │    │
│                │  │  Support Tickets     │ 2026-02-03   │  112  │ ██████░░░░░░  52% done  │ [View]        │    │
│                │  │  Marketing Batch 3   │ 2026-01-28   │  65   │ ████████████  100% done │ [View]        │    │
│                │  │  HR Communications   │ 2026-01-20   │  33   │ ██░░░░░░░░░░  15% done  │ [View]        │    │
│                │  │  Finance Reports     │ 2026-01-15   │  90   │ ██████████░░  90% done  │ [View]        │    │
│                │  └──────────────────────────────────────────────────────────────────────────────────────┘    │
│                │                                                                                             │
│                │  Annotator Performance                                  QA Performance                       │
│                │  ┌──────────────────────────────────────────┐  ┌──────────────────────────────────────────┐  │
│                │  │  Name      │ Asgn │ Done │ Rate │ Avg   │  │  Name      │ Rvwd │ Acc │ Rej │ Avg     │  │
│                │  ├───────────┼──────┼──────┼──────┼───────┤  ├───────────┼──────┼─────┼─────┼─────────┤  │
│                │  │  Alice J.  │  25  │  20  │ 92%  │ 14.2  │  │  David M.  │  35  │  30 │   5 │ 12 min  │  │
│                │  │  Bob K.    │  30  │  22  │ 88%  │ 11.8  │  │  Eve P.    │  28  │  25 │   3 │ 15 min  │  │
│                │  │  Carol L.  │  18  │  15  │ 95%  │ 16.1  │  │  Frank Q.  │  22  │  18 │   4 │ 18 min  │  │
│                │  └──────────────────────────────────────────┘  └──────────────────────────────────────────┘  │
│                │                                                                                             │
│                │  Quick Actions                                                                              │
│                │  ┌────────────────────┐ ┌──────────────────────┐ ┌──────────────┐ ┌────────────────────┐     │
│                │  │  Upload Dataset    │ │  Assign Annot. Jobs  │ │ Assign QA    │ │  Export Delivered  │     │
│                │  └────────────────────┘ └──────────────────────┘ └──────────────┘ └────────────────────┘     │
│                │                                                                                             │
└────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Top Bar | App name left, user name dropdown + Sign Out right |
| 2 | Sidebar Navigation | Vertical nav with section links, active item highlighted |
| 3 | Stats Cards Row | 5 summary metric cards with counts |
| 4 | Job Status Chart | Horizontal bar chart showing job count per status |
| 5 | Recent Datasets Table | 5 most recent datasets with progress indicators |
| 6 | Annotator Performance Table | Annotator metrics: assigned, completed, acceptance rate, avg annotations |
| 7 | QA Performance Table | QA metrics: reviewed, accepted, rejected, avg review time |
| 8 | Quick Actions Row | Action buttons linking to key workflows |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Stats Card (Pending Assignment) | Click "Assign" link | Navigate to Job Assignment page |
| Job Status Chart Bars | Click a bar | Navigate to filtered job list for that status |
| Recent Datasets Row | Click row | Navigate to Dataset Detail page |
| "View All" link | Click | Navigate to Dataset List page |
| Performance Table Headers | Click column header | Sort table by that column |
| Quick Action: Upload Dataset | Click | Open Dataset Upload dialog |
| Quick Action: Assign Annot. Jobs | Click | Navigate to Job Assignment (Annotation tab) |
| Quick Action: Assign QA | Click | Navigate to Job Assignment (QA tab) |
| Quick Action: Export Delivered | Click | Navigate to Export page |
| Sidebar links | Click | Navigate to respective page |
| User dropdown | Click | Show dropdown with profile/sign-out options |

## Navigation Flow

```
Admin Dashboard
  ├─ Sidebar → Datasets         → /admin/datasets
  ├─ Sidebar → Annotation Classes → /admin/annotation-classes
  ├─ Sidebar → Users            → /admin/users
  ├─ Sidebar → Job Assignment   → /admin/assignments
  ├─ Sidebar → Export           → /admin/export
  ├─ Sidebar → Settings         → /admin/settings
  ├─ Stats Card "Pending"       → /admin/assignments
  ├─ Status Chart Bar           → /admin/jobs?status={status}
  ├─ Dataset Row                → /admin/datasets/{id}
  ├─ Quick Action buttons       → respective pages/dialogs
  └─ Sign Out                   → /login
```
