# API Reference

All endpoints are prefixed with `/api/`. Authentication is session-based (Django sessions + DRF SessionAuthentication) with CSRF protection on all mutating requests.

Default pagination: `PageNumberPagination` with `page_size=20`. Use `?page=N` and `?page_size=N` query parameters.

---

## Authentication (`/api/auth/`)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/api/auth/login/` | AllowAny | Login with email + password. Returns user data + sets session cookie |
| POST | `/api/auth/logout/` | Authenticated | Logout. Clears session |
| GET | `/api/auth/me/` | Authenticated | Get current authenticated user info |
| POST | `/api/auth/change-password/` | Authenticated | Change password (old_password, new_password) |
| POST | `/api/auth/forgot-password/` | AllowAny | Request password reset (stub — always returns success) |
| POST | `/api/auth/reset-password/` | AllowAny | Reset password with token (stub — no email service) |

---

## Users (`/api/users/`)

DRF router-registered ViewSet. All endpoints require `IsAuthenticated + IsAdmin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List users. Filters: `?search=`, `?role=`, `?status=` |
| POST | `/api/users/` | Create user with temporary password |
| PATCH | `/api/users/{id}/` | Update user details (name, role) |
| POST | `/api/users/{id}/deactivate/` | Deactivate user and unassign their ASSIGNED jobs |
| POST | `/api/users/{id}/activate/` | Reactivate user |
| GET | `/api/users/{id}/job_impact/` | Check impact of deactivating user (assigned job counts) |

---

## Annotation Classes (`/api/annotation-classes/`)

DRF router-registered ViewSet.

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/annotation-classes/` | IsAnyRole | List all active (non-deleted) annotation classes |
| POST | `/api/annotation-classes/` | IsAdmin | Create annotation class (name, display_label, color, description) |
| PATCH | `/api/annotation-classes/{id}/` | IsAdmin | Update annotation class |
| DELETE | `/api/annotation-classes/{id}/` | IsAdmin | Soft-delete annotation class (sets `is_deleted=True`) |
| GET | `/api/annotation-classes/{id}/usage/` | IsAnyRole | Get count of annotations referencing this class |

---

## Datasets (`/api/datasets/`)

DRF router-registered ViewSet. All endpoints require `IsAuthenticated + IsAdmin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/datasets/` | List datasets. Filter: `?search=` |
| GET | `/api/datasets/{id}/` | Get dataset details |
| DELETE | `/api/datasets/{id}/` | Delete dataset (blocked if jobs are in-progress) |
| POST | `/api/datasets/upload/` | Upload .zip file (multipart/form-data: `file`, `name`). Extracts .eml files and creates jobs |
| GET | `/api/datasets/{id}/status/` | Poll extraction status |
| GET | `/api/datasets/{id}/jobs/` | List jobs in dataset. Filters: `?status=`, `?search=` |

---

## Jobs (`/api/jobs/`)

DRF router-registered ViewSet. All endpoints require `IsAuthenticated + IsAdmin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/{id}/` | Get job details |
| GET | `/api/jobs/{id}/raw-content/` | Get raw .eml file content |
| GET | `/api/jobs/unassigned/` | List unassigned jobs. Params: `?type=ANNOTATION\|QA`, `?dataset_id=`, `?search=` |
| GET | `/api/jobs/assigned/` | List assigned jobs. Params: `?type=ANNOTATION\|QA`, `?dataset_id=`, `?search=` |
| GET | `/api/jobs/in-progress/` | List in-progress jobs. Params: `?type=ANNOTATION\|QA` |
| GET | `/api/jobs/workloads/` | Get workload counts per assignee |
| POST | `/api/jobs/assign/` | Assign jobs to user. Body: `{ job_ids, user_id, type, expected_status }` |
| POST | `/api/jobs/assign-bulk/` | Bulk assign (round-robin). Body: `{ job_ids, user_ids, type }`. Atomic transaction |
| POST | `/api/jobs/reassign/` | Reassign jobs. Body: `{ job_ids, user_id, type }` |

---

## Annotations (`/api/annotations/`)

Custom URL patterns. All endpoints require `IsAuthenticated + IsAnnotator`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/annotations/my-jobs/` | List annotator's assigned jobs with status counts. Filters: `?status=` (comma-separated), `?search=` |
| GET | `/api/annotations/jobs/{job_id}/` | Get job with current annotations for annotation workspace |
| GET | `/api/annotations/jobs/{job_id}/raw-content/` | Get raw and CRLF-normalized .eml content |
| POST | `/api/annotations/jobs/{job_id}/start/` | Start annotation — transitions ASSIGNED_ANNOTATOR → ANNOTATION_IN_PROGRESS. Body: `{ expected_status }` |
| GET | `/api/annotations/jobs/{job_id}/draft/` | Get saved draft annotations |
| PUT | `/api/annotations/jobs/{job_id}/draft/` | Save draft annotations. Body: `{ annotations: [...] }` |
| POST | `/api/annotations/jobs/{job_id}/submit/` | Submit annotations — creates AnnotationVersion, transitions to SUBMITTED_FOR_QA. Body: `{ annotations: [...], expected_status }` |

---

## QA Review (`/api/qa/`)

Custom URL patterns. All endpoints require `IsAuthenticated + IsQA`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/qa/my-jobs/` | List QA reviewer's assigned jobs with status counts. Filters: `?status=`, `?search=` |
| GET | `/api/qa/settings/blind-review/` | Get blind review setting (whether annotator identity is hidden) |
| GET | `/api/qa/jobs/{job_id}/` | Get job with annotations for QA review |
| GET | `/api/qa/jobs/{job_id}/raw-content/` | Get raw and normalized .eml content |
| POST | `/api/qa/jobs/{job_id}/start/` | Start QA review — transitions ASSIGNED_QA → QA_IN_PROGRESS. Body: `{ expected_status }` |
| POST | `/api/qa/jobs/{job_id}/accept/` | Accept annotations. Body: `{ annotations: [...], modifications_summary, expected_status }`. Creates QAReviewVersion; if modified, creates new AnnotationVersion (source=QA). Transitions to QA_ACCEPTED then DELIVERED |
| POST | `/api/qa/jobs/{job_id}/reject/` | Reject annotations. Body: `{ comments, expected_status }`. Creates QAReviewVersion. Transitions to QA_REJECTED then ASSIGNED_ANNOTATOR |
| GET | `/api/qa/jobs/{job_id}/draft/` | Get saved QA review draft |
| PUT | `/api/qa/jobs/{job_id}/draft/` | Save QA review draft. Body: `{ data: {...} }` |

