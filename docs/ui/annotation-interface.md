> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Annotation Interface Screen

> **Module Reference**: [Annotation Interface](../modules/annotation-interface.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Email PII Annotator      A000188_t1_1.eml  •  Customer Q4  •  IN_PROGRESS         Alice Johnson ▼  [Sign Out]     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│  ← Back to Dashboard                                                              [View History]                     │
│                                                                                                                      │
│  ┌──── REWORK BANNER (shown only for REJECTED jobs) ───────────────────────────────────────────────────────────┐     │
│  │  ⚠ QA Rejected — "Missing phone numbers in email body. Please re-check lines 45-60." — David M.  [Dismiss] │     │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐    │
│  │  RAW EMAIL CONTENT                         ◉ ─── ◉  │  [Email Viewer] [Email Preview] [Annotations (14)]   │    │
│  │  ──────────────────────────────────────────          │  ────────────────────────────────────────────────────  │    │
│  │                                                      │                                                        │    │
│  │  1 │ Delivered-To: ████████████████████████           │  ── Annotations Tab ──                                 │    │
│  │    │               micheal.ucheh@gmail.com            │                                                        │    │
│  │  2 │ Received: by 2002:a17:522:719c:b0:5dc           │  ┌──────────────────────────────────────────────────┐  │    │
│  │  3 │         :2e01:b06 with SMTP id v28cs             │  │ Tag          │ Class      │ Text       │ Action │  │    │
│  │  4 │         p2036658pvo;                             │  ├──────────────┼────────────┼────────────┼────────┤  │    │
│  │    │ ...                                              │  │ [email_1]    │ ██ Email   │ micheal.u… │ ✎ 🗑   │  │    │
│  │ 36 │         for <████████████████████████             │  │ [email_1]    │ ██ Email   │ micheal.u… │ ✎ 🗑   │  │    │
│  │    │              micheal.ucheh@gmail.com              │  │ [email_2]    │ ██ Email   │ receipt-N… │ ✎ 🗑   │  │    │
│  │ 37 │         (version=TLS1_3 cipher=TLS_A             │  │ [first_n…_1] │ ██ First   │ Micheal    │ ✎ 🗑   │  │    │
│  │    │ ...                                              │  │ [last_n…_1]  │ ██ Last    │ Ucheh      │ ✎ 🗑   │  │    │
│  │ 63 │ Subject: Your Receipt from New Look              │  │ [phone_1]    │ ██ Phone   │ +44 7911…  │ ✎ 🗑   │  │    │
│  │ 64 │ From: =?utf-8?b?TmV3IExvb2sgTWFu…              │  │ [address_1]  │ ██ Addr.   │ 42 King…   │ ✎ 🗑   │  │    │
│  │ 65 │ Reply-To: info@newlook.com                       │  │ [city_1]     │ ██ City    │ Manchest…  │ ✎ 🗑   │  │    │
│  │ 66 │ Date: Sun, 1 Dec 2024 16:13:24 +00              │  │ [zip_code_1] │ ██ ZIP     │ M1 1AD     │ ✎ 🗑   │  │    │
│  │ 67 │ To: █████████████████████████████                │  │ [card_nu…_1] │ ██ Card    │ ****4288   │ ✎ 🗑   │  │    │
│  │    │     micheal.ucheh@gmail.com                       │  │              │            │            │        │  │    │
│  │ 68 │ Message-ID: <0100019382ff8600-c03f               │  │  14 annotations total                  │        │  │    │
│  │ 69 │ ...                                              │  └──────────────────────────────────────────────────┘  │    │
│  │    │                                                  │                                                        │    │
│  │    │ ┌────────────────────────────────┐               │  ── Email Viewer Tab ──                                │    │
│  │    │ │  CLASS SELECTION POPUP         │               │                                                        │    │
│  │    │ │  ┌──────────────────────────┐  │               │  ┌──────────────────────────────────────────────────┐  │    │
│  │    │ │  │ 🔍 Search classes...     │  │               │  │  ┌────┐                                          │  │    │
│  │    │ │  └──────────────────────────┘  │               │  │  │ MU │  Micheal Ucheh                           │  │    │
│  │    │ │  ██ Email Address              │               │  │  └────┘  micheal.ucheh@gmail.com                  │  │    │
│  │    │ │  ██ First Name                 │               │  │                                                    │  │    │
│  │    │ │  ██ Last Name                  │               │  │  Date: Dec 1, 2024, 4:13:24 PM                    │  │    │
│  │    │ │  ██ Full Name                  │               │  │  Subject: Your Receipt from New Look Manchester   │  │    │
│  │    │ │  ██ Phone Number               │               │  │  Reply-To: info@newlook.com                       │  │    │
│  │    │ │  ██ Street Address             │               │  │  To: micheal.ucheh@gmail.com                      │  │    │
│  │    │ │  ██ City                       │               │  │                                                    │  │    │
│  │    │ │  ██ State                      │               │  │  ─────────────────────────────────────────────    │  │    │
│  │    │ │  ██ ZIP Code                   │               │  │                                                    │  │    │
│  │    │ │  ██ Card Number                │               │  │  Dear Micheal,                                    │  │    │
│  │    │ │  ██ Account Number             │               │  │                                                    │  │    │
│  │    │ └────────────────────────────────┘               │  │  Thank you for your purchase at New Look          │  │    │
│  │    │                                                  │  │  Manchester - Arndale on Dec 1, 2024.             │  │    │
│  │    │                                                  │  │  ...                                               │  │    │
│  │    │                                                  │  └──────────────────────────────────────────────────┘  │    │
│  │    │                                                  │                                                        │    │
│  └──────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘    │
│                                                                                                                      │
│  ┌──── SAME-VALUE LINKING DIALOG (appears when matching text is detected) ─────────────────────────────────────┐     │
│  │  This text "micheal.ucheh@gmail.com" matches an existing tag.                                                │     │
│  │                                                                                                              │     │
│  │  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐                                  │     │
│  │  │ Use existing tag: [email_1]      │  │ Create new tag: [email_2]        │                                  │     │
│  │  └──────────────────────────────────┘  └──────────────────────────────────┘                                  │     │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────┐     │
│  │   14 annotations                                                      [Save Draft]      [Submit for QA]     │     │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Top Bar | File name, dataset, status badge, user info |
| 2 | Back Link | Returns to Annotator Dashboard |
| 3 | View History Link | Opens Version History page for this job |
| 4 | Rework Banner | Shown only when job is REJECTED — QA feedback, reviewer name, dismiss button |
| 5 | Left Panel: Raw Content | Monospace rendered raw `.eml` content with line numbers |
| 6 | Highlighted Spans | Colored background spans for annotated PII (colors match class) |
| 7 | Resizable Divider | Draggable divider (◉ ─── ◉) between left and right panels |
| 8 | Right Panel Tab Bar | Tabs: "Email Viewer", "Email Preview", "Annotations (N)" |
| 9 | Annotations Tab | Table listing all annotations: tag, class with color swatch, text, edit/delete |
| 10 | Email Viewer Tab | Parsed email view (see email-viewer.md) |
| 11 | Class Selection Popup | Appears near cursor after text selection; lists all PII classes |
| 12 | Search in Popup | Quick filter for class names |
| 13 | Same-Value Linking Dialog | Appears when selected text matches existing annotation |
| 14 | Bottom Bar | Annotation count + Save Draft + Submit for QA buttons |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Raw Content Area | Select text (mouse drag) | Class Selection Popup appears near cursor |
| Class in Popup | Click a class | Creates annotation → highlight appears → popup closes |
| Search in Popup | Type | Filters class list in popup |
| Highlighted Span | Click | Shows tooltip: tag, class, text, Edit/Delete actions |
| Span Tooltip → Edit | Click | Changes class (re-opens class selector for this span) |
| Span Tooltip → Delete | Click | Removes annotation, un-highlights text |
| Annotation Row (right) | Click | Scrolls left panel to that annotation and pulses highlight |
| Annotation Row → Edit (✎) | Click | Opens class change for that annotation |
| Annotation Row → Delete (🗑) | Click | Removes annotation |
| Same-Value Dialog → "Use existing" | Click | Reuses tag index (e.g., [email_1]) |
| Same-Value Dialog → "Create new" | Click | Creates new tag index (e.g., [email_2]) |
| Tab: Email Viewer | Click | Shows parsed email view |
| Tab: Email Preview | Click | Shows rendered HTML/text preview |
| Tab: Annotations | Click | Shows annotations list |
| Resizable Divider | Drag | Adjusts panel widths |
| Save Draft | Click | Saves annotations without submitting |
| Submit for QA | Click | Opens confirmation → creates AnnotationVersion → sets status ANNOTATED |
| Rework Banner → Dismiss | Click | Collapses banner (feedback accessible via View History) |
| View History | Click | Opens Version History page |

## Annotation Flow (Step by Step)

```
1. Annotator selects text "micheal.ucheh@gmail.com" in raw content
                    │
                    ▼
2. Class Selection Popup appears near cursor
                    │
                    ▼
3. Annotator clicks "Email Address"
                    │
                    ▼
4. System checks same-value map:
   ├─ First occurrence → auto-assigns [email_1], creates annotation
   └─ Already tagged   → Same-Value Linking Dialog appears
                              │
                    ┌─────────┴────────────┐
                    ▼                      ▼
              "Use [email_1]"        "Create [email_2]"
                    │                      │
                    ▼                      ▼
5. Annotation created with chosen tag
                    │
                    ▼
6. Span highlighted with email class color in raw content
   Annotation added to Annotations tab list
```

## Critical Design Notes

- **Raw content rendering**: The left panel must render the exact raw `.eml` string character-for-character using monospace font in a `<pre>` element. No whitespace normalization, no line wrapping changes. Character offsets must map 1:1 with the stored string.
- **Offset calculation**: When user selects text, `window.getSelection()` ranges are converted to character offsets relative to the raw content string start. Highlight `<span>` elements inserted for existing annotations must not shift text positions.
- **Panel proportions**: Default 60/40 split (raw content / tabs), adjustable via dragging the divider.

## Navigation Flow

```
Annotation Interface
  ├─ ← Back to Dashboard    → /annotator/dashboard
  ├─ View History            → /jobs/{id}/history  (Version History)
  ├─ Save Draft              → Stay on page (data saved)
  └─ Submit for QA           → /annotator/dashboard (with success message)
```
