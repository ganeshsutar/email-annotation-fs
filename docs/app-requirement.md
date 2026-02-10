# Email PII De-Identification Annotation Platform

## 1. Overview

A web-based platform for annotating Personally Identifiable Information (PII) in email (.eml) files. Admins upload email datasets, assign annotation jobs to annotators, and assign QA review jobs to QA users. Annotators identify and tag PII spans in raw email content. QA users verify annotations, accepting or rejecting them. Accepted annotations are exported as de-identified .eml files with PII replaced by class-based placeholders.

## 2. User Roles

| Role | Description |
|------|-------------|
| **ADMIN** | Manages datasets, annotation classes, user accounts, job assignments, and exports |
| **ANNOTATOR** | Annotates PII spans in assigned email jobs |
| **QA** | Reviews annotator work; accepts, modifies, or rejects annotations |

## 3. Core Workflows

### 3.1 Dataset Upload & Job Creation (Admin)

1. Admin uploads a `.zip` archive containing `.eml` files
2. System extracts and validates each `.eml` file
3. Each `.eml` file becomes a **job** (unit of work)
4. System deduplicates: skips duplicates within the archive (same content hash) and files already existing in the database (global dedup). Duplicate count is tracked on the dataset.
5. Jobs are grouped under the dataset they were uploaded from
6. Admin can view the dataset with list of all jobs and their statuses

### 3.2 Job Assignment (Admin)

Admin assigns jobs to annotators using one of:
- **Manual**: Admin selects specific jobs and assigns to a chosen annotator
- **Round-robin**: System distributes jobs evenly across selected annotators

Same strategies apply for assigning QA jobs to QA users.

### 3.3 Annotation Workflow (Annotator)

1. Annotator logs in and sees a dashboard with a table of assigned jobs
2. Annotator opens a job, which displays:
   - **Raw view**: Full `.eml` file content (headers + body) — the primary working view
   - **Email viewer**: Parsed, structured view of the email (see §7.4 Email Viewer)
   - **Email preview**: Rendered HTML/text view of the email for reference
3. Annotator selects/highlights text spans in the raw view
4. For each selection, annotator assigns a PII class from the configured class list
5. System auto-generates indexed tags (e.g., `[email_1]`, `[email_2]` for multiple emails)
6. Annotator can review all tagged spans before submitting
7. Annotator submits the completed annotation — system creates a new **AnnotationVersion** (version 1)
8. Job status moves to **Annotated** and enters the QA pool
9. If the job is rejected by QA and reworked, each resubmission creates a new **AnnotationVersion** (version 2, 3, …)
10. All annotation versions are retained; the latest version is the active one used for QA and export

### 3.4 QA Workflow

1. Completed annotation jobs automatically enter the **QA pool**
2. Admin assigns jobs from the QA pool to QA users (manual or round-robin)
3. QA user logs in and sees a dashboard with assigned QA jobs
4. QA user opens a job, which displays:
   - Raw `.eml` content with annotated PII spans highlighted
   - Email viewer — parsed, structured view of the email (see §7.4 Email Viewer)
   - Email preview for reference
   - List of all annotations (span, class, tag)
   - Annotator identity (configurable — admin can enable **blind review** to hide this)
5. QA user can:
   - **Modify** annotations (adjust spans, change classes, add/remove tags)
   - **Accept** — system creates a **QAReviewVersion** recording the decision and any modifications; job moves to **Delivered** status
   - **Reject** — system creates a **QAReviewVersion** with rejection comments; job goes back to the original annotator for rework
6. Each QA action (accept/reject) creates a new **QAReviewVersion** (version 1, 2, …) — all versions are retained
7. If QA modifies annotations before accepting, the modifications are stored as a separate **AnnotationVersion** authored by the QA user
8. Rejected jobs appear on the annotator's dashboard with QA feedback for rework

### 3.5 Delivery & Export

