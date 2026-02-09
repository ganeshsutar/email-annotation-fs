# Delivery Validation Rules

Pre-acceptance validation rules for QA reviewers. These rules run automatically when a QA reviewer clicks **Accept** and surface a checklist of warnings/errors before the job transitions to `DELIVERED`.

## Rule Severity Levels

| Level | Behavior | Description |
|-------|----------|-------------|
| **Hard** | Blocks acceptance | Format definitively wrong for the annotation class. QA must fix or dismiss with reason. |
| **Soft** | Warning, reviewable | Possibly wrong. Shown as a flagged list the QA reviewer can acknowledge and proceed. |

---

## 1. Universal Structural Rules

These apply to **all** annotation classes regardless of type.

### 1.1 Boundary Rules

| ID | Level | Rule | Check |
|----|-------|------|-------|
| `B-001` | Hard | No empty annotations | `original_text.length === 0` |
| `B-002` | Hard | No whitespace-only annotations | `original_text.trim().length === 0` |
| `B-003` | Hard | No leading whitespace | `original_text !== original_text.trimStart()` |
| `B-004` | Hard | No trailing whitespace | `original_text !== original_text.trimEnd()` |
| `B-005` | Hard | Offsets are valid | `start_offset >= 0 && end_offset > start_offset` |
| `B-006` | Hard | Offsets within document bounds | `end_offset <= document.length` |
| `B-007` | Hard | Text matches offsets | `document.slice(start_offset, end_offset) === original_text` |
| `B-008` | Soft | Starts mid-word | Character before `start_offset` is a word character (`\w`) |
| `B-009` | Soft | Ends mid-word | Character after `end_offset` is a word character (`\w`) |
| `B-010` | Soft | Leading punctuation | `original_text` starts with `(`, `"`, `<`, `[`, `'` |
| `B-011` | Soft | Trailing punctuation | `original_text` ends with `.`, `,`, `)`, `>`, `]`, `;`, `'`, `"` |
| `B-012` | Soft | Includes label prefix | `original_text` matches `/^(name|email|phone|ssn|address|fax|tel|acct)[:\s]/i` |

### 1.2 Overlap & Duplicate Rules

| ID | Level | Rule | Check |
|----|-------|------|-------|
| `O-001` | Hard | No duplicate annotations | Two annotations with identical `start_offset`, `end_offset`, and `annotation_class` |
| `O-002` | Hard | No overlapping same-class annotations | Two annotations of the same class where `s1 < e2 && s2 < e1` |
| `O-003` | Soft | Overlapping different-class annotations | Two annotations of different classes that overlap — may be intentional but flag for review |
| `O-004` | Soft | Adjacent same-class annotations | Two annotations of the same class where `e1 === s2` or `e1 + 1 === s2` — likely should be merged |

### 1.3 Consistency Rules (Cross-Annotation)

| ID | Level | Rule | Check |
|----|-------|------|-------|
| `C-001` | Soft | Same text, different class | Identical `original_text` annotated with different classes in the same document |
| `C-002` | Soft | Missing repeated occurrence | An annotated text value appears elsewhere in the document unannotated (case-insensitive search) |
| `C-003` | Soft | Name substring missed | A component word of an annotated `full_name_person` (e.g. "John" from "John Smith") appears unannotated elsewhere |
| `C-004` | Soft | Inconsistent name variants | `first_name_person` + `last_name_person` exist but no `full_name_person` for the combined text, or vice versa |

### 1.4 Email-Specific Completeness Rules

| ID | Level | Rule | Check |
|----|-------|------|-------|
| `E-001` | Soft | Unannotated email header names | `From`, `To`, `CC` header values contain text matching `/[A-Z][a-z]+ [A-Z][a-z]+/` that is not annotated as any name class |
| `E-002` | Soft | Unannotated email header addresses | `From`, `To`, `CC` header values contain text matching `/@/` that is not annotated as `email` |
| `E-003` | Soft | Unannotated signature block PHI | Signature region (last 10 lines or after `--`) contains un-annotated patterns matching phone, email, or address formats |
| `E-004` | Soft | Unannotated forwarded/quoted content | Text in quoted sections (lines starting with `>`) contains the same entity values annotated elsewhere but not annotated in the quote |

---

## 2. Per-Class Validation Rules

