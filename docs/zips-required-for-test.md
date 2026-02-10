# Test Fixture Files for Dataset Management E2E Tests

The following files must be placed in `frontend/e2e/fixtures/` before running dataset management tests.

## Required Files

### 1. `sample-emails.zip`

A valid ZIP archive containing **3 unique `.eml` files**:

| File | Description |
|------|-------------|
| `email1.eml` | Valid RFC 5322 email with recognizable PII (e.g., name, email address, phone number in the body) |
| `email2.eml` | Valid RFC 5322 email with different PII content than email1 |
| `email3.eml` | Valid RFC 5322 email with different PII content than email1 and email2 |

**Purpose:** Core upload, list, detail, and delete tests (4.1.2, 4.1.3, 4.2.x, 4.3.x, 4.4.x).

Each `.eml` file should have:
- `From:`, `To:`, `Subject:`, `Date:` headers
- A plain-text body containing at least one PII-like string (e.g., an email address, phone number, or account number)
- Different `Subject` lines so they are easily distinguishable
- Files must be byte-unique (different SHA-256 hashes)

---

### 2. `duplicate-emails.zip`

A ZIP archive containing **3 `.eml` files where 2 are byte-identical**:

| File | Description |
|------|-------------|
| `msg-a.eml` | Valid `.eml` file |
| `msg-a-copy.eml` | **Exact byte copy** of `msg-a.eml` (same SHA-256 hash, different filename) |
| `msg-b.eml` | Valid `.eml` file with unique content |

**Purpose:** Test 4.1.7 (intra-zip deduplication). The backend deduplicates by SHA-256 hash, so `msg-a.eml` and `msg-a-copy.eml` should result in `duplicate_count >= 1`.

---

### 3. `overlapping-emails.zip`

A ZIP archive containing **2 `.eml` files**:

| File | Description |
|------|-------------|
| `email1-dup.eml` | **Exact byte copy** of `email1.eml` from `sample-emails.zip` (same SHA-256 hash) |
| `email4.eml` | Valid `.eml` file with unique content not present in any other fixture |

**Purpose:** Test 4.1.8 (global/cross-dataset deduplication). When uploaded after `sample-emails.zip`, the backend should detect `email1-dup.eml` as a duplicate of the already-uploaded `email1.eml`.

---

### 4. `no-eml-files.zip`

A valid ZIP archive containing **only non-`.eml` files**:

| File | Description |
|------|-------------|
| `readme.txt` | Plain text file (e.g., "This is a readme.") |
| `data.csv` | CSV file (e.g., "name,email\nJohn,john@example.com") |

**Purpose:** Test 4.1.6 (empty zip rejection). The backend should mark the dataset as FAILED because no `.eml` files were found.

---

### 5. `not-a-zip.txt`

A **plain text file** (not a ZIP archive):

```
This is not a zip file. It is plain text used for testing upload validation.
```

**Purpose:** Test 4.1.5 (non-zip file rejection). The file input accepts `.zip` only, so we use `setInputFiles` to bypass the browser filter and verify backend/frontend validation.

---

## Quick Setup

```bash
cd frontend/e2e/fixtures/

# Verify all files exist:
ls -la sample-emails.zip duplicate-emails.zip overlapping-emails.zip no-eml-files.zip not-a-zip.txt
```

## Verification Checklist

- [ ] `sample-emails.zip` contains exactly 3 unique `.eml` files
- [ ] `duplicate-emails.zip` contains 3 `.eml` files, 2 of which are byte-identical
- [ ] `overlapping-emails.zip` contains 1 `.eml` file byte-identical to `email1.eml` from `sample-emails.zip` + 1 new unique `.eml`
- [ ] `no-eml-files.zip` contains only non-`.eml` files
- [ ] `not-a-zip.txt` is a plain text file (not a valid ZIP)