1. Accepted jobs move to **Delivered** status
2. Admin can view all delivered jobs
3. Admin can export delivered jobs, generating output `.eml` files where all annotated PII spans are replaced with their corresponding tags
4. Export format: `.eml` files matching the pattern in `docs/output-format/`

## 4. Job Status Lifecycle

```
UPLOADED → ASSIGNED_ANNOTATOR → ANNOTATION_IN_PROGRESS → SUBMITTED_FOR_QA
    → ASSIGNED_QA → QA_IN_PROGRESS
                         ↓
                  ┌──────┴──────┐
                  ↓             ↓
            QA_ACCEPTED    QA_REJECTED
                  ↓             ↓
              DELIVERED    (back to ASSIGNED_ANNOTATOR
                            for rework)
```

## 5. Annotation Classes (PII Types)

### 5.1 Class Management

- Admin can **create**, **edit**, and **delete** annotation classes
- Each class has:
  - **Name**: Machine-readable identifier used in tags (e.g., `email`, `first_name_person`)
  - **Display label**: Human-readable name shown in UI (e.g., "Email Address", "First Name")
  - **Color**: For visual highlighting in the annotation interface
  - **Description**: Optional guidance for annotators

### 5.2 Default Classes (based on output format analysis)

| Class Name | Display Label | Example Tag | Example Value |
|------------|--------------|-------------|---------------|
| `email` | Email Address | `[email_1]` | `micheal.ucheh@gmail.com` |
| `first_name_person` | First Name | `[first_name_person_1]` | `Micheal` |
| `last_name_person` | Last Name | `[last_name_person_1]` | `Ucheh` |
| `phone` | Phone Number | `[phone_1]` | `+1-555-123-4567` |
| `address` | Street Address | `[address_1]` | `5556 GLIMMERGLASS PATH` |
| `city` | City | `[city_1]` | `BREWERTON` |
| `state` | State | `[state_1]` | `NY` |
| `zip_code` | ZIP Code | `[zip_code_1]` | `13029` |
| `card_number` | Card Number | `[card_number_1]` | `****4288` |
| `account_number` | Account Number | `[account_number_1]` | `00364052040*` |
| `full_name_person` | Full Name | `[full_name_person_1]` | `YAMILKA CIRINO` |

### 5.3 Tag Format

- Pattern: `[class_name_N]` where `N` is the instance index (1-based)
- Same PII value appearing multiple times in an email uses the **same** tag index
- Example: If `micheal.ucheh@gmail.com` appears 3 times, all 3 are tagged `[email_1]`
- A different email address in the same file would be `[email_2]`

## 6. Functional Requirements

### 6.0 Shared Features (All Roles)

| ID | Feature | Description |
|----|---------|-------------|
| S-1 | Email viewer | Parsed, read-only view of any `.eml` file showing From, To, CC, BCC, Subject, Date, Reply-To, and body in an email-client-style layout (see §7.4) |

### 6.1 Admin Features

| ID | Feature | Description |
|----|---------|-------------|
| A-1 | Dataset upload | Upload `.zip` of `.eml` files; system extracts and creates jobs |
| A-2 | Dataset management | View datasets, job counts, status summaries |
| A-3 | Annotation class management | CRUD operations on PII annotation classes |
| A-4 | Annotator job assignment | Assign annotation jobs manually or via round-robin |
| A-5 | QA job assignment | Assign QA jobs from the QA pool manually or via round-robin |
| A-6 | User management | Create/manage users with roles (Admin, Annotator, QA) |
| A-7 | Dashboard | Overview of all datasets, jobs by status, annotator/QA performance |
| A-8 | Export | Export delivered (QA-accepted) jobs as de-identified `.eml` files |
| A-9 | Blind review toggle | Configure whether QA users can see annotator identity |
| A-10 | Version audit | View full version history (annotation + QA) for any job, with diffs between versions |
| A-11 | Min annotation length setting | Configure minimum character length for annotation spans |

