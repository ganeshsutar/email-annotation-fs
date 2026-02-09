> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Email Viewer Component

> **Module Reference**: [Annotation Interface](../modules/annotation-interface.md) (S-1), [QA Interface](../modules/qa-interface.md)

## ASCII Wireframe

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                        │    │
│  │   ┌──────┐                                                            │    │
│  │   │      │                                                            │    │
│  │   │  MU  │   Micheal Ucheh                                            │    │
│  │   │      │   micheal.ucheh@gmail.com                                   │    │
│  │   └──────┘                                                            │    │
│  │                                                                        │    │
│  │   From       Micheal Ucheh <micheal.ucheh@gmail.com>                   │    │
│  │   Date       Dec 1, 2024, 4:13:24 PM                                  │    │
│  │   Subject    Your Receipt from New Look Manchester - Arndale           │    │
│  │   Reply-To   info@newlook.com                                          │    │
│  │   To         micheal.ucheh@gmail.com                                   │    │
│  │   CC         —                                                         │    │
│  │   BCC        —                                                         │    │
│  │                                                                        │    │
│  │   ──────────────────────────────────────────────────────────────────   │    │
│  │                                                                        │    │
│  │   Dear Micheal,                                                        │    │
│  │                                                                        │    │
│  │   Thank you for your purchase at New Look Manchester - Arndale         │    │
│  │   on December 1, 2024.                                                 │    │
│  │                                                                        │    │
│  │   Order Details:                                                       │    │
│  │   - Item: Winter Jacket                                                │    │
│  │   - Size: M                                                            │    │
│  │   - Price: £49.99                                                      │    │
│  │                                                                        │    │
│  │   Your order confirmation number is #NL-2024-88421.                    │    │
│  │                                                                        │    │
│  │   Payment Method: Visa ending in 4288                                  │    │
│  │                                                                        │    │
│  │   Delivery Address:                                                    │    │
│  │   42 King Street                                                       │    │
│  │   Manchester, M1 1AD                                                   │    │
│  │                                                                        │    │
│  │   If you have any questions about your order, please contact us        │    │
│  │   at info@newlook.com or call +44 7911 123456.                         │    │
│  │                                                                        │    │
│  │   Best regards,                                                        │    │
│  │   New Look Manchester Team                                             │    │
│  │                                                                        │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | Sender Avatar | Circular badge with initials derived from sender name (e.g., "MU" for Micheal Ucheh) |
| 2 | Sender Name | Display name extracted from the From header |
| 3 | Sender Email | Email address from the From header |
| 4 | From Field | Full "Display Name <email>" format |
| 5 | Date Field | Parsed and formatted date/time from the Date header |
| 6 | Subject Field | Email subject line |
| 7 | Reply-To Field | Reply-To address (shown only if present in headers) |
| 8 | To Field | Recipient(s) — may be multiple, comma-separated |
| 9 | CC Field | CC recipients (shown as "—" if none) |
| 10 | BCC Field | BCC recipients (shown as "—" if none; typically only in sent-mail .eml files) |
| 11 | Divider | Visual horizontal line separating headers from body |
| 12 | Email Body | Plain-text rendering of the email body content |

## Parsing Rules

| Header | Parsing Logic |
|--------|---------------|
| **From** | Extract display name and email from `Name <email@domain.com>` format. Handle RFC 2047 encoded words (e.g., `=?utf-8?b?...?=`) |
| **Date** | Parse RFC 2822 date string, format as locale-friendly date/time |
| **Subject** | Decode RFC 2047 encoded words if present |
| **To/CC/BCC** | Split by comma, parse each as `Name <email>` |
| **Reply-To** | Parse as email address |
| **Body** | For multipart: prefer `text/plain` part. For HTML-only: strip tags to readable text. Handle Content-Transfer-Encoding (base64, quoted-printable) |

## Sender Avatar Generation

```
Input: From header display name
  │
  ├─ "Micheal Ucheh"         → "MU" (first letter of each word)
  ├─ "New Look Manchester"   → "NL" (first two initials)
  ├─ "noreply@speedpay.com"  → "NO" (first two letters of local part)
  └─ (empty)                 → "?"
  │
  ▼
Circular badge with colored background (deterministic color from name hash)
```

## Behavior Notes

- **Read-only**: This component is always read-only — no editing or annotation
- **Used as tab**: Appears as the "Email Viewer" tab in both the Annotation Interface and QA Review Interface right panel
- **Standalone access**: Admin can open the email viewer for any job from the Dataset Detail page
- **Multipart handling**: For multipart/mixed emails, display the text part; attachments shown as a list of filenames (not downloadable)
- **HTML emails**: If only HTML part exists, render a stripped-text version for readability
- **Encoding**: Properly decode base64 and quoted-printable Content-Transfer-Encoding

## Where This Component Appears

| Context | Access |
|---------|--------|
| Annotation Interface → "Email Viewer" tab | Annotators during annotation |
| QA Review Interface → "Email Viewer" tab | QA users during review |
| Dataset Detail → "View Email" action | Admins viewing any job's email |
| Version History → "View in Context" | All roles viewing historical versions |