---

## Version History (`/api/history/`)

Custom URL patterns. Requires `IsAuthenticated + IsAnyRole`. Access is scoped: admins see all jobs, annotators see their own, QA users see their reviewed/assigned jobs.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history/jobs/{job_id}/` | Get full version timeline (AnnotationVersions + QAReviewVersions) |
| GET | `/api/history/jobs/{job_id}/info/` | Get basic job info (name, dataset, status, dates) |
| GET | `/api/history/versions/{version_id}/annotations/` | Get all annotations for a specific AnnotationVersion |

---

## Exports (`/api/exports/`)

Custom URL patterns. All endpoints require `IsAuthenticated + IsAdmin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exports/datasets/` | List datasets that have at least one DELIVERED job, with delivered count |
| GET | `/api/exports/datasets/{dataset_id}/jobs/` | List delivered jobs in a dataset with annotation counts |
| GET | `/api/exports/preview/{job_id}/` | Preview de-identified content for a single job (original vs replaced) |
| GET | `/api/exports/` | List export history records. Filter: `?dataset_id=` |
| POST | `/api/exports/` | Create export — de-identifies and zips delivered jobs. Body: `{ dataset_id, job_ids }`. Returns `{ id, download_url }` |
| GET | `/api/exports/{export_id}/download/` | Download export .zip file. Uses `StreamingHttpResponse` for files >1MB |

---

## Dashboard (`/api/dashboard/`)

Custom URL patterns. All endpoints require `IsAuthenticated + IsAdmin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats/` | Aggregate counts: total datasets, total jobs, pending assignment, in-progress, delivered, awaiting QA |
| GET | `/api/dashboard/job-status-counts/` | Job count per status. Optional filter: `?dataset_id=` |
| GET | `/api/dashboard/recent-datasets/` | 5 most recent datasets with job summaries |
| GET | `/api/dashboard/annotator-performance/` | Per-annotator metrics: assigned, completed, in-progress, acceptance rate |
| GET | `/api/dashboard/qa-performance/` | Per-QA metrics: reviewed, accepted, rejected, in-review |

---

## Settings (`/api/settings/`)

Custom URL patterns. All endpoints require `IsAuthenticated + IsAdmin`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/blind-review/` | Get blind review toggle value |
| PUT | `/api/settings/blind-review/` | Update blind review toggle. Body: `{ enabled: true\|false }` |
| GET | `/api/settings/min-annotation-length/` | Get minimum annotation length (default: 1). Returns `{ min_length: number }` |
| PUT | `/api/settings/min-annotation-length/` | Update minimum annotation length. Body: `{ min_length: number }` |

---

## Health Check (`/api/health/`)

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | `/api/health/` | AllowAny | Returns `{ "status": "ok" }` |

---

## Key Implementation Details

### Optimistic Locking

Five job transition endpoints accept an `expected_status` parameter. If the job's current status doesn't match, a `409 Conflict` response is returned. This prevents race conditions from concurrent users:

- `POST /api/jobs/assign/`
- `POST /api/annotations/jobs/{job_id}/start/`
- `POST /api/annotations/jobs/{job_id}/submit/`
- `POST /api/qa/jobs/{job_id}/start/`
- `POST /api/qa/jobs/{job_id}/accept/` and `reject/`

### Transaction Safety

Atomic transactions (`@transaction.atomic` + `select_for_update()`) are used on:
- `submit_annotation` — creates AnnotationVersion + Annotations + updates Job status
- `accept_annotation` — creates QAReviewVersion + optional AnnotationVersion + updates Job status
- `reject_annotation` — creates QAReviewVersion + updates Job status
- `assign_bulk` — bulk job assignment

### De-identification (Export)

The export endpoint applies a descending-offset replacement algorithm:
1. Loads raw .eml content (preserving CRLF line endings)
2. Sorts annotations by `start_offset` descending
3. Maps CRLF-stripped annotation offsets back to original positions using `to_original_offset()`
4. Replaces each PII span with its tag (e.g., `[email_1]`)
5. Writes output .eml files to a .zip archive

### Error Response Format

```json
{
  "detail": "Error message string"
}
```

Or for validation errors:
```json
{
  "field_name": ["Error message"]
}
```

Status codes: 400 (validation), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict/optimistic lock failure), 500+ (server error).