### 6.2 Annotator Features

| ID | Feature | Description |
|----|---------|-------------|
| AN-1 | Dashboard | Table of assigned jobs with status, dataset name, and priority |
| AN-2 | Raw .eml viewer | Display full raw `.eml` content for annotation |
| AN-3 | Email preview | Rendered HTML/text preview of the email |
| AN-4 | Highlight & tag | Select text spans in raw view and assign PII class |
| AN-5 | Auto-indexing | System auto-assigns index numbers to tags (e.g., `[email_1]`, `[email_2]`) |
| AN-6 | Annotation summary | Review all annotations before submission |
| AN-7 | Submit annotation | Submit completed work; job moves to QA pool |
| AN-8 | Rework view | See rejected jobs with QA feedback; re-annotate and resubmit |
| AN-9 | Version history | View previous annotation versions and compare changes across submissions |

### 6.3 QA Features

| ID | Feature | Description |
|----|---------|-------------|
| QA-1 | Dashboard | Table of assigned QA jobs with status |
| QA-2 | Annotation review | View raw `.eml` with highlighted annotations and email preview |
| QA-3 | Modify annotations | Adjust spans, change classes, add or remove annotations |
| QA-4 | Accept | Approve annotation; job moves to Delivered |
| QA-5 | Reject | Reject with comments; job returns to annotator for rework |
| QA-6 | Version history | View all annotation versions and QA review versions for a job; compare diffs between versions |

## 7. Annotation Interface Specification

### 7.1 Layout

The annotation screen has two panels:

- **Left panel (primary)**: Raw `.eml` content editor
  - Full text of the `.eml` file displayed with monospace font
  - Text selection enabled for highlighting spans
  - Annotated spans shown with colored highlights matching their class color
  - Clicking an annotated span shows its class and tag
- **Right panel (secondary)**:
  - **Email viewer tab**: Parsed, structured view of the email (see §7.4 Email Viewer)
  - **Email preview tab**: Rendered HTML/text view of the email as originally formatted
  - **Annotations tab**: List of all annotations with span text, class, tag, and actions (edit/delete)

### 7.2 Annotation Flow

1. User selects text in the raw view
2. A popup/dropdown appears with available PII classes
3. User picks a class
4. System checks if the exact same text already has a tag in this email — if so, reuses the same index
5. Otherwise, assigns the next available index for that class
6. The span is highlighted with the class color
7. User can click any highlight to modify or remove it

### 7.3 Same-Value Linking

When annotating, if the annotator selects text that exactly matches a previously tagged value:
- System suggests reusing the existing tag (e.g., "This matches `[email_1]` — use same tag?")
- Annotator can confirm or create a new tag

### 7.4 Email Viewer

A read-only, parsed view of the `.eml` file available to **all roles** (Admin, Annotator, QA). The system parses the raw `.eml` and displays it in a clean, email-client-style layout:

**Header section:**
- **Sender avatar**: Circular badge showing sender initials (e.g., "WS" for William Smith)
- **From**: Sender display name
- **Date/time**: Send date and time (e.g., "Oct 22, 2023, 9:00:00 AM")
- **Subject**: Email subject line
- **Reply-To**: Reply-to address (if present)
- **To**: Recipient(s)
- **CC**: CC recipients (if present)
- **BCC**: BCC recipients (if present, typically only in sent-mail .eml files)

**Body section** (below a visual divider):
- Plain-text rendering of the email body
- If the email is HTML-only, render as readable text
- Multipart emails show the text part by default

**Behavior:**
- This view is read-only — no annotation or editing is performed here
- Accessible from the job detail screen as a tab alongside the raw view and annotations
- Admin can open the email viewer for any job from the dataset/job list
- Annotators and QA users see it as a tab in their annotation/review interface

## 8. Data Model (Conceptual)