### 2.1 `email` — Email Addresses

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `EMAIL-H1` | Hard | Must contain `@` | `!original_text.includes('@')` |
| `EMAIL-H2` | Hard | Must contain `.` after `@` | `!original_text.split('@')[1]?.includes('.')` |
| `EMAIL-H3` | Hard | No spaces | `/\s/.test(original_text)` |
| `EMAIL-H4` | Hard | Basic structure | Must match: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` |
| `EMAIL-S1` | Soft | RFC-compliant format | Should match: `/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{\|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/` |
| `EMAIL-S2` | Soft | Includes angle brackets | `original_text` starts with `<` or ends with `>` |
| `EMAIL-S3` | Soft | Includes `mailto:` prefix | `/^mailto:/i.test(original_text)` |

### 2.2 `first_name_person` — First Names

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `FN-H1` | Hard | Must contain a letter | `!/[a-zA-Z]/.test(original_text)` |
| `FN-H2` | Hard | Not purely numeric | `/^\d+$/.test(original_text)` |
| `FN-H3` | Hard | Not an email address | `/@/.test(original_text)` |
| `FN-H4` | Hard | Not a URL | `/^https?:\/\//.test(original_text)` |
| `FN-H5` | Hard | Reasonable length | `original_text.length > 50` |
| `FN-S1` | Soft | Contains digits | `/\d/.test(original_text)` |
| `FN-S2` | Soft | Single character | `original_text.trim().length === 1` (could be initial, but suspicious) |
| `FN-S3` | Soft | Contains special characters | Does not match: `/^[A-Za-z\u00C0-\u024F'\-.\s]+$/` |
| `FN-S4` | Soft | All uppercase and short | All caps and <= 3 characters — may be an acronym, not a name |
| `FN-S5` | Soft | Multiple words | Contains a space — first name is typically a single word |

### 2.3 `last_name_person` — Last Names

Same rules as `first_name_person` (`FN-H1` through `FN-S4`), plus:

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `LN-S1` | Soft | Hyphenated name | Contains `-` — valid (e.g. "Smith-Jones") but flag to verify |
| `LN-S2` | Soft | Multiple words | Contains space — possible compound last name but verify it's not over-extended |
| `LN-S3` | Soft | Name with prefix | Starts with common prefixes: `/^(van|von|de|del|la|le|el|al|bin|ibn|mc|mac|o')\s/i` — valid, but verify complete |

### 2.4 `full_name_person` — Full Person Names

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `FULL-H1` | Hard | Must contain a letter | `!/[a-zA-Z]/.test(original_text)` |
| `FULL-H2` | Hard | Not purely numeric | `/^\d+$/.test(original_text)` |
| `FULL-H3` | Hard | Not an email/URL | Contains `@` or starts with `http` |
| `FULL-H4` | Hard | Reasonable length | `original_text.length > 100` |
| `FULL-S1` | Soft | Single word only | Does not contain a space — full names are typically multi-word |
| `FULL-S2` | Soft | Contains digits | `/\d/.test(original_text)` |
| `FULL-S3` | Soft | Includes title | Starts with `/^(Mr|Mrs|Ms|Dr|Prof|Rev|Sir|Sgt|Cpl)\.?\s/i` — title may or may not be intentionally included |
| `FULL-S4` | Soft | Includes suffix | Ends with `/\s(Jr|Sr|II|III|IV|PhD|MD|DDS|Esq)\.?$/i` — verify suffix is intentional |
| `FULL-S5` | Soft | Very long (> 4 words) | More than 4 space-separated words — may have over-extended into surrounding text |

### 2.5 `phone` — Phone Numbers

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `PH-H1` | Hard | Must contain digits | `!/\d/.test(original_text)` |
| `PH-H2` | Hard | Minimum 7 digits | Count of digit characters < 7 |
| `PH-H3` | Hard | Maximum 15 digits | Count of digit characters > 15 (ITU-T E.164 limit) |
| `PH-H4` | Hard | Not a date | Matches date pattern: `/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/` |
| `PH-S1` | Soft | US phone format | Should match: `/^[\+]?1?[\s.\-]?\(?[2-9]\d{2}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}$/` |
| `PH-S2` | Soft | International format | Should match: `/^\+?[1-9]\d{0,3}[\s.\-]?\(?\d{1,4}\)?[\s.\-]?\d{1,4}[\s.\-]?\d{1,9}$/` |
| `PH-S3` | Soft | Contains letters | `/[a-zA-Z]/.test(original_text)` — could be vanity number but suspicious |
| `PH-S4` | Soft | Includes extension | `/ext|x\d/i.test(original_text)` — verify extension is part of the annotation |
| `PH-S5` | Soft | Exactly 7 digits | Only 7 digits, no area code — valid but unusual in modern context |

### 2.6 `address` — Street Addresses

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `ADDR-H1` | Hard | Not purely numeric (< 5 digits) | `/^\d{1,4}$/.test(original_text)` — bare street number alone |
| `ADDR-H2` | Hard | Not an email or URL | Contains `@` or starts with `http` |
| `ADDR-H3` | Hard | Contains some text | `original_text.trim().length < 3` |
| `ADDR-S1` | Soft | Street address pattern | Should contain a number followed by text: `/^\d{1,6}\s+[A-Za-z]/.test(original_text)` |
| `ADDR-S2` | Soft | PO Box format | Matches: `/^[Pp]\.?\s*[Oo]\.?\s*[Bb](?:ox)?\s+\d+$/` |
| `ADDR-S3` | Soft | Very short | `original_text.length < 10` — addresses are typically longer |
| `ADDR-S4` | Soft | Very long | `original_text.length > 200` — may include city/state/zip that should be separate annotations |
| `ADDR-S5` | Soft | Contains line breaks | Multi-line — may have grabbed too much surrounding context |

### 2.7 `city` — City Names

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `CITY-H1` | Hard | Must contain a letter | `!/[a-zA-Z]/.test(original_text)` |
| `CITY-H2` | Hard | Not purely numeric | `/^\d+$/.test(original_text)` |
| `CITY-H3` | Hard | Not an email/URL | Contains `@` or starts with `http` |
| `CITY-S1` | Soft | Single character | `original_text.trim().length === 1` |
| `CITY-S2` | Soft | Contains digits | `/\d/.test(original_text)` — unusual for city names |
| `CITY-S3` | Soft | Very long | `original_text.length > 50` — may have over-extended |
| `CITY-S4` | Soft | Might be a person name | Same text also annotated as a name class elsewhere — "Houston", "Jackson" can be either |

### 2.8 `state` — State Names/Abbreviations

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `ST-H1` | Hard | Must contain a letter | `!/[a-zA-Z]/.test(original_text)` |
| `ST-H2` | Hard | Not purely numeric | `/^\d+$/.test(original_text)` |
| `ST-S1` | Soft | Valid US state abbreviation | If 2 characters, should match: `/^(AL\|AK\|AZ\|AR\|CA\|CO\|CT\|DE\|FL\|GA\|HI\|ID\|IL\|IN\|IA\|KS\|KY\|LA\|ME\|MD\|MA\|MI\|MN\|MS\|MO\|MT\|NE\|NV\|NH\|NJ\|NM\|NY\|NC\|ND\|OH\|OK\|OR\|PA\|RI\|SC\|SD\|TN\|TX\|UT\|VT\|VA\|WA\|WV\|WI\|WY\|DC\|PR\|VI\|GU\|AS\|MP)$/i` |
| `ST-S2` | Soft | Full state name | If longer than 2 chars, should match a known US state name |
| `ST-S3` | Soft | Very long | `original_text.length > 20` — state names are short |
| `ST-S4` | Soft | HIPAA note | Under Safe Harbor, state-level geography is **not** an identifier. Flag if annotating state alone without more specific geography. |

### 2.9 `zip_code` — ZIP Codes

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `ZIP-H1` | Hard | Must be numeric (with optional hyphen) | Must match: `/^\d{5}(-\d{4})?$/` |
| `ZIP-H2` | Hard | Not a phone number | Digit count != 5 and != 9 (ZIP or ZIP+4) |
| `ZIP-S1` | Soft | Valid US ZIP range | First digit 0-9 (all valid), but first 3 digits should exist in USPS database |
| `ZIP-S2` | Soft | Leading zeros | Starts with `0` — valid (Northeast US) but verify not truncated |
| `ZIP-S3` | Soft | HIPAA population check | Under Safe Harbor, first 3 digits can be retained if the geographic area has >= 20,000 population. The following 3-digit prefixes must be set to `000`: `036, 059, 063, 102, 203, 556, 692, 790, 821, 823, 830, 831, 878, 879, 884, 890, 893` |

### 2.10 `card_number` — Credit/Debit Card Numbers

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `CARD-H1` | Hard | Must contain digits | `!/\d/.test(original_text)` |
| `CARD-H2` | Hard | 13-19 digits | Digit count outside range 13-19 |
| `CARD-H3` | Hard | Not a phone number | Digit count == 10 or 11 with phone-like formatting |
| `CARD-S1` | Soft | Luhn checksum | Fails Luhn algorithm validation — most card numbers pass Luhn |
| `CARD-S2` | Soft | Known card prefix | Should start with known IIN/BIN ranges: Visa `4`, Mastercard `51-55` or `2221-2720`, Amex `34` or `37`, Discover `6011` or `65` |
| `CARD-S3` | Soft | Masked card | Matches `/^[*Xx]{4,}[-\s]?\d{4}$/` — partial/masked card number (still PHI) |
| `CARD-S4` | Soft | Contains letters | `/[a-zA-Z]/.test(original_text)` — card numbers are purely numeric + separators |

**Luhn Algorithm (for `CARD-S1`):**
```
1. Starting from the rightmost digit, double every second digit.
2. If doubling results in > 9, subtract 9.
3. Sum all digits.
4. If total mod 10 === 0, the number is valid.
```

### 2.11 `account_number` — Bank/Financial Account Numbers

| ID | Level | Rule | Regex / Check |
|----|-------|------|---------------|
| `ACCT-H1` | Hard | Must contain digits | `!/\d/.test(original_text)` |
| `ACCT-H2` | Hard | Reasonable length | Digit count < 4 or > 17 |
| `ACCT-S1` | Soft | Purely numeric | Should match: `/^[\d\-\s]{4,20}$/` |
| `ACCT-S2` | Soft | Might be a phone | Digit count is 10-11 and matches phone format |
| `ACCT-S3` | Soft | Might be a card number | Digit count is 13-19 — consider `card_number` class instead |
| `ACCT-S4` | Soft | Might be a ZIP code | Digit count is exactly 5 or 9 |
| `ACCT-S5` | Soft | Contains letters | `/[a-zA-Z]/.test(original_text)` — some account numbers are alphanumeric, but flag for review |

---

## 3. Cross-Class Confusion Matrix

Common misclassifications to detect. When an annotation's text matches another class's format more closely, flag it.

| Annotated Class | Text Looks Like | Rule ID | Level |
|----------------|-----------------|---------|-------|
| Any name class | Email format (`contains @`) | `XC-001` | Hard |
| Any name class | Phone format (7+ digits) | `XC-002` | Soft |
| Any name class | URL format (`http://` or `www.`) | `XC-003` | Hard |
| `phone` | Date format (`MM/DD/YYYY`) | `XC-004` | Hard |
| `phone` | ZIP code (exactly 5 digits) | `XC-005` | Soft |
| `account_number` | Phone format (10 digits, area code pattern) | `XC-006` | Soft |
| `account_number` | Card number (13-19 digits, passes Luhn) | `XC-007` | Soft |
| `account_number` | ZIP code (exactly 5 or 9 digits) | `XC-008` | Soft |
| `card_number` | Phone format (10 digits) | `XC-009` | Soft |
| `zip_code` | Phone last digits (not 5 or 9 digits) | `XC-010` | Hard |
| `city` | Person name (also annotated as name elsewhere) | `XC-011` | Soft |
| `state` | City or person name (not in state list) | `XC-012` | Soft |

---

## 4. Annotation Density Checks

Flag documents where annotation counts are statistical outliers.

| ID | Level | Rule | Check |
|----|-------|------|-------|
| `D-001` | Soft | Zero annotations | No annotations in the document — may indicate the annotator skipped the content |
| `D-002` | Soft | Unusually low count | Annotation count < 3 for a document with > 500 characters |
| `D-003` | Soft | Unusually high count | Annotation count > 50 — potential over-annotation |
| `D-004` | Soft | No name annotations | Document has email/phone/address annotations but zero name annotations — names are almost always present alongside other PHI |
| `D-005` | Soft | No email annotations | Email document has zero `email` class annotations — unusual for .eml files |

---

## 5. QA Review Workflow Integration

### 5.1 When Rules Run

Rules execute when the QA reviewer clicks **Accept**. The system:

1. Runs all hard rules first. If any fail, acceptance is **blocked** — the QA reviewer sees the hard violations and must fix them before proceeding.
2. Runs all soft rules. Violations are displayed as a **warning checklist**. The QA reviewer can:
   - Fix the flagged annotations, or
   - Acknowledge each warning and proceed with acceptance.

### 5.2 Validation Result Display

Each violation should show:

| Field | Description |
|-------|-------------|
| **Rule ID** | e.g., `EMAIL-H1` |
| **Level** | Hard / Soft |
| **Annotation** | The specific annotation that triggered the rule (class, text, offsets) |
| **Message** | Human-readable description, e.g., "Email annotation does not contain @ symbol" |
| **Suggestion** | Optional fix suggestion, e.g., "Consider changing class to `phone`" |

### 5.3 Hard Rule Handling

- Hard violations **block** the Accept action.
- QA must either:
  - **Fix** the annotation (edit class, adjust boundaries, or delete it), or
  - **Override** with a required comment explaining why the rule doesn't apply (e.g., a non-standard format that is still valid).

### 5.4 Soft Rule Handling

- Soft warnings are displayed as a scrollable list with checkboxes.
- QA can **acknowledge all** to proceed, or fix individual annotations.
- Acknowledged warnings are logged in the `QAReviewVersion.modifications_summary` for audit.

---

## 6. Implementation Priority

### Phase 1 — Core structural rules (highest value, lowest effort)
- All boundary rules (`B-001` through `B-007`)
- Overlap/duplicate rules (`O-001`, `O-002`)
- Empty/missing annotation check (`D-001`)

### Phase 2 — Format validation per class
- Email format (`EMAIL-H1` through `EMAIL-H4`)
- Phone format (`PH-H1` through `PH-H4`)
- ZIP code format (`ZIP-H1`)
- Card number format (`CARD-H1`, `CARD-H2`)
- Name sanity checks (`FN-H1` through `FN-H5`, same for other name classes)

### Phase 3 — Cross-class confusion detection
- Cross-class matrix rules (`XC-001` through `XC-012`)
- Account/card/phone disambiguation (`ACCT-S2`, `ACCT-S3`)

### Phase 4 — Consistency and completeness
- Same-text consistency (`C-001`, `C-002`)
- Name substring completeness (`C-003`, `C-004`)
- Email header/signature checks (`E-001` through `E-004`)
- Density checks (`D-002` through `D-005`)

### Phase 5 — Advanced validations
- Luhn checksum for cards (`CARD-S1`)
- HIPAA ZIP code population check (`ZIP-S3`)
- State abbreviation validation (`ST-S1`)
- Soft boundary rules (`B-008` through `B-012`)

---

## 7. Regex Reference (Copy-Paste Ready)

```javascript
// === Email ===
const EMAIL_BASIC     = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_RFC       = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// === Phone ===
const PHONE_US        = /^[+]?1?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const PHONE_INTL      = /^\+?[1-9]\d{0,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/;
const PHONE_MIN_DIGITS = /(\d.*){7,}/;

// === ZIP Code ===
const ZIP_US          = /^\d{5}(-\d{4})?$/;

// === Card Number ===
const CARD_DIGITS     = /^\d[\d\s-]{11,22}\d$/;  // 13-19 digits with optional separators
const CARD_MASKED     = /^[*Xx]{4,}[-\s]?\d{4}$/;

// === Account Number ===
const ACCOUNT_NUM     = /^[\d\-\s]{4,20}$/;

// === Names ===
const NAME_PLAUSIBLE  = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F'\-.\s]*$/;
const NAME_PURE_NUM   = /^\d+$/;
const NAME_HAS_LETTER = /[a-zA-Z]/;

// === State Abbreviation ===
const STATE_ABBR      = /^(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|VI|GU|AS|MP)$/i;

// === Date (for cross-class confusion check) ===
const DATE_MDY        = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/;
const DATE_ISO        = /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/;

// === Helpers ===
const HAS_DIGITS      = /\d/;
const HAS_AT_SIGN     = /@/;
const IS_URL          = /^https?:\/\//;
const LABEL_PREFIX    = /^(name|email|phone|ssn|address|fax|tel|acct)[:\s]/i;
```

---

## 8. HIPAA Safe Harbor Notes

Relevant HIPAA Safe Harbor rules that affect annotation validation:

| Rule | Description | Validation Impact |
|------|-------------|-------------------|
| **Ages > 89** | All ages above 89 must be aggregated to "90 or older" | If an `age` class is added in the future, flag values > 89 |
| **ZIP Code Population** | First 3 digits of ZIP may be retained only if the geographic area has >= 20,000 population | 17 specific 3-digit prefixes must be zeroed: `036, 059, 063, 102, 203, 556, 692, 790, 821, 823, 830, 831, 878, 879, 884, 890, 893` |
| **State-level geography** | State names are **above** the Safe Harbor threshold — annotating state alone may be unnecessary | Flag `state` annotations that appear without accompanying `address`, `city`, or `zip_code` nearby |
| **Partial identifiers** | Masked/partial SSN, card numbers etc. are still PHI | Masked formats (e.g., `***-**-1234`, `XXXX-XXXX-XXXX-5678`) should still be annotated |
