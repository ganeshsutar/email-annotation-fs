# E2E Testing Use-Cases

Comprehensive module-by-module end-to-end test cases for the Email PII De-Identification Annotation Platform.

## Table of Contents

- [1. Authentication & Authorization](#1-authentication--authorization)
  - [1.1 Login Page Display](#11-login-page-display)
  - [1.2 Login Flows](#12-login-flows)
  - [1.3 Route Guards & Session](#13-route-guards--session)
- [2. User Management (Admin Only)](#2-user-management-admin-only)
  - [2.1 Users List Page](#21-users-list-page)
  - [2.2 Create User](#22-create-user)
  - [2.3 Edit User](#23-edit-user)
  - [2.4 Deactivate / Activate User](#24-deactivate--activate-user)
- [3. Annotation Class Management (Admin Only)](#3-annotation-class-management-admin-only)
  - [3.1 Annotation Classes List](#31-annotation-classes-list)
  - [3.2 Create Annotation Class](#32-create-annotation-class)
  - [3.3 Edit Annotation Class](#33-edit-annotation-class)
  - [3.4 Delete Annotation Class](#34-delete-annotation-class)
- [4. Dataset Management (Admin Only)](#4-dataset-management-admin-only)
  - [4.1 Upload Dataset](#41-upload-dataset)
  - [4.2 Dataset List](#42-dataset-list)
  - [4.3 Dataset Detail](#43-dataset-detail)
  - [4.4 Delete Dataset](#44-delete-dataset)
- [5. Job Assignment (Admin Only)](#5-job-assignment-admin-only)
  - [5.1 Assignment Page Layout](#51-assignment-page-layout)
  - [5.2 Manual Assignment](#52-manual-assignment)
  - [5.3 Round-Robin Distribution](#53-round-robin-distribution)
  - [5.4 Reassignment](#54-reassignment)
  - [5.5 Optimistic Locking](#55-optimistic-locking)
- [6. Annotation Workflow (Annotator)](#6-annotation-workflow-annotator)
  - [6.1 Annotator Dashboard](#61-annotator-dashboard)
  - [6.2 Start Annotation](#62-start-annotation)
  - [6.3 Text Selection & Annotation](#63-text-selection--annotation)
  - [6.4 Same-Value Linking](#64-same-value-linking)
  - [6.5 Save Draft](#65-save-draft)
  - [6.6 Submit Annotation](#66-submit-annotation)
  - [6.7 Rework After QA Rejection](#67-rework-after-qa-rejection)
- [7. QA Review Workflow (QA Reviewer)](#7-qa-review-workflow-qa-reviewer)
  - [7.1 QA Dashboard](#71-qa-dashboard)
  - [7.2 Start QA Review](#72-start-qa-review)
  - [7.3 Review Annotations](#73-review-annotations)
  - [7.4 QA Edit Mode](#74-qa-edit-mode)
  - [7.5 Accept Job](#75-accept-job)
  - [7.6 Reject Job](#76-reject-job)
  - [7.7 Blind Review](#77-blind-review)
- [8. Export & De-identification (Admin Only)](#8-export--de-identification-admin-only)
  - [8.1 Export Page Layout](#81-export-page-layout)
  - [8.2 Delivered Jobs Table](#82-delivered-jobs-table)
  - [8.3 Export Preview](#83-export-preview)
  - [8.4 Export & Download](#84-export--download)
  - [8.5 Export History](#85-export-history)
- [9. Version History (All Roles — Scoped)](#9-version-history-all-roles--scoped)
  - [9.1 Access & Navigation](#91-access--navigation)
  - [9.2 Version Timeline](#92-version-timeline)
  - [9.3 Version Detail View](#93-version-detail-view)
  - [9.4 Version Comparison](#94-version-comparison)
- [10. Admin Dashboard](#10-admin-dashboard)
  - [10.1 Stats Cards](#101-stats-cards)
  - [10.2 Job Status Chart](#102-job-status-chart)
  - [10.3 Recent Datasets Table](#103-recent-datasets-table)
  - [10.4 Performance Tables](#104-performance-tables)
  - [10.5 Quick Actions](#105-quick-actions)
- [11. Settings (Admin Only)](#11-settings-admin-only)
  - [11.1 Blind Review Toggle](#111-blind-review-toggle)
  - [11.2 Min Annotation Length](#112-min-annotation-length)
- [12. Cross-Cutting Concerns](#12-cross-cutting-concerns)
  - [12.1 Toast Notifications](#121-toast-notifications)
  - [12.2 Loading States](#122-loading-states)
  - [12.3 Empty States](#123-empty-states)
  - [12.4 Pagination](#124-pagination)
  - [12.5 Theme](#125-theme)
  - [12.6 Responsive Layout](#126-responsive-layout)
- [13. Full End-to-End Lifecycle Scenarios](#13-full-end-to-end-lifecycle-scenarios)
  - [13.1 Complete Annotation Lifecycle](#131-complete-annotation-lifecycle)
  - [13.2 User Lifecycle](#132-user-lifecycle)
  - [13.3 Concurrent Access Scenario](#133-concurrent-access-scenario)
- [Appendix A: `data-testid` Reference](#appendix-a-data-testid-reference)

---

**Conventions:**
- Each test case specifies required `data-testid` attributes in **bold monospace**
- Role prerequisites are noted per section
- Status transitions reference the job lifecycle: `UPLOADED → ASSIGNED_ANNOTATOR → ANNOTATION_IN_PROGRESS → SUBMITTED_FOR_QA → ASSIGNED_QA → QA_IN_PROGRESS → QA_ACCEPTED/QA_REJECTED → DELIVERED`

---

## 1. Authentication & Authorization

### 1.1 Login Page Display

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 1.1.1 | Login form renders correctly | Navigate to `/login` | Heading "Welcome back" visible; email input, password input, submit button all visible | `data-testid="login-email"`, `data-testid="login-password"`, `data-testid="login-submit"` |
| 1.1.2 | Submit button disabled when fields empty | Navigate to `/login`, leave both fields empty | Submit button is disabled | `data-testid="login-submit"` |
| 1.1.3 | Submit button disabled with only email | Fill email, leave password empty | Submit button remains disabled | `data-testid="login-email"`, `data-testid="login-submit"` |
| 1.1.4 | Submit button disabled with only password | Fill password, leave email empty | Submit button remains disabled | `data-testid="login-password"`, `data-testid="login-submit"` |
| 1.1.5 | Submit button enabled when both filled | Fill both email and password | Submit button becomes enabled | `data-testid="login-email"`, `data-testid="login-password"`, `data-testid="login-submit"` |

### 1.2 Login Flows

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 1.2.1 | Admin login succeeds | Enter valid admin credentials, click submit | Redirected to `/admin/dashboard` | `data-testid="login-email"`, `data-testid="login-password"`, `data-testid="login-submit"` |
| 1.2.2 | Annotator login succeeds | Enter valid annotator credentials, click submit | Redirected to `/annotator/dashboard` | Same as above |
| 1.2.3 | QA login succeeds | Enter valid QA credentials, click submit | Redirected to `/qa/dashboard` | Same as above |
| 1.2.4 | Invalid credentials show error | Enter wrong email/password, click submit | Alert with "Invalid email or password." visible | `data-testid="login-error"` |
| 1.2.5 | Deactivated account rejected | Enter credentials for deactivated user, click submit | Alert with "This account has been deactivated." visible | `data-testid="login-error"` |

### 1.3 Route Guards & Session

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 1.3.1 | Unauthenticated redirect from admin | Navigate to `/admin/dashboard` without login | Redirected to `/login` | — |
| 1.3.2 | Unauthenticated redirect from annotator | Navigate to `/annotator/dashboard` without login | Redirected to `/login` | — |
| 1.3.3 | Unauthenticated redirect from QA | Navigate to `/qa/dashboard` without login | Redirected to `/login` | — |
| 1.3.4 | Annotator blocked from admin routes | Login as annotator, navigate to `/admin/dashboard` | Redirected to `/unauthorized` | `data-testid="unauthorized-page"` |
| 1.3.5 | QA blocked from admin routes | Login as QA, navigate to `/admin/users` | Redirected to `/unauthorized` | `data-testid="unauthorized-page"` |
| 1.3.6 | Admin blocked from annotator routes | Login as admin, navigate to `/annotator/dashboard` | Redirected to `/unauthorized` | `data-testid="unauthorized-page"` |
| 1.3.7 | Admin blocked from QA routes | Login as admin, navigate to `/qa/dashboard` | Redirected to `/unauthorized` | `data-testid="unauthorized-page"` |
| 1.3.8 | Already-authenticated redirect from login | Login as admin, navigate back to `/login` | Redirected to `/admin/dashboard` | — |
| 1.3.9 | Logout clears session | Login as admin, click sign out | Redirected to `/login`; navigating to `/admin/dashboard` redirects to `/login` | `data-testid="sign-out-button"` |
| 1.3.10 | Root redirects to role dashboard | Login as annotator, navigate to `/` | Redirected to `/annotator/dashboard` | — |

---

## 2. User Management (Admin Only)

### 2.1 Users List Page

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 2.1.1 | Users page renders | Login as admin, navigate to `/admin/users` | Users table visible with columns: Name, Email, Role, Status, Actions | `data-testid="users-page"`, `data-testid="users-table"` |
| 2.1.2 | Search users by name | Type a user's name in search input | Table filters to matching users | `data-testid="users-search"` |
| 2.1.3 | Search users by email | Type a user's email in search input | Table filters to matching users | `data-testid="users-search"` |
| 2.1.4 | Filter by role | Select "Annotator" from role dropdown | Only annotator users shown | `data-testid="users-role-filter"` |
| 2.1.5 | Filter by status | Select "Inactive" from status dropdown | Only inactive users shown | `data-testid="users-status-filter"` |
| 2.1.6 | Combined filters | Search + role filter + status filter | Results match all filter criteria | `data-testid="users-search"`, `data-testid="users-role-filter"`, `data-testid="users-status-filter"` |
| 2.1.7 | Pagination works | Have >20 users, navigate to page 2 | Second page of users displayed, pagination controls update | `data-testid="users-pagination"` |
| 2.1.8 | Empty state | Apply filters that match no users | Empty state message displayed | `data-testid="users-empty-state"` |

### 2.2 Create User

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 2.2.1 | Open create user dialog | Click "Add User" button | Dialog opens with name, email, role fields | `data-testid="add-user-button"`, `data-testid="user-form-dialog"` |
| 2.2.2 | Create admin user | Fill name, email, select Admin role, submit | User created; success toast; temporary password displayed; dialog shows password | `data-testid="user-name-input"`, `data-testid="user-email-input"`, `data-testid="user-role-select"`, `data-testid="user-form-submit"`, `data-testid="temp-password-display"` |
| 2.2.3 | Create annotator user | Fill name, email, select Annotator role, submit | User created with ANNOTATOR role; appears in table | Same as above |
| 2.2.4 | Create QA user | Fill name, email, select QA role, submit | User created with QA role; appears in table | Same as above |
| 2.2.5 | Duplicate email rejected | Enter email that already exists, submit | Validation error: email already in use | `data-testid="user-form-error"` |
| 2.2.6 | Invalid email format rejected | Enter "not-an-email", submit | Validation error on email field | `data-testid="user-email-input"` |
| 2.2.7 | Name required | Leave name empty, fill email + role, submit | Validation error: name required | `data-testid="user-name-input"` |
| 2.2.8 | Cancel create dialog | Open dialog, fill some fields, click cancel | Dialog closes; no user created; table unchanged | `data-testid="user-form-cancel"` |

### 2.3 Edit User

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 2.3.1 | Open edit user dialog | Click edit action on a user row | Dialog opens pre-filled with user data | `data-testid="user-edit-button"`, `data-testid="user-form-dialog"` |
| 2.3.2 | Edit user name | Change name, submit | Name updated; success toast; table reflects change | `data-testid="user-name-input"`, `data-testid="user-form-submit"` |
| 2.3.3 | Change user role | Change role from Annotator to QA, submit | Role updated; success toast | `data-testid="user-role-select"` |
| 2.3.4 | Email is immutable | Open edit dialog | Email field is read-only/disabled | `data-testid="user-email-input"` |
| 2.3.5 | Cannot change last admin role | Edit the only admin user, try to change role | Error: cannot change role of last admin | `data-testid="user-form-error"` |

### 2.4 Deactivate / Activate User

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 2.4.1 | Deactivation shows impact dialog | Click deactivate on user with assigned jobs | Confirmation dialog shows number of jobs that will be unassigned | `data-testid="user-deactivate-button"`, `data-testid="deactivation-dialog"`, `data-testid="deactivation-job-impact"` |
| 2.4.2 | Confirm deactivation | Click confirm in deactivation dialog | User status changes to INACTIVE; success toast; assigned jobs unassigned (returned to UPLOADED/SUBMITTED_FOR_QA) | `data-testid="deactivation-confirm"` |
| 2.4.3 | Cancel deactivation | Click cancel in deactivation dialog | Dialog closes; user remains active | `data-testid="deactivation-cancel"` |
| 2.4.4 | Activate user | Click activate on inactive user | User status changes to ACTIVE; success toast | `data-testid="user-activate-button"` |
| 2.4.5 | Cannot deactivate self | Admin tries to deactivate themselves | Deactivate button hidden or disabled; operation rejected | `data-testid="user-deactivate-button"` |
| 2.4.6 | Cannot deactivate last admin | Only one admin exists, try to deactivate | Error: cannot deactivate the last admin | `data-testid="deactivation-dialog"` |
| 2.4.7 | Deactivated user cannot login | Deactivate a user, then try to login as that user | Login error: "This account has been deactivated." | `data-testid="login-error"` |

---

## 3. Annotation Class Management (Admin Only)

### 3.1 Annotation Classes List

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 3.1.1 | Classes page renders | Navigate to `/admin/annotation-classes` | Table visible with columns: Name, Label, Color, Description, Actions | `data-testid="annotation-classes-page"`, `data-testid="annotation-classes-table"` |
| 3.1.2 | Color swatches displayed | View classes table | Each row shows a color swatch matching the class's hex color | `data-testid="class-color-swatch"` |
| 3.1.3 | Sorted display | View classes table | Classes sorted alphabetically by name | `data-testid="annotation-classes-table"` |
| 3.1.4 | Deleted classes hidden | Soft-delete a class, reload page | Deleted class no longer appears in list | `data-testid="annotation-classes-table"` |

### 3.2 Create Annotation Class

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 3.2.1 | Open create dialog | Click "Add Class" button | Dialog opens with label, name (auto-generated), color picker, description fields | `data-testid="add-class-button"`, `data-testid="class-form-dialog"` |
| 3.2.2 | Auto-generated name from label | Type "Account Number" in display label field | Name field auto-populates with `account_number` (lowercase, underscores) | `data-testid="class-label-input"`, `data-testid="class-name-input"` |
| 3.2.3 | Create class successfully | Fill label, verify name, pick color, add description, submit | Class created; success toast; appears in table | `data-testid="class-label-input"`, `data-testid="class-color-input"`, `data-testid="class-description-input"`, `data-testid="class-form-submit"` |
| 3.2.4 | Duplicate name rejected | Create class with name that already exists | Validation error: name must be unique | `data-testid="class-form-error"` |
| 3.2.5 | Duplicate label rejected | Create class with display_label that already exists | Validation error: label must be unique | `data-testid="class-form-error"` |
| 3.2.6 | Invalid name format rejected | Manually edit name to "123-invalid" | Validation error: name must match `^[a-z][a-z0-9_]*$` | `data-testid="class-name-input"` |
| 3.2.7 | Cancel create | Open dialog, fill fields, click cancel | Dialog closes; no class created | `data-testid="class-form-cancel"` |

### 3.3 Edit Annotation Class

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 3.3.1 | Open edit dialog | Click edit action on a class row | Dialog opens pre-filled with class data | `data-testid="class-edit-button"`, `data-testid="class-form-dialog"` |
| 3.3.2 | Name is immutable | Open edit dialog | Name field is read-only/disabled | `data-testid="class-name-input"` |
| 3.3.3 | Edit label | Change display label, submit | Label updated; success toast | `data-testid="class-label-input"`, `data-testid="class-form-submit"` |
| 3.3.4 | Edit color | Pick new color, submit | Color updated; swatch in table reflects new color | `data-testid="class-color-input"` |
| 3.3.5 | Edit description | Change description, submit | Description updated | `data-testid="class-description-input"` |

### 3.4 Delete Annotation Class

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 3.4.1 | Delete shows usage dialog | Click delete on a class used in annotations | Confirmation dialog shows usage count | `data-testid="class-delete-button"`, `data-testid="class-delete-dialog"`, `data-testid="class-usage-count"` |
| 3.4.2 | Confirm delete (soft) | Click confirm in delete dialog | Class removed from list (soft-deleted); success toast | `data-testid="class-delete-confirm"` |
| 3.4.3 | Cancel delete | Click cancel in delete dialog | Dialog closes; class remains in list | `data-testid="class-delete-cancel"` |
| 3.4.4 | Delete unused class | Click delete on class with 0 annotations | Dialog shows 0 usage; delete succeeds | `data-testid="class-usage-count"` |

---

## 4. Dataset Management (Admin Only)

### 4.1 Upload Dataset

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 4.1.1 | Open upload dialog | Click "Upload Dataset" button | Dialog opens with name input and file drop zone | `data-testid="upload-dataset-button"`, `data-testid="upload-dialog"` |
| 4.1.2 | Upload .zip of .eml files | Enter dataset name, drop valid .zip, submit | Upload starts; dialog shows progress; dataset appears in table with EXTRACTING status | `data-testid="dataset-name-input"`, `data-testid="file-drop-zone"`, `data-testid="upload-submit"` |
| 4.1.3 | Extraction completes | Upload valid dataset, wait for extraction | Status transitions from EXTRACTING → READY; file count shown | `data-testid="dataset-status"` |
| 4.1.4 | Duplicate dataset name rejected | Enter name of existing dataset | Validation error: name must be unique | `data-testid="upload-error"` |
| 4.1.5 | Non-zip file rejected | Try to upload a .txt or .csv file | Validation error: only .zip files accepted | `data-testid="file-drop-zone"` |
| 4.1.6 | Empty zip rejected | Upload a .zip with no .eml files | Dataset status goes to FAILED; error message displayed | `data-testid="dataset-status"` |
| 4.1.7 | Intra-zip deduplication | Upload .zip containing duplicate .eml files | `duplicate_count` reflects number of duplicates removed | `data-testid="dataset-duplicate-count"` |
| 4.1.8 | Global deduplication | Upload .zip with .eml files already existing in another dataset | Duplicates detected via SHA-256 hash; `duplicate_count` updated | `data-testid="dataset-duplicate-count"` |
| 4.1.9 | Cancel upload | Open dialog, fill fields, click cancel | Dialog closes; no dataset created | `data-testid="upload-cancel"` |

### 4.2 Dataset List

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 4.2.1 | Datasets page renders | Navigate to `/admin/datasets` | Table visible with columns: Name, Status, Files, Duplicates, Uploaded By, Date, Actions | `data-testid="datasets-page"`, `data-testid="datasets-table"` |
| 4.2.2 | Search datasets | Type dataset name in search input | Table filters to matching datasets | `data-testid="datasets-search"` |
| 4.2.3 | Pagination | Have >20 datasets, navigate pages | Pagination controls work correctly | `data-testid="datasets-pagination"` |
| 4.2.4 | Empty state | No datasets exist or search matches nothing | Empty state message displayed | `data-testid="datasets-empty-state"` |
| 4.2.5 | Status badge display | View datasets with different statuses | StatusBadge shows correct status (UPLOADING, EXTRACTING, READY, FAILED) with appropriate styling | `data-testid="dataset-status"` |

### 4.3 Dataset Detail

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 4.3.1 | Detail page renders | Click on a dataset row / navigate to `/admin/datasets/$id` | Dataset name, status cards, jobs table visible | `data-testid="dataset-detail-page"`, `data-testid="dataset-status-cards"` |
| 4.3.2 | Status cards show counts | View dataset detail | Cards show count of jobs per status (e.g., Uploaded: 5, Assigned: 3, In Progress: 2) | `data-testid="dataset-status-cards"` |
| 4.3.3 | Clickable status cards filter | Click a status card | Jobs table filters to show only jobs with that status | `data-testid="dataset-status-cards"` |
| 4.3.4 | Jobs table displays | View dataset detail | Jobs table shows columns: File Name, Status, Annotator, QA, Actions | `data-testid="dataset-jobs-table"` |
| 4.3.5 | View raw email content | Click view action on a job row | Email viewer dialog opens with tabs: Email (parsed), Raw, History | `data-testid="job-view-button"`, `data-testid="email-viewer-dialog"` |
| 4.3.6 | Email viewer tabs | Switch between Email, Raw, History tabs | Content updates to show parsed email, raw EML content, or version history link | `data-testid="email-tab"`, `data-testid="raw-tab"`, `data-testid="history-tab"` |
| 4.3.7 | Search jobs in dataset | Type file name in search | Jobs table filters to matching jobs | `data-testid="dataset-jobs-search"` |
| 4.3.8 | Jobs pagination | Have >20 jobs, navigate pages | Pagination works correctly | `data-testid="dataset-jobs-pagination"` |

### 4.4 Delete Dataset

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 4.4.1 | Delete confirmation dialog | Click delete on a dataset | Confirmation dialog appears with dataset name | `data-testid="dataset-delete-button"`, `data-testid="dataset-delete-dialog"` |
| 4.4.2 | Delete dataset with no in-progress jobs | Confirm delete on dataset where all jobs are UPLOADED or DELIVERED | Dataset deleted; success toast; removed from table | `data-testid="dataset-delete-confirm"` |
| 4.4.3 | Delete blocked for in-progress jobs | Try to delete dataset with ANNOTATION_IN_PROGRESS or QA_IN_PROGRESS jobs | Error: cannot delete dataset with jobs in progress | `data-testid="dataset-delete-error"` |
| 4.4.4 | Cancel delete | Click cancel in delete dialog | Dialog closes; dataset remains | `data-testid="dataset-delete-cancel"` |

---

## 5. Job Assignment (Admin Only)

### 5.1 Assignment Page Layout

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 5.1.1 | Page renders with tabs | Navigate to `/admin/job-assignment` | Two main tabs visible: Annotation Assignment, QA Assignment | `data-testid="job-assignment-page"`, `data-testid="annotation-assignment-tab"`, `data-testid="qa-assignment-tab"` |
| 5.1.2 | Annotation tab sub-tabs | Click Annotation Assignment tab | Sub-tabs visible: Unassigned, Assigned, In Progress | `data-testid="unassigned-subtab"`, `data-testid="assigned-subtab"`, `data-testid="in-progress-subtab"` |
| 5.1.3 | QA tab sub-tabs | Click QA Assignment tab | Sub-tabs visible: Unassigned, Assigned, In Progress | Same sub-tab IDs |
| 5.1.4 | Unassigned jobs table | Click Unassigned sub-tab | Table shows UPLOADED jobs (for annotation) or SUBMITTED_FOR_QA jobs (for QA) with checkboxes | `data-testid="unassigned-jobs-table"` |
| 5.1.5 | Assigned jobs table | Click Assigned sub-tab | Table shows ASSIGNED_ANNOTATOR or ASSIGNED_QA jobs | `data-testid="assigned-jobs-table"` |

### 5.2 Manual Assignment

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 5.2.1 | Select jobs for assignment | Check checkboxes on unassigned jobs | Selected count displayed; assignment controls panel activates | `data-testid="job-checkbox"`, `data-testid="selected-count"` |
| 5.2.2 | Select assignee | Choose an annotator from the assignee dropdown | Assignee selected | `data-testid="assignee-select"` |
| 5.2.3 | Assign single job | Select 1 job, select annotator, click assign | Job status changes to ASSIGNED_ANNOTATOR; success toast; job moves to Assigned tab | `data-testid="assign-button"` |
| 5.2.4 | Assign multiple jobs | Select 3 jobs, select annotator, click assign | All 3 jobs assigned to same annotator; success toast | `data-testid="assign-button"` |
| 5.2.5 | QA manual assignment | Switch to QA tab, select submitted jobs, select QA user, assign | Jobs move to ASSIGNED_QA | `data-testid="qa-assignment-tab"`, `data-testid="assign-button"` |
| 5.2.6 | QA cannot be same as annotator | Try to assign QA to the original annotator of a job | Error: QA reviewer cannot be the same as the annotator | `data-testid="assignment-error"` |
| 5.2.7 | Only active users in dropdown | Deactivate a user, open assignee dropdown | Deactivated user not listed | `data-testid="assignee-select"` |

### 5.3 Round-Robin Distribution

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 5.3.1 | Switch to round-robin strategy | Select round-robin option in assignment controls | Round-robin UI displayed | `data-testid="assignment-strategy-select"` |
| 5.3.2 | Preview round-robin distribution | Select jobs, click preview | Preview dialog shows balanced distribution across available annotators | `data-testid="round-robin-preview-button"`, `data-testid="assignment-preview-dialog"` |
| 5.3.3 | Balanced assignment | 6 jobs, 3 annotators, preview | Each annotator gets ~2 jobs; distribution accounts for existing workload | `data-testid="assignment-preview-dialog"` |
| 5.3.4 | Confirm round-robin | Click confirm in preview dialog | All jobs assigned per preview; success toast | `data-testid="assignment-preview-confirm"` |
| 5.3.5 | Cancel round-robin | Click cancel in preview dialog | No jobs assigned; dialog closes | `data-testid="assignment-preview-cancel"` |

### 5.4 Reassignment

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 5.4.1 | Open reassignment dialog | Select assigned/in-progress jobs, click reassign | Bulk reassign dialog opens | `data-testid="reassign-button"`, `data-testid="bulk-reassign-dialog"` |
| 5.4.2 | Reassign annotator jobs | Select new annotator, confirm | Jobs reassigned; status resets to ASSIGNED_ANNOTATOR | `data-testid="reassign-user-select"`, `data-testid="reassign-confirm"` |
| 5.4.3 | Reassign QA jobs | Switch to QA tab, select assigned QA jobs, reassign to different QA | Jobs reassigned; status resets to ASSIGNED_QA | `data-testid="reassign-confirm"` |

### 5.5 Optimistic Locking

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 5.5.1 | Concurrent assignment conflict (409) | Open assignment page in two tabs; assign same job in both | Second assignment attempt returns 409 Conflict; error toast displayed | `data-testid="assignment-error"` |
| 5.5.2 | Stale status transition | Job status changed externally after page load; attempt to assign | 409 Conflict error with message about status mismatch | `data-testid="assignment-error"` |

---

## 6. Annotation Workflow (Annotator)

### 6.1 Annotator Dashboard

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.1.1 | Dashboard renders | Login as annotator, navigate to `/annotator/dashboard` | Summary bar visible with status counts; jobs table visible | `data-testid="annotator-dashboard"`, `data-testid="jobs-summary-bar"`, `data-testid="my-jobs-table"` |
| 6.1.2 | Summary bar counts | View summary bar | Shows counts: All, Assigned, In Progress, Submitted, In QA, Rejected, Delivered | `data-testid="jobs-summary-bar"` |
| 6.1.3 | Status tab filtering | Click "In Progress" tab in summary bar | Table shows only ANNOTATION_IN_PROGRESS jobs | `data-testid="status-tab-in-progress"` |
| 6.1.4 | Search jobs | Type file name in search input | Jobs table filters to matching jobs | `data-testid="jobs-search"` |
| 6.1.5 | Open annotation workspace | Click annotate action on an assigned job | Navigated to `/annotator/jobs/$jobId/annotate` | `data-testid="job-annotate-button"` |
| 6.1.6 | Only own jobs visible | Login as annotator | Only jobs assigned to this annotator appear | `data-testid="my-jobs-table"` |
| 6.1.7 | Pagination | Have >20 assigned jobs | Pagination controls work | `data-testid="jobs-pagination"` |

### 6.2 Start Annotation

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.2.1 | Auto-start on workspace open (assigned) | Open workspace for ASSIGNED_ANNOTATOR job | Job status automatically transitions to ANNOTATION_IN_PROGRESS | `data-testid="annotation-workspace"` |
| 6.2.2 | Auto-start on workspace open (rejected) | Open workspace for QA_REJECTED job | Job status automatically transitions to ANNOTATION_IN_PROGRESS; rework banner visible | `data-testid="annotation-workspace"`, `data-testid="rework-banner"` |
| 6.2.3 | Workspace layout | Open annotation workspace | Two-panel resizable layout: left panel (raw content viewer), right panel (tabs) | `data-testid="annotation-workspace"`, `data-testid="raw-content-viewer"`, `data-testid="workspace-right-panel"` |
| 6.2.4 | Raw content viewer shows email | Open workspace | Raw EML content displayed with line numbers in monospace font | `data-testid="raw-content-viewer"` |
| 6.2.5 | Right panel tabs | View right panel | Tabs available: Email (parsed), Annotations List | `data-testid="email-preview-tab"`, `data-testid="annotations-list-tab"` |

### 6.3 Text Selection & Annotation

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.3.1 | Select text shows class popup | Select text in raw content viewer | Class selection popup appears near selection | `data-testid="raw-content-viewer"`, `data-testid="class-selection-popup"` |
| 6.3.2 | Search annotation classes | Type in class search input inside popup | Classes filter to matching entries | `data-testid="class-search-input"` |
| 6.3.3 | Assign class to selection | Click on an annotation class in popup | Annotation created; text highlighted with class color; tag badge displayed (via CSS `::after`) | `data-testid="class-option"` |
| 6.3.4 | Tag auto-indexing | Create two annotations with same class (e.g., "email") | First tagged `email_1`, second tagged `email_2` | `data-testid="annotation-tag"` |
| 6.3.5 | Keyboard navigation in class popup | Use arrow keys and Enter in popup | Can navigate class list with keyboard; Enter selects focused class | `data-testid="class-selection-popup"` |
| 6.3.6 | Dismiss class popup | Press Escape or click outside popup | Popup closes; no annotation created | `data-testid="class-selection-popup"` |
| 6.3.7 | Annotation highlight colors | Create annotations with different classes | Each annotation highlighted in its class's color | `data-testid="raw-content-viewer"` |
| 6.3.8 | Annotation appears in list | Create an annotation | Annotation appears in Annotations List tab with tag, class name, selected text, offsets | `data-testid="annotations-list-tab"`, `data-testid="annotation-list-item"` |
| 6.3.9 | Delete annotation | Click delete on an annotation in the list | Annotation removed; highlight removed from content; tag indices re-calculated | `data-testid="annotation-delete-button"` |
| 6.3.10 | Min annotation length enforced | Select text shorter than min_annotation_length setting | Error: annotation text too short (or selection rejected) | `data-testid="annotation-error"` |

### 6.4 Same-Value Linking

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.4.1 | Same-value linking dialog appears | Select text that matches an existing annotation's text | Same-value linking dialog appears offering to reuse existing tag | `data-testid="same-value-linking-dialog"` |
| 6.4.2 | Reuse existing tag | Click "Use existing tag" in dialog | New annotation created with same tag as the matching annotation (e.g., both `email_1`) | `data-testid="link-existing-tag"` |
| 6.4.3 | Create new tag | Click "Create new tag" in dialog | New annotation created with new indexed tag (e.g., `email_2`) | `data-testid="link-new-tag"` |
| 6.4.4 | Cancel linking dialog | Click cancel | Dialog closes; annotation still pending class selection | `data-testid="link-cancel"` |

### 6.5 Save Draft

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.5.1 | Save draft | Create some annotations, click Save Draft | Success toast: "Draft saved"; annotations persisted | `data-testid="save-draft-button"` |
| 6.5.2 | Resume from draft | Save draft, navigate away, return to workspace | Previously saved annotations loaded; highlights restored | `data-testid="annotation-workspace"` |
| 6.5.3 | Draft auto-loads | Open workspace for job with existing draft | Draft annotations pre-loaded | `data-testid="annotation-workspace"` |
| 6.5.4 | Save draft disabled when not in progress | View workspace for submitted job | Save draft button disabled | `data-testid="save-draft-button"` |

### 6.6 Submit Annotation

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.6.1 | Submit annotation | Create annotations, click Submit | Confirmation dialog appears | `data-testid="submit-button"`, `data-testid="submit-confirm-dialog"` |
| 6.6.2 | Confirm submission | Click confirm in submit dialog | Job status changes to SUBMITTED_FOR_QA; success toast; redirected to dashboard | `data-testid="submit-confirm"` |
| 6.6.3 | Submit with no annotations | Click Submit with empty annotations list | Error or warning: no annotations to submit (or submit blocked) | `data-testid="submit-button"` |
| 6.6.4 | Cancel submission | Click cancel in submit dialog | Dialog closes; remain in workspace | `data-testid="submit-cancel"` |
| 6.6.5 | Draft deleted after submit | Submit, then check draft endpoint | Draft no longer exists for this job | — |

### 6.7 Rework After QA Rejection

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 6.7.1 | Rework banner displayed | Open workspace for QA_REJECTED job | Rework banner visible showing QA rejection comments | `data-testid="rework-banner"`, `data-testid="rejection-comments"` |
| 6.7.2 | Previous annotations pre-loaded | Open rejected job workspace | Last submitted annotations loaded as starting point for rework | `data-testid="annotation-workspace"` |
| 6.7.3 | Modify and resubmit | Edit annotations (add/remove/change), click Submit | New AnnotationVersion created; job transitions to SUBMITTED_FOR_QA | `data-testid="submit-button"` |
| 6.7.4 | View QA feedback | Read rejection comments in rework banner | Comments from QA reviewer clearly displayed | `data-testid="rejection-comments"` |

---

## 7. QA Review Workflow (QA Reviewer)

### 7.1 QA Dashboard

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.1.1 | Dashboard renders | Login as QA, navigate to `/qa/dashboard` | Summary bar with QA status counts; QA jobs table visible | `data-testid="qa-dashboard"`, `data-testid="qa-summary-bar"`, `data-testid="qa-jobs-table"` |
| 7.1.2 | Status tab filtering | Click "In Review" tab | Table shows only QA_IN_PROGRESS jobs | `data-testid="status-tab-in-review"` |
| 7.1.3 | Search QA jobs | Type file name in search | Jobs table filters to matching | `data-testid="qa-jobs-search"` |
| 7.1.4 | Open review workspace | Click review action on assigned QA job | Navigated to `/qa/jobs/$jobId/review` | `data-testid="job-review-button"` |
| 7.1.5 | Only own QA jobs visible | Login as QA | Only jobs assigned to this QA reviewer appear | `data-testid="qa-jobs-table"` |

### 7.2 Start QA Review

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.2.1 | Auto-start on workspace open | Open workspace for ASSIGNED_QA job | Job status automatically transitions to QA_IN_PROGRESS | `data-testid="qa-review-workspace"` |
| 7.2.2 | Workspace layout | Open QA workspace | Two-panel resizable layout with raw content (annotated, highlighted) on left; review panel on right | `data-testid="qa-review-workspace"`, `data-testid="raw-content-viewer"`, `data-testid="qa-right-panel"` |
| 7.2.3 | Annotations displayed with highlights | Open QA workspace | Annotator's submitted annotations shown as colored highlights with tag badges | `data-testid="raw-content-viewer"` |
| 7.2.4 | Annotations review list | View right panel | List of annotations with QA status indicators (Pending, OK, Flagged) | `data-testid="annotations-review-list"` |

### 7.3 Review Annotations

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.3.1 | Mark annotation as OK | Click OK on an annotation in review list | Annotation status changes to OK; visual indicator updated | `data-testid="annotation-ok-button"` |
| 7.3.2 | Flag annotation | Click flag on an annotation | Annotation status changes to FLAGGED; visual indicator updated | `data-testid="annotation-flag-button"` |
| 7.3.3 | Reset annotation status | Click status button again to reset | Annotation status returns to PENDING | `data-testid="annotation-ok-button"` |
| 7.3.4 | Bulk review actions | Mark all annotations as OK | All statuses updated to OK | `data-testid="annotations-review-list"` |

### 7.4 QA Edit Mode

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.4.1 | Toggle edit mode | Click edit mode toggle | Edit mode activated; can now select text to add annotations | `data-testid="edit-mode-toggle"` |
| 7.4.2 | Add annotation in edit mode | Select text, assign class in edit mode | New annotation created with source=QA, status=QA_ADDED | `data-testid="class-selection-popup"` |
| 7.4.3 | Delete annotation in edit mode | Delete an existing annotation in edit mode | Annotation marked as DELETED in review | `data-testid="annotation-delete-button"` |
| 7.4.4 | Modify annotation in edit mode | Change class assignment of an annotation | Annotation marked as modified | `data-testid="annotation-list-item"` |
| 7.4.5 | Exit edit mode | Toggle edit mode off | Returns to review-only mode; text selection no longer creates annotations | `data-testid="edit-mode-toggle"` |
| 7.4.6 | Save QA draft | Make modifications, click save draft | QA draft saved; success toast | `data-testid="save-draft-button"` |
| 7.4.7 | Resume QA draft | Save draft, navigate away, return | QA modifications restored from draft | `data-testid="qa-review-workspace"` |

### 7.5 Accept Job

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.5.1 | Accept without modifications | Review all annotations, click Accept | Accept dialog shows summary (no modifications) | `data-testid="accept-button"`, `data-testid="accept-dialog"` |
| 7.5.2 | Confirm accept | Click confirm in accept dialog | Job status → DELIVERED; QAReviewVersion created with decision=ACCEPT; success toast; redirect to dashboard | `data-testid="accept-confirm"` |
| 7.5.3 | Accept with modifications | Add/modify/delete annotations in edit mode, click Accept | Accept dialog shows modification summary (X added, Y modified, Z deleted); QA AnnotationVersion created | `data-testid="accept-dialog"`, `data-testid="modification-summary"` |
| 7.5.4 | Cancel accept | Click cancel in accept dialog | Dialog closes; remain in workspace | `data-testid="accept-cancel"` |

### 7.6 Reject Job

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.6.1 | Open reject dialog | Click Reject button | Reject dialog opens with required comments textarea | `data-testid="reject-button"`, `data-testid="reject-dialog"` |
| 7.6.2 | Comments required | Try to submit rejection with empty comments | Submit disabled or error: comments required | `data-testid="reject-comments-input"`, `data-testid="reject-confirm"` |
| 7.6.3 | Comments minimum length | Enter less than 10 characters | Error: comments must be at least 10 characters | `data-testid="reject-comments-input"` |
| 7.6.4 | Confirm rejection | Enter valid comments (10+ chars), click confirm | Job status → QA_REJECTED; QAReviewVersion created with decision=REJECT + comments; success toast; redirect to dashboard | `data-testid="reject-confirm"` |
| 7.6.5 | Cancel rejection | Click cancel in reject dialog | Dialog closes; remain in workspace | `data-testid="reject-cancel"` |

### 7.7 Blind Review

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 7.7.1 | Blind review enabled | Admin enables blind review in settings; QA opens workspace | Annotator name/info is hidden from the QA workspace | `data-testid="qa-review-workspace"` |
| 7.7.2 | Blind review disabled | Admin disables blind review; QA opens workspace | Annotator name visible in the QA workspace | `data-testid="annotator-info"` |
| 7.7.3 | Blind review setting propagates | Toggle setting, open new QA review | Setting takes effect immediately for new reviews | `data-testid="qa-review-workspace"` |

---

## 8. Export & De-identification (Admin Only)

### 8.1 Export Page Layout

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 8.1.1 | Export page renders | Navigate to `/admin/export` | Dataset selector, delivered jobs table (empty until dataset selected), export history section visible | `data-testid="export-page"`, `data-testid="export-dataset-select"` |
| 8.1.2 | Dataset selector shows only deliverable | Open dataset dropdown | Only datasets with at least 1 DELIVERED job are listed | `data-testid="export-dataset-select"` |
| 8.1.3 | Select dataset shows jobs | Select a dataset from dropdown | Delivered jobs table populates with DELIVERED jobs from that dataset | `data-testid="delivered-jobs-table"` |

### 8.2 Delivered Jobs Table

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 8.2.1 | Jobs displayed with details | Select dataset | Table shows: File Name, Annotator, QA, Annotation Count, Actions (checkbox) | `data-testid="delivered-jobs-table"` |
| 8.2.2 | Select individual jobs | Click checkboxes on specific jobs | Selected jobs count updates; export controls activate | `data-testid="job-export-checkbox"`, `data-testid="export-selected-count"` |
| 8.2.3 | Select all jobs | Click select-all checkbox | All delivered jobs selected | `data-testid="select-all-checkbox"` |
| 8.2.4 | Deselect all | Uncheck select-all | All jobs deselected | `data-testid="select-all-checkbox"` |

### 8.3 Export Preview

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 8.3.1 | Preview de-identified content | Select a job, click preview | Side-by-side view: original content on left, de-identified content on right | `data-testid="preview-button"`, `data-testid="export-preview"`, `data-testid="original-content"`, `data-testid="deidentified-content"` |
| 8.3.2 | PII replaced with tags | View de-identified preview | PII text replaced with `[tag_name]` placeholders (e.g., `[email_1]`, `[account_number_1]`) | `data-testid="deidentified-content"` |
| 8.3.3 | Same-value tags consistent | Preview job with linked annotations | Same tag used for same PII value across all occurrences | `data-testid="deidentified-content"` |
| 8.3.4 | Close preview | Click close on preview panel | Preview panel closes | `data-testid="preview-close"` |

### 8.4 Export & Download

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 8.4.1 | Export selected jobs | Select specific jobs, click "Export Selected" | Export created; success toast with download info | `data-testid="export-selected-button"` |
| 8.4.2 | Export all jobs | Click "Export All" | All delivered jobs in dataset exported | `data-testid="export-all-button"` |
| 8.4.3 | Download zip | Click download on export record | ZIP file downloaded containing `REDACTED_{shortId}_{originalFilename}` files | `data-testid="export-download-button"` |
| 8.4.4 | No jobs selected warning | Click export with no jobs selected | Error or warning: no jobs selected | `data-testid="export-selected-button"` |

### 8.5 Export History

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 8.5.1 | History table displays | Scroll to export history section | Table shows: Dataset, Job Count, File Size, Exported By, Date, Download | `data-testid="export-history-table"` |
| 8.5.2 | Download from history | Click download on a history entry | ZIP file downloaded | `data-testid="export-download-button"` |
| 8.5.3 | Pagination | Have >20 exports | Pagination works correctly | `data-testid="export-history-pagination"` |
| 8.5.4 | Empty state | No exports exist | Empty state message displayed | `data-testid="export-history-empty"` |

---

## 9. Version History (All Roles — Scoped)

### 9.1 Access & Navigation

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 9.1.1 | Admin access any job history | Login as admin, navigate to `/admin/jobs/$jobId/history` | Version history page loads for any job | `data-testid="version-history-page"` |
| 9.1.2 | Annotator access own job history | Login as annotator, navigate to `/annotator/jobs/$jobId/history` | History loads only for own assigned jobs | `data-testid="version-history-page"` |
| 9.1.3 | QA access reviewed job history | Login as QA, navigate to `/qa/jobs/$jobId/history` | History loads only for jobs assigned to this QA | `data-testid="version-history-page"` |
| 9.1.4 | Annotator blocked from other's history | Navigate to history URL for job not assigned to current annotator | Access denied or redirected | — |
| 9.1.5 | QA blocked from unreviewed history | Navigate to history URL for job not assigned to current QA | Access denied or redirected | — |

### 9.2 Version Timeline

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 9.2.1 | Timeline displays versions | Open history for a job with multiple versions | Chronological timeline showing annotation versions + QA review versions | `data-testid="version-timeline"` |
| 9.2.2 | Annotation version entry | View timeline | Annotation version shows: version number, author, source (ANNOTATOR/QA), timestamp | `data-testid="version-timeline-entry"` |
| 9.2.3 | QA review version entry | View timeline for reviewed job | QA review entry shows: decision (ACCEPT/REJECT), reviewer name, comments (if rejected), timestamp | `data-testid="version-timeline-entry"` |
| 9.2.4 | Click version to view details | Click on a version in timeline | Version detail view opens showing all annotations in that version | `data-testid="version-timeline-entry"`, `data-testid="version-detail-view"` |

### 9.3 Version Detail View

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 9.3.1 | Annotations table | Click a version | Table shows: Tag, Class, Selected Text, Start Offset, End Offset | `data-testid="version-detail-view"`, `data-testid="version-annotations-table"` |
| 9.3.2 | Highlighted content | Click a version | Raw content viewer shows annotations highlighted with class colors | `data-testid="version-detail-view"` |
| 9.3.3 | QA review details | Click a QA review version | Shows decision, comments, modification summary | `data-testid="version-detail-view"` |

### 9.4 Version Comparison

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 9.4.1 | Select two versions to compare | Select two versions from timeline | Comparison panel opens | `data-testid="version-compare-select"`, `data-testid="version-comparison-panel"` |
| 9.4.2 | Diff: added annotations | Compare v1 (2 annotations) with v2 (4 annotations) | 2 annotations shown as "added" (green) | `data-testid="diff-added"` |
| 9.4.3 | Diff: removed annotations | Compare v1 (4 annotations) with v2 (2 annotations) | 2 annotations shown as "removed" (red) | `data-testid="diff-removed"` |
| 9.4.4 | Diff: modified annotations | Compare versions where an annotation's class changed | Annotation shown as "modified" (yellow) | `data-testid="diff-modified"` |
| 9.4.5 | Diff: unchanged annotations | Compare versions with identical annotations | Annotations shown as "unchanged" (neutral) | `data-testid="diff-unchanged"` |
| 9.4.6 | Side-by-side view | Open comparison | Left panel shows version A, right panel shows version B | `data-testid="version-comparison-panel"` |

---

## 10. Admin Dashboard

### 10.1 Stats Cards

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 10.1.1 | Dashboard renders | Login as admin, navigate to `/admin/dashboard` | Stats cards, chart, tables, quick actions all visible | `data-testid="admin-dashboard"` |
| 10.1.2 | Total datasets card | View stats cards | Card shows correct count of total datasets | `data-testid="stat-total-datasets"` |
| 10.1.3 | Total jobs card | View stats cards | Card shows correct total job count | `data-testid="stat-total-jobs"` |
| 10.1.4 | Pending assignment card | View stats cards | Card shows count of UPLOADED + SUBMITTED_FOR_QA jobs | `data-testid="stat-pending-assignment"` |
| 10.1.5 | In progress card | View stats cards | Card shows count of ANNOTATION_IN_PROGRESS + QA_IN_PROGRESS jobs | `data-testid="stat-in-progress"` |
| 10.1.6 | Delivered card | View stats cards | Card shows count of DELIVERED jobs | `data-testid="stat-delivered"` |
| 10.1.7 | Stats update after actions | Upload a dataset, return to dashboard | Stats cards reflect new dataset/job counts | `data-testid="admin-dashboard"` |

### 10.2 Job Status Chart

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 10.2.1 | Chart renders | View dashboard | Bar/pie chart showing job distribution by status | `data-testid="job-status-chart"` |
| 10.2.2 | Chart reflects data | Create jobs in different statuses | Chart bars/segments match status counts | `data-testid="job-status-chart"` |

### 10.3 Recent Datasets Table

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 10.3.1 | Shows recent datasets | View dashboard | Table shows up to 5 most recently uploaded datasets | `data-testid="recent-datasets-table"` |
| 10.3.2 | Dataset details | View recent datasets row | Shows: Name, Status, File Count, Upload Date | `data-testid="recent-datasets-table"` |
| 10.3.3 | Click navigates to detail | Click a dataset in recent table | Navigated to `/admin/datasets/$id` | `data-testid="recent-datasets-table"` |

### 10.4 Performance Tables

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 10.4.1 | Annotator performance table | View dashboard | Table shows annotator metrics: Name, Jobs Completed, In Progress, etc. | `data-testid="annotator-performance-table"` |
| 10.4.2 | QA performance table | View dashboard | Table shows QA metrics: Name, Reviews Completed, Accept Rate, Reject Rate, etc. | `data-testid="qa-performance-table"` |
| 10.4.3 | Performance updates | Annotator submits a job, admin checks dashboard | Annotator's metrics update accordingly | `data-testid="annotator-performance-table"` |

### 10.5 Quick Actions

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 10.5.1 | Quick action buttons | View dashboard | Shortcut buttons visible for: Upload Dataset, Manage Users, Assign Jobs, Export | `data-testid="quick-actions"` |
| 10.5.2 | Upload dataset action | Click Upload Dataset quick action | Navigated to `/admin/datasets` (or upload dialog opens) | `data-testid="quick-action-upload"` |
| 10.5.3 | Manage users action | Click Manage Users quick action | Navigated to `/admin/users` | `data-testid="quick-action-users"` |
| 10.5.4 | Assign jobs action | Click Assign Jobs quick action | Navigated to `/admin/job-assignment` | `data-testid="quick-action-assign"` |
| 10.5.5 | Export action | Click Export quick action | Navigated to `/admin/export` | `data-testid="quick-action-export"` |

---

## 11. Settings (Admin Only)

### 11.1 Blind Review Toggle

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 11.1.1 | Settings page renders | Navigate to `/admin/settings` | Blind review switch and min annotation length input visible | `data-testid="settings-page"` |
| 11.1.2 | Toggle blind review on | Turn on blind review switch | Success toast; setting persisted (refresh confirms) | `data-testid="blind-review-switch"` |
| 11.1.3 | Toggle blind review off | Turn off blind review switch | Success toast; setting persisted | `data-testid="blind-review-switch"` |
| 11.1.4 | Effect on QA workspace | Enable blind review, login as QA, open review | Annotator identity hidden | — |

### 11.2 Min Annotation Length

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 11.2.1 | View current setting | Open settings page | Current min annotation length value displayed | `data-testid="min-annotation-length-input"` |
| 11.2.2 | Update min length | Change value to 3, click Save | Success toast; setting persisted | `data-testid="min-annotation-length-input"`, `data-testid="min-length-save"` |
| 11.2.3 | Enforced during annotation | Set min length to 5, annotator selects 3-char text | Annotation rejected: text too short | — |

---

## 12. Cross-Cutting Concerns

### 12.1 Toast Notifications

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 12.1.1 | Success toast on create | Create a user/dataset/class | Green success toast appears and auto-dismisses | `data-testid="toast-success"` |
| 12.1.2 | Error toast on API failure | Trigger a 500 error (e.g., server down) | Red error toast with message | `data-testid="toast-error"` |
| 12.1.3 | 403 forbidden toast | Non-admin calls admin API | Toast: "You don't have permission to perform this action" | `data-testid="toast-error"` |
| 12.1.4 | 409 conflict toast | Trigger optimistic locking conflict | Toast: status conflict message | `data-testid="toast-error"` |
| 12.1.5 | Network error toast | Disconnect network, perform action | Toast: network error message | `data-testid="toast-error"` |
| 12.1.6 | 401 redirects to login | Session expires, perform action | Redirected to `/login` | — |

### 12.2 Loading States

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 12.2.1 | Table skeleton on page load | Navigate to any table page (users, datasets, etc.) | TableSkeleton component visible while data loads | `data-testid="table-skeleton"` |
| 12.2.2 | Workspace skeleton | Open annotation/QA workspace | Skeleton loader visible while job data loads | `data-testid="workspace-skeleton"` |
| 12.2.3 | Dashboard skeleton | Navigate to admin dashboard | Skeleton loaders for stats cards, chart, tables while loading | `data-testid="dashboard-skeleton"` |

### 12.3 Empty States

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 12.3.1 | Empty users table | Apply filter matching no users | EmptyState component with appropriate message | `data-testid="empty-state"` |
| 12.3.2 | Empty datasets table | No datasets uploaded yet | EmptyState with "No datasets" message and upload CTA | `data-testid="empty-state"` |
| 12.3.3 | Empty jobs table | Dataset has no jobs (shouldn't happen normally) | EmptyState displayed | `data-testid="empty-state"` |
| 12.3.4 | Empty export history | No exports created yet | EmptyState with "No exports" message | `data-testid="empty-state"` |

### 12.4 Pagination

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 12.4.1 | First page default | Navigate to any paginated table | Page 1 shown; page size = 20 | `data-testid="pagination"` |
| 12.4.2 | Navigate to next page | Click next page | Page 2 data loads; URL/state updates | `data-testid="pagination-next"` |
| 12.4.3 | Navigate to previous page | Go to page 2, click previous | Page 1 data loads | `data-testid="pagination-prev"` |
| 12.4.4 | Page size selector | Change page size (if available) | Table shows updated number of rows | `data-testid="pagination-size"` |
| 12.4.5 | Last page | Navigate to last page | Correct remaining items shown; next disabled | `data-testid="pagination-next"` |

### 12.5 Theme

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 12.5.1 | Toggle dark mode | Click theme toggle | UI switches to dark mode; persists on reload | `data-testid="theme-toggle"` |
| 12.5.2 | Toggle light mode | Click theme toggle from dark mode | UI switches to light mode | `data-testid="theme-toggle"` |
| 12.5.3 | Theme persists across sessions | Set dark mode, logout, login again | Dark mode still active | `data-testid="theme-toggle"` |

### 12.6 Responsive Layout

| # | Test Case | Steps | Expected Result | Test IDs |
|---|-----------|-------|-----------------|----------|
| 12.6.1 | Admin sidebar collapses | Resize window to tablet width | Sidebar collapses or becomes hamburger menu | `data-testid="admin-sidebar"` |
| 12.6.2 | Tables scroll horizontally | Resize to narrow width | Tables are horizontally scrollable, not broken | — |
| 12.6.3 | Workspace panels stack | Resize to narrow width | Resizable panels remain functional | `data-testid="annotation-workspace"` |

---

## 13. Full End-to-End Lifecycle Scenarios

These integration scenarios test complete workflows spanning multiple modules and roles.

### 13.1 Complete Annotation Lifecycle

| Step | Actor | Action | Verification | Test IDs |
|------|-------|--------|-------------|----------|
| 1 | Admin | Upload dataset (.zip with 3 .eml files) | Dataset in READY status; 3 jobs created in UPLOADED status | `data-testid="upload-dataset-button"` |
| 2 | Admin | Assign all 3 jobs to annotator via round-robin | Jobs move to ASSIGNED_ANNOTATOR | `data-testid="assign-button"` |
| 3 | Annotator | Open first job, create 5 PII annotations | Annotations highlighted; listed in panel | `data-testid="annotation-workspace"` |
| 4 | Annotator | Save draft | Draft persisted; toast confirmation | `data-testid="save-draft-button"` |
| 5 | Annotator | Resume draft, add 2 more annotations | Total 7 annotations visible | `data-testid="annotation-workspace"` |
| 6 | Annotator | Submit annotation | Job → SUBMITTED_FOR_QA; AnnotationVersion v1 created | `data-testid="submit-button"` |
| 7 | Admin | Assign job to QA reviewer | Job → ASSIGNED_QA | `data-testid="assign-button"` |
| 8 | QA | Open job for review; verify annotations | 7 annotations displayed with highlights | `data-testid="qa-review-workspace"` |
| 9 | QA | Reject job with comments "Missing SSN annotation" | Job → QA_REJECTED; QAReviewVersion created | `data-testid="reject-button"` |
| 10 | Annotator | Open rejected job; see rework banner with QA comments | Banner shows "Missing SSN annotation" | `data-testid="rework-banner"` |
| 11 | Annotator | Add missing annotation, resubmit | Job → SUBMITTED_FOR_QA; AnnotationVersion v2 created | `data-testid="submit-button"` |
| 12 | Admin | Reassign to QA | Job → ASSIGNED_QA | `data-testid="assign-button"` |
| 13 | QA | Review updated annotations; add 1 QA annotation in edit mode | Modification recorded | `data-testid="edit-mode-toggle"` |
| 14 | QA | Accept with modifications | Job → DELIVERED; QAReviewVersion + QA AnnotationVersion created | `data-testid="accept-button"` |
| 15 | Admin | View version history | Timeline shows: Annotation v1, QA Review (reject), Annotation v2, QA Review (accept + modifications) | `data-testid="version-timeline"` |
| 16 | Admin | Compare Annotation v1 vs v2 | Diff shows added SSN annotation | `data-testid="version-comparison-panel"` |
| 17 | Admin | Export delivered job | ZIP downloaded with de-identified content; PII replaced with `[tag]` placeholders | `data-testid="export-selected-button"` |

### 13.2 User Lifecycle

| Step | Actor | Action | Verification | Test IDs |
|------|-------|--------|-------------|----------|
| 1 | Admin | Create new annotator user | Temp password displayed | `data-testid="add-user-button"` |
| 2 | New User | Login with temp password | Reaches `/annotator/dashboard` | `data-testid="login-submit"` |
| 3 | Admin | Assign jobs to new annotator | Jobs assigned successfully | `data-testid="assign-button"` |
| 4 | New User | Complete annotation on assigned job | Job submitted | `data-testid="submit-button"` |
| 5 | Admin | Deactivate user (has 2 remaining assigned jobs) | Impact dialog shows 2 jobs; ASSIGNED jobs return to UPLOADED | `data-testid="user-deactivate-button"` |
| 6 | Deactivated User | Attempt login | Error: "This account has been deactivated." | `data-testid="login-error"` |
| 7 | Admin | Reactivate user | User status → ACTIVE | `data-testid="user-activate-button"` |
| 8 | Reactivated User | Login successfully | Reaches annotator dashboard | — |

### 13.3 Concurrent Access Scenario

| Step | Actor | Action | Verification | Test IDs |
|------|-------|--------|-------------|----------|
| 1 | Admin A | Open job assignment page, see job J1 as UPLOADED | — | `data-testid="unassigned-jobs-table"` |
| 2 | Admin B | Open job assignment page in separate session, see same job J1 | — | `data-testid="unassigned-jobs-table"` |
| 3 | Admin A | Assign J1 to Annotator 1 | Succeeds; J1 → ASSIGNED_ANNOTATOR | `data-testid="assign-button"` |
| 4 | Admin B | Attempt to assign J1 to Annotator 2 (stale view) | 409 Conflict; error toast: status mismatch | `data-testid="assignment-error"` |
| 5 | Admin B | Refresh page | J1 now shows as ASSIGNED_ANNOTATOR (stale state resolved) | `data-testid="assigned-jobs-table"` |

---

## Appendix A: `data-testid` Reference

Complete list of `data-testid` attributes referenced in this document, organized by module. These must be added to the corresponding frontend components.

### Authentication
| Test ID | Component | Element |
|---------|-----------|---------|
| `login-email` | LoginForm | Email input |
| `login-password` | LoginForm | Password input |
| `login-submit` | LoginForm | Submit button |
| `login-error` | LoginForm | Error alert |
| `unauthorized-page` | UnauthorizedPage | Page container |
| `sign-out-button` | Layout (all) | Sign out button |

### User Management
| Test ID | Component | Element |
|---------|-----------|---------|
| `users-page` | UsersPage | Page container |
| `users-table` | UsersTable | Table |
| `users-search` | UsersFilters | Search input |
| `users-role-filter` | UsersFilters | Role dropdown |
| `users-status-filter` | UsersFilters | Status dropdown |
| `users-pagination` | UsersPage | Pagination controls |
| `users-empty-state` | UsersPage | Empty state |
| `add-user-button` | UsersPage | Add user button |
| `user-form-dialog` | UserFormDialog | Dialog container |
| `user-name-input` | UserFormDialog | Name input |
| `user-email-input` | UserFormDialog | Email input |
| `user-role-select` | UserFormDialog | Role select |
| `user-form-submit` | UserFormDialog | Submit button |
| `user-form-cancel` | UserFormDialog | Cancel button |
| `user-form-error` | UserFormDialog | Error message |
| `temp-password-display` | UserFormDialog | Temporary password display |
| `user-edit-button` | UsersTable | Edit action button (per row) |
| `user-deactivate-button` | UsersTable | Deactivate button (per row) |
| `user-activate-button` | UsersTable | Activate button (per row) |
| `deactivation-dialog` | DeactivationConfirmDialog | Dialog container |
| `deactivation-job-impact` | DeactivationConfirmDialog | Job impact count |
| `deactivation-confirm` | DeactivationConfirmDialog | Confirm button |
| `deactivation-cancel` | DeactivationConfirmDialog | Cancel button |

### Annotation Classes
| Test ID | Component | Element |
|---------|-----------|---------|
| `annotation-classes-page` | AnnotationClassesPage | Page container |
| `annotation-classes-table` | AnnotationClassesTable | Table |
| `class-color-swatch` | AnnotationClassesTable | Color swatch (per row) |
| `add-class-button` | AnnotationClassesPage | Add class button |
| `class-form-dialog` | AnnotationClassFormDialog | Dialog container |
| `class-label-input` | AnnotationClassFormDialog | Display label input |
| `class-name-input` | AnnotationClassFormDialog | Name input (auto-generated) |
| `class-color-input` | AnnotationClassFormDialog | Color picker |
| `class-description-input` | AnnotationClassFormDialog | Description textarea |
| `class-form-submit` | AnnotationClassFormDialog | Submit button |
| `class-form-cancel` | AnnotationClassFormDialog | Cancel button |
| `class-form-error` | AnnotationClassFormDialog | Error message |
| `class-edit-button` | AnnotationClassesTable | Edit action (per row) |
| `class-delete-button` | AnnotationClassesTable | Delete action (per row) |
| `class-delete-dialog` | DeleteConfirmDialog | Dialog container |
| `class-usage-count` | DeleteConfirmDialog | Usage count display |
| `class-delete-confirm` | DeleteConfirmDialog | Confirm button |
| `class-delete-cancel` | DeleteConfirmDialog | Cancel button |

### Datasets
| Test ID | Component | Element |
|---------|-----------|---------|
| `datasets-page` | DatasetsPage | Page container |
| `datasets-table` | DatasetsPage | Datasets table |
| `datasets-search` | DatasetsPage | Search input |
| `datasets-pagination` | DatasetsPage | Pagination controls |
| `datasets-empty-state` | DatasetsPage | Empty state |
| `dataset-status` | StatusBadge | Dataset status badge |
| `dataset-duplicate-count` | DatasetsPage/Detail | Duplicate count display |
| `upload-dataset-button` | DatasetsPage | Upload button |
| `upload-dialog` | DatasetUploadDialog | Dialog container |
| `dataset-name-input` | DatasetUploadDialog | Name input |
| `file-drop-zone` | DatasetUploadDialog | File drop zone |
| `upload-submit` | DatasetUploadDialog | Submit button |
| `upload-cancel` | DatasetUploadDialog | Cancel button |
| `upload-error` | DatasetUploadDialog | Error message |
| `dataset-detail-page` | DatasetDetailPage | Page container |
| `dataset-status-cards` | DatasetStatusCards | Status cards container |
| `dataset-jobs-table` | DatasetJobsTable | Jobs table |
| `dataset-jobs-search` | DatasetDetailPage | Jobs search input |
| `dataset-jobs-pagination` | DatasetDetailPage | Jobs pagination |
| `job-view-button` | DatasetJobsTable | View action (per row) |
| `email-viewer-dialog` | DatasetDetailPage | Email viewer dialog |
| `email-tab` | EmailViewer | Email tab |
| `raw-tab` | EmailViewer | Raw tab |
| `history-tab` | EmailViewer | History tab |
| `dataset-delete-button` | DatasetsPage | Delete button (per row) |
| `dataset-delete-dialog` | DatasetDeleteConfirmDialog | Dialog container |
| `dataset-delete-confirm` | DatasetDeleteConfirmDialog | Confirm button |
| `dataset-delete-cancel` | DatasetDeleteConfirmDialog | Cancel button |
| `dataset-delete-error` | DatasetDeleteConfirmDialog | Error message |

### Job Assignment
| Test ID | Component | Element |
|---------|-----------|---------|
| `job-assignment-page` | JobAssignmentPage | Page container |
| `annotation-assignment-tab` | JobAssignmentPage | Annotation tab |
| `qa-assignment-tab` | JobAssignmentPage | QA tab |
| `unassigned-subtab` | JobAssignmentPage | Unassigned sub-tab |
| `assigned-subtab` | JobAssignmentPage | Assigned sub-tab |
| `in-progress-subtab` | JobAssignmentPage | In Progress sub-tab |
| `unassigned-jobs-table` | UnassignedJobsTable | Table |
| `assigned-jobs-table` | AssignedJobsTable | Table |
| `job-checkbox` | JobsTable | Row checkbox |
| `selected-count` | AssignmentControlsPanel | Selected jobs count |
| `assignee-select` | AssignmentControlsPanel | Assignee dropdown |
| `assign-button` | AssignmentControlsPanel | Assign button |
| `assignment-strategy-select` | AssignmentControlsPanel | Strategy selector (manual/round-robin) |
| `round-robin-preview-button` | AssignmentControlsPanel | Preview button |
| `assignment-preview-dialog` | AssignmentPreviewDialog | Dialog container |
| `assignment-preview-confirm` | AssignmentPreviewDialog | Confirm button |
| `assignment-preview-cancel` | AssignmentPreviewDialog | Cancel button |
| `reassign-button` | AssignedJobsTable | Reassign button |
| `bulk-reassign-dialog` | BulkReassignDialog | Dialog container |
| `reassign-user-select` | BulkReassignDialog | User select |
| `reassign-confirm` | BulkReassignDialog | Confirm button |
| `assignment-error` | JobAssignmentPage | Error message/toast |

### Annotation Workflow
| Test ID | Component | Element |
|---------|-----------|---------|
| `annotator-dashboard` | AnnotatorDashboardPage | Page container |
| `jobs-summary-bar` | JobsSummaryBar | Summary bar container |
| `my-jobs-table` | MyJobsTable | Jobs table |
| `jobs-search` | AnnotatorDashboardPage | Search input |
| `jobs-pagination` | AnnotatorDashboardPage | Pagination |
| `job-annotate-button` | MyJobsTable | Annotate action (per row) |
| `status-tab-in-progress` | JobsSummaryBar | In Progress tab |
| `annotation-workspace` | AnnotationWorkspace | Workspace container |
| `raw-content-viewer` | RawContentViewer | Content viewer |
| `workspace-right-panel` | AnnotationWorkspace | Right panel |
| `email-preview-tab` | AnnotationWorkspace | Email preview tab |
| `annotations-list-tab` | AnnotationsListTab | Annotations list tab |
| `class-selection-popup` | ClassSelectionPopup | Popup container |
| `class-search-input` | ClassSelectionPopup | Search input in popup |
| `class-option` | ClassSelectionPopup | Class option (per item) |
| `annotation-tag` | AnnotationsListTab | Tag display |
| `annotation-list-item` | AnnotationsListTab | List item (per annotation) |
| `annotation-delete-button` | AnnotationsListTab | Delete button (per annotation) |
| `annotation-error` | AnnotationWorkspace | Error message |
| `same-value-linking-dialog` | SameValueLinkingDialog | Dialog container |
| `link-existing-tag` | SameValueLinkingDialog | Use existing tag button |
| `link-new-tag` | SameValueLinkingDialog | Create new tag button |
| `link-cancel` | SameValueLinkingDialog | Cancel button |
| `save-draft-button` | AnnotationActionToolbar | Save draft button |
| `submit-button` | AnnotationActionToolbar | Submit button |
| `submit-confirm-dialog` | AnnotationWorkspace | Submit confirmation dialog |
| `submit-confirm` | AnnotationWorkspace | Confirm submit button |
| `submit-cancel` | AnnotationWorkspace | Cancel submit button |
| `rework-banner` | ReworkBanner | Banner container |
| `rejection-comments` | ReworkBanner | QA rejection comments |

### QA Review Workflow
| Test ID | Component | Element |
|---------|-----------|---------|
| `qa-dashboard` | QADashboardPage | Page container |
| `qa-summary-bar` | QAJobsSummaryBar | Summary bar container |
| `qa-jobs-table` | MyQAJobsTable | QA jobs table |
| `qa-jobs-search` | QADashboardPage | Search input |
| `job-review-button` | MyQAJobsTable | Review action (per row) |
| `status-tab-in-review` | QAJobsSummaryBar | In Review tab |
| `qa-review-workspace` | QAReviewWorkspace | Workspace container |
| `qa-right-panel` | QAReviewWorkspace | Right panel |
| `annotations-review-list` | AnnotationsReviewListTab | Review list container |
| `annotation-ok-button` | AnnotationsReviewListTab | OK button (per annotation) |
| `annotation-flag-button` | AnnotationsReviewListTab | Flag button (per annotation) |
| `edit-mode-toggle` | EditModeControls | Toggle switch |
| `accept-button` | AnnotationActionToolbar | Accept button |
| `accept-dialog` | AcceptDialog | Dialog container |
| `modification-summary` | AcceptDialog | Modification summary |
| `accept-confirm` | AcceptDialog | Confirm button |
| `accept-cancel` | AcceptDialog | Cancel button |
| `reject-button` | AnnotationActionToolbar | Reject button |
| `reject-dialog` | RejectDialog | Dialog container |
| `reject-comments-input` | RejectDialog | Comments textarea |
| `reject-confirm` | RejectDialog | Confirm button |
| `reject-cancel` | RejectDialog | Cancel button |
| `annotator-info` | QAReviewWorkspace | Annotator identity display |

### Export
| Test ID | Component | Element |
|---------|-----------|---------|
| `export-page` | ExportPage | Page container |
| `export-dataset-select` | ExportPage | Dataset selector dropdown |
| `delivered-jobs-table` | DeliveredJobsTable | Table |
| `job-export-checkbox` | DeliveredJobsTable | Row checkbox |
| `select-all-checkbox` | DeliveredJobsTable | Select all checkbox |
| `export-selected-count` | ExportControls | Selected count display |
| `preview-button` | ExportControls | Preview button |
| `export-preview` | ExportPreview | Preview container |
| `original-content` | ExportPreview | Original content panel |
| `deidentified-content` | ExportPreview | De-identified content panel |
| `preview-close` | ExportPreview | Close button |
| `export-selected-button` | ExportControls | Export selected button |
| `export-all-button` | ExportControls | Export all button |
| `export-download-button` | ExportHistoryTable | Download button (per row) |
| `export-history-table` | ExportHistoryTable | History table |
| `export-history-pagination` | ExportHistoryTable | Pagination |
| `export-history-empty` | ExportHistoryTable | Empty state |

### Version History
| Test ID | Component | Element |
|---------|-----------|---------|
| `version-history-page` | VersionHistoryPage | Page container |
| `version-timeline` | VersionTimeline | Timeline container |
| `version-timeline-entry` | VersionTimeline | Entry (per version) |
| `version-detail-view` | VersionDetailView | Detail container |
| `version-annotations-table` | VersionDetailView | Annotations table |
| `version-compare-select` | VersionTimeline | Compare version selector |
| `version-comparison-panel` | VersionComparisonPanel | Comparison container |
| `diff-added` | VersionComparisonPanel | Added annotation indicator |
| `diff-removed` | VersionComparisonPanel | Removed annotation indicator |
| `diff-modified` | VersionComparisonPanel | Modified annotation indicator |
| `diff-unchanged` | VersionComparisonPanel | Unchanged annotation indicator |

### Admin Dashboard
| Test ID | Component | Element |
|---------|-----------|---------|
| `admin-dashboard` | AdminDashboardPage | Page container |
| `stat-total-datasets` | StatsCards | Total datasets card |
| `stat-total-jobs` | StatsCards | Total jobs card |
| `stat-pending-assignment` | StatsCards | Pending assignment card |
| `stat-in-progress` | StatsCards | In progress card |
| `stat-delivered` | StatsCards | Delivered card |
| `job-status-chart` | JobStatusChart | Chart container |
| `recent-datasets-table` | RecentDatasetsTable | Table |
| `annotator-performance-table` | AnnotatorPerformanceTable | Table |
| `qa-performance-table` | QAPerformanceTable | Table |
| `quick-actions` | QuickActions | Container |
| `quick-action-upload` | QuickActions | Upload dataset button |
| `quick-action-users` | QuickActions | Manage users button |
| `quick-action-assign` | QuickActions | Assign jobs button |
| `quick-action-export` | QuickActions | Export button |

### Settings
| Test ID | Component | Element |
|---------|-----------|---------|
| `settings-page` | SettingsPage | Page container |
| `blind-review-switch` | SettingsPage | Blind review toggle |
| `min-annotation-length-input` | SettingsPage | Min length input |
| `min-length-save` | SettingsPage | Save button |

### Cross-Cutting
| Test ID | Component | Element |
|---------|-----------|---------|
| `toast-success` | Toaster (sonner) | Success toast |
| `toast-error` | Toaster (sonner) | Error toast |
| `table-skeleton` | TableSkeleton | Loading skeleton |
| `workspace-skeleton` | Workspace components | Loading skeleton |
| `dashboard-skeleton` | Dashboard | Loading skeleton |
| `empty-state` | EmptyState | Empty state component |
| `pagination` | DataTablePagination | Pagination container |
| `pagination-next` | DataTablePagination | Next page button |
| `pagination-prev` | DataTablePagination | Previous page button |
| `pagination-size` | DataTablePagination | Page size selector |
| `theme-toggle` | Layout components | Theme toggle button |
| `admin-sidebar` | AdminLayout | Sidebar navigation |
