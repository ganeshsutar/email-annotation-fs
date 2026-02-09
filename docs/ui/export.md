> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Export Screen

> **Module Reference**: [Export](../modules/export.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator                                                              Admin User ▼  [Sign Out]  │
├────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┤
│                │                                                                                             │
│   NAVIGATION   │  Export De-identified Emails                                                                │
│                │  ───────────────────────────────────────────────────────────────────────────────────────     │
│  □ Dashboard   │                                                                                             │
│  □ Datasets    │  Dataset                                                                                    │
│  □ Annotation  │  ┌──────────────────────────────────────────────────┐                                       │
│    Classes     │  │ Customer Emails Q4 (12 delivered)  ▼             │                                       │
│  □ Users       │  └──────────────────────────────────────────────────┘                                       │
│  □ Job         │                                                                                             │
│    Assignment  │  Delivered Jobs (12)                             [Preview Selected]  [Export Selected]       │
│  ■ Export      │                                                                     [Export All]             │
│  □ Settings    │                                                                                             │
│                │  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│                │  │ ☐ │ File Name             │ Annotator   │ QA Reviewer  │ Annotations │ Delivered     │  │
│                │  ├───┼───────────────────────┼─────────────┼──────────────┼─────────────┼───────────────┤  │
│                │  │ ☑ │ A000186_t1_1.eml      │ Alice J.    │ David M.     │ 14          │ Feb 5, 2026   │  │
│                │  │ ☑ │ A000193_t1_1.eml      │ Carol L.    │ Frank Q.     │ 11          │ Feb 5, 2026   │  │
│                │  │ ☐ │ A000201_t1_1.eml      │ Bob K.      │ David M.     │ 8           │ Feb 4, 2026   │  │
│                │  │ ☐ │ A000205_t1_1.eml      │ Alice J.    │ Eve P.       │ 16          │ Feb 4, 2026   │  │
│                │  │ ☐ │ A000208_t1_1.eml      │ Carol L.    │ David M.     │ 9           │ Feb 3, 2026   │  │
│                │  │   │ ...                   │             │              │             │               │  │
│                │  ├───┴───────────────────────┴─────────────┴──────────────┴─────────────┴───────────────┤  │
│                │  │  2 of 12 selected                                            ◀  1  2  ▶              │  │
│                │  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                │                                                                                             │
│                │  ── Export Preview (side-by-side) ──────────────────────────────────────────────────         │
│                │                                                                                             │
│                │  ┌────────────────────────────────────────┬────────────────────────────────────────┐         │
│                │  │  ORIGINAL                              │  DE-IDENTIFIED                        │         │
│                │  │  A000186_t1_1.eml                      │  REDACTED_828_A000186_t1_1.eml        │         │
│                │  ├────────────────────────────────────────┼────────────────────────────────────────┤         │
│                │  │                                        │                                        │         │
│                │  │  Delivered-To:                         │  Delivered-To:                         │         │
│                │  │    ██████████████████████████           │    [email_1]                           │         │
│                │  │    micheal.ucheh@gmail.com              │                                        │         │
│                │  │  ...                                   │  ...                                   │         │
│                │  │  for <██████████████████████>           │  for <[email_2]>                       │         │
│                │  │       anotheruser@domain.com           │                                        │         │
│                │  │  ...                                   │  ...                                   │         │
│                │  │  To: ████████████████████               │  To: [first_name_person_1]             │         │
│                │  │      [first_name_person_1]             │  [last_name_person_1] <[email_3]>      │         │
│                │  │  ████████████████████ <██████████████>  │                                        │         │
│                │  │  [last_name_person_1]  [email_3]       │  ...                                   │         │
│                │  │  ...                                   │                                        │         │
│                │  │                                        │                                        │         │
│                │  │  14 PII spans highlighted              │  14 tags replaced                      │         │
│                │  │                                        │                                        │         │
│                │  └────────────────────────────────────────┴────────────────────────────────────────┘         │
│                │                                                                                             │
│                │  ── Export History ─────────────────────────────────────────────────────────────────         │
│                │                                                                                             │
│                │  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│                │  │ Export Date       │ Dataset          │ Jobs │ Size    │ Exported By  │ Download       │  │
│                │  ├──────────────────┼──────────────────┼──────┼─────────┼──────────────┼────────────────┤  │
│                │  │ Feb 5, 2026      │ Marketing Batch  │  65  │ 12.3 MB │ Admin User   │ [Download .zip]│  │
│                │  │ Feb 1, 2026      │ Vendor Emails    │  44  │  8.7 MB │ Admin User   │ [Download .zip]│  │
│                │  │ Jan 28, 2026     │ Customer Q3      │  92  │ 18.1 MB │ Admin User   │ [Download .zip]│  │
│                │  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                │                                                                                             │
└────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Page Title | "Export De-identified Emails" |
| 2 | Dataset Selector | Dropdown showing only datasets with DELIVERED jobs, with delivered count |
| 3 | Delivered Jobs Table | Checkboxed table of DELIVERED jobs in selected dataset |
| 4 | Preview Selected | Opens side-by-side preview for first selected job |
| 5 | Export Selected | Exports checked jobs as .zip |
| 6 | Export All | Exports all delivered jobs in dataset as .zip |
| 7 | Export Preview | Side-by-side original vs de-identified view |
| 8 | Original Panel | Left: raw .eml with PII highlighted in class colors |
| 9 | De-identified Panel | Right: .eml with PII replaced by tags (e.g., `[email_1]`) |
| 10 | Output Filename | Shows the REDACTED_{id}_{filename} naming pattern |
| 11 | Export History Table | Previous exports with download links |
| 12 | Download Link | Generates fresh download URL for .zip download |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Dataset Selector | Select dataset | Loads delivered jobs for that dataset |
| Job Checkbox | Check/uncheck | Selects/deselects job for export |
| Header Checkbox | Click | Selects/deselects all visible jobs |
| "Preview Selected" | Click (1 job selected) | Shows side-by-side export preview below |
| "Export Selected" | Click (1+ selected) | Generates .zip of selected jobs, triggers download |
| "Export All" | Click | Generates .zip of all delivered jobs in dataset |
| Preview scroll | Scroll either panel | Both panels scroll in sync |
| "Download .zip" | Click | Downloads previously generated export |

## Export Preview Details

The side-by-side preview demonstrates the replacement algorithm:

```
ORIGINAL (left)                          DE-IDENTIFIED (right)
─────────────────                        ─────────────────────
Delivered-To: micheal.ucheh@gmail.com    Delivered-To: [email_1]
...                                      ...
for <anotheruser@domain.com>             for <[email_2]>
...                                      ...
To: Micheal                              To: [first_name_person_1]
Ucheh <john.doe@company.com>             [last_name_person_1] <[email_3]>
```

- Left panel highlights PII with class colors (same as annotation view)
- Right panel shows the replacement tags
- Matched replacements share the same highlight color between panels
- Replacement count summary at bottom of each panel

## Navigation Flow

```
Export Page
  ├─ Select Dataset     → Loads delivered jobs
  ├─ Preview            → Side-by-side preview inline
  ├─ Export Selected     → Download .zip (browser download)
  ├─ Export All          → Download .zip (browser download)
  └─ Download (history)  → Download .zip (browser download)
```