> **Note**: All models use UUID primary keys and are implemented as Django models. See `backend/*/models.py` for authoritative field definitions.

### User
- id (UUID PK), name, email (unique, used as USERNAME_FIELD), role (ADMIN | QA | ANNOTATOR), status (ACTIVE | INACTIVE), force_password_change (boolean), created_at, updated_at

### Dataset
- id (UUID PK), name, uploaded_by (User FK), upload_date, file_count, duplicate_count, status (UPLOADING | EXTRACTING | READY | FAILED), error_message

### Job
- id (UUID PK), dataset (Dataset FK), file_name, eml_content_compressed (BinaryField — zlib), content_hash (SHA-256, indexed), status (UPLOADED | ASSIGNED_ANNOTATOR | ANNOTATION_IN_PROGRESS | SUBMITTED_FOR_QA | ASSIGNED_QA | QA_IN_PROGRESS | QA_ACCEPTED | QA_REJECTED | DELIVERED), assigned_annotator (nullable User FK), assigned_qa (nullable User FK), created_at, updated_at

### AnnotationClass
- id (UUID PK), name, display_label, color, description, created_by (User FK), is_deleted (soft-delete flag), created_at

### AnnotationVersion
- id (UUID PK), job (Job FK), version_number (1, 2, 3, …), created_by (User FK — annotator or QA user), source (ANNOTATOR | QA), created_at
- Represents a complete snapshot of all annotations for a job at a point in time
- Version 1 = initial annotator submission; version 2+ = rework after rejection or QA modifications
- The latest version is the active one used for QA review and export

### Annotation
- id (UUID PK), annotation_version (AnnotationVersion FK), class_id (AnnotationClass FK), class_name, tag (e.g., `[email_1]`), start_offset, end_offset, original_text, created_at
- Each annotation belongs to a specific AnnotationVersion

### DraftAnnotation
- id (UUID PK), job (Job FK, unique — one draft per job), annotations (JSON), updated_at
- Stores in-progress annotation work before submission

### QAReviewVersion
- id (UUID PK), job (Job FK), version_number (1, 2, 3, …), annotation_version (AnnotationVersion FK — the version being reviewed), reviewed_by (User FK), decision (ACCEPT | REJECT), comments, modifications_summary, reviewed_at
- Each QA action (accept or reject) creates a new version
- All versions are retained for audit trail
- If QA modifies annotations before accepting, a new AnnotationVersion (with source=QA) is created and linked here

### QADraftReview
- id (UUID PK), job (Job FK, unique — one draft per job), data (JSON), updated_at
- Stores in-progress QA review work before acceptance/rejection

### PlatformSetting
- id (UUID PK), key (unique string), value (string)
- Used for platform-wide settings such as the blind review toggle

### ExportRecord
- id (UUID PK), dataset (Dataset FK), job_ids (JSON array), file_size, file_path, exported_by (User FK), exported_at

## 9. Export Format

The export generates `.eml` files where every annotated PII span is replaced with its tag:

**Before (raw):**
```
Delivered-To: micheal.ucheh@gmail.com
...
To: micheal.ucheh@gmail.com
```

**After (exported):**
```
Delivered-To: [email_1]
...
To: [email_1]
```

- Output filenames follow the pattern: `REDACTED_{id}_{original_filename}`
- Export can be downloaded as a `.zip` of all delivered `.eml` files from a dataset

## 10. Non-Functional Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| NF-1 | Authentication | Secure login with role-based access control |
| NF-2 | Responsive UI | Works on desktop browsers (min 1280px width) |
| NF-3 | Performance | Annotation interface should handle `.eml` files up to 5MB |
| NF-4 | Data integrity | Annotations stored with character offsets for precise span tracking |
| NF-5 | Audit trail | Track who annotated, who reviewed, timestamps for all actions |
| NF-6 | Concurrent access | Multiple users can work on different jobs simultaneously |
