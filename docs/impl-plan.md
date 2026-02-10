# Email PII De-Identification Annotation Platform — Implementation Plan

## Overview

This document is the completed implementation record for the platform. It was organized into 6 phases (0–5) ordered by dependency: each phase built only on what previous phases delivered. Within a phase, modules marked **parallel** had no inter-dependencies and were built concurrently. All phases are now complete.

### Current State

| Area | Status |
|------|--------|
| React 19.2 + TypeScript 5.9 + Vite 7.2 | Fully configured and built |
| Django 5.2 + DRF + PostgreSQL | 8 apps: accounts, datasets, core, annotations, qa, exports, history, dashboard |
| Tailwind CSS 4.1 | Configured via `@tailwindcss/vite` plugin + `@theme` in `src/index.css` (no config files) |
| shadcn/ui | 32 components installed (new-york style, neutral base) |
| TanStack Router 1.158 + React Query 5.90 | File-based routing, auth guards, server state management |
| All application models | Defined with UUID PKs, migrations applied |
| All DRF viewsets & endpoints | Complete API across 10 URL namespaces |
| File storage (MEDIA_ROOT) | Configured for datasets and exports |

### Documentation Reference

| Folder | Count | Contents |
|--------|-------|----------|
| `docs/modules/` | 10 files | Module specifications (authentication, user-management, annotation-class-management, dataset-management, job-assignment, annotation-interface, qa-interface, admin-dashboard, export, version-history) |
| `docs/ui/` | 15 files | UI wireframes & interaction specs (login, admin-dashboard, dataset-list, dataset-detail, dataset-upload, annotation-class-list, user-management, job-assignment, annotator-dashboard, annotation-interface, qa-dashboard, qa-review-interface, email-viewer, export, version-history) |
| `docs/app-requirement.md` | 1 file | Master requirements document |
| `docs/pre-label-services.md` | 1 file | Pre-label services design (future feature) |
| `docs/api-reference.md` | 1 file | Consolidated API endpoint reference |

---

## Frontend Architecture Principles

This project follows the [bulletproof-react](https://github.com/alan2207/bulletproof-react) project structure with [TanStack Router](https://tanstack.com/router) for type-safe routing. The key conventions are:

### Feature-Based Code Organization

All domain logic is organized into self-contained feature modules under `src/features/`. Each feature owns its API layer, components, hooks, and utilities. Shared infrastructure lives outside features in `src/components/`, `src/lib/`, `src/hooks/`, and `src/utils/`.

### Unidirectional Import Rule

Imports follow a strict hierarchy: **shared → features → app**. Concretely:
- `src/lib/`, `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` — shared layer, imports nothing from features or app
- `src/features/*` — feature layer, imports from shared layer only (never from other features or app)
- `src/app/` — app layer (routes, providers, router), imports from features and shared

### API Layer Pattern

Each feature exposes its server interactions through colocated API modules in `src/features/{name}/api/`. Each file exports:
1. A **fetcher function** (plain async function using the shared `api-client`)
2. A **React Query hook** wrapping the fetcher (`useQuery` for reads, `useMutation` for writes)
3. A **mapper file** (`*-mapper.ts`) for transforming API response shapes to frontend types

Example: `src/features/users/api/get-users.ts` exports `getUsers()` and `useUsers()`.

### Routing with TanStack Router

Routes are defined in `src/app/routes/` using `@tanstack/react-router` with the file-based routing plugin. Key conventions:
- `createRouter()` + `createRoute()` replace `<BrowserRouter>` + `<Route>`
- Dynamic segments use `$param` naming (e.g., `datasets/$id.tsx`)
- Auth guards use `beforeLoad` on route definitions (no `ProtectedRoute` HOC)
- Lazy loading via `route.lazy(() => import(...))` replaces `React.lazy`
- Type-safe route params and search params — no manual type casts
- Nested directory structure for deep routes (e.g., `jobs/$jobId/history.tsx`)

### Directory Structure

```
src/
  app/                          # Application shell
    routes/                     # TanStack Router route files
    provider.tsx                # Root providers (QueryClient, AuthLoader, ErrorBoundary)
    router.tsx                  # Router instance + route tree
    index.tsx                   # App root export
    routeTree.gen.ts            # Auto-generated route tree (do not edit)

  components/                   # Shared cross-feature components
    errors/                     # MainErrorFallback
    layouts/                    # AdminLayout, AnnotatorLayout, QALayout
    ui/                         # shadcn/ui components (32 installed)
    annotations-list-tab.tsx    # Shared annotation list
    class-selection-popup.tsx   # Class picker for annotation
    data-table-pagination.tsx   # Reusable table pagination
    dynamic-breadcrumb.tsx      # Auto breadcrumb from route
    email-preview.tsx           # Rendered email preview
    email-viewer.tsx            # Parsed email display
    empty-state.tsx             # Empty state placeholder
    raw-content-viewer.tsx      # Monospace raw .eml viewer with highlights
    same-value-linking-dialog.tsx # Same-value tag reuse dialog
    table-skeleton.tsx          # Loading skeleton for tables
    theme-customizer.tsx        # Theme toggle

  config/                       # Environment variables, constants
  features/                     # Feature modules (see below)
  hooks/                        # Shared app-wide hooks
  lib/                          # Pre-configured library instances
    api-client.ts               # Axios instance with CSRF + interceptors
    auth.tsx                    # AuthProvider, AuthLoader, useUser
    authorization.tsx           # RBAC utilities
    deidentify.ts               # Client-side de-identification for preview
    eml-parser.ts               # .eml file parser (RFC 2047/2822, MIME)
    header-slot.tsx             # Dynamic header slot for layouts
    offset-utils.ts             # Selection-to-offset mapping utilities
    react-query.ts              # QueryClient factory
    theme.tsx                   # Theme provider (custom, not next-themes)
    utils.ts                    # cn() utility from shadcn
  types/                        # Shared TypeScript types
    enums.ts                    # Const enum objects (UserRole, JobStatus, etc.)
    models.ts                   # TypeScript interfaces for all models
  utils/                        # Shared utility functions
```

Each feature module follows this internal structure:
```
src/features/{name}/
  api/                          # Fetcher functions + React Query hooks + mapper
  components/                   # Feature-specific UI components
  hooks/                        # Feature-specific hooks (if needed)
  utils/                        # Feature-specific utilities (if needed)
```

---

## Phase 0 — Project Foundation [COMPLETED]

> **Goal:** Configure tooling, create shared UI primitives, define the complete data schema, set up routing, and establish the shared utility/types layer. Everything in this phase had zero application-logic dependencies.

### 0.1 Tailwind CSS 4 Configuration

**Description:** Configured Tailwind CSS 4 using the `@tailwindcss/vite` plugin approach. Tailwind CSS 4 does not use `tailwind.config.ts` or `postcss.config.js` — all configuration is done via `@theme` directives in `src/index.css`.

**Backend work:** None.

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Installed `@tailwindcss/vite` plugin and configured in `vite.config.ts` | `vite.config.ts` |
| Configured `src/index.css` with Tailwind directives, `@theme` block for design tokens (OKLCH colors, radii), and `@custom-variant dark` | `src/index.css` |
| Set up Geist Sans and Geist Mono font faces | `src/index.css` |
| Configured light/dark mode CSS variables using OKLCH color space | `src/index.css` |

### 0.2 Shared UI Component Library (shadcn/ui)

**Description:** Installed and configured [shadcn/ui](https://ui.shadcn.com/docs/installation) as the UI component library. Components were added via the shadcn CLI and live in `src/components/ui/`.

**Backend work:** None.

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Ran `npx shadcn@latest init` — scaffolded `src/lib/utils.ts` (`cn()`), `components.json` | `components.json`, `src/lib/utils.ts` |
| Installed 32 shadcn components via CLI | `src/components/ui/*.tsx` |

**Installed shadcn components (32):**

alert, alert-dialog, avatar, badge, breadcrumb, button, card, chart, checkbox, dialog, dropdown-menu, input, label, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

### 0.3 TanStack Router & Layout Shells

**Description:** Set up `@tanstack/react-router` with role-prefixed routes, the root provider stack, and persistent layout shells (admin sidebar, annotator/QA top-nav).

**Backend work:** None.

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Installed `@tanstack/react-router`, `@tanstack/react-query`, and router plugin | `package.json` |
| Created root provider stack — `<Suspense>` → `<ErrorBoundary>` → `<QueryClientProvider>` → `<Toaster>` → children | `src/app/provider.tsx` |
| Created TanStack Router instance with route tree | `src/app/router.tsx` |
| Created app root export that mounts the router inside providers | `src/app/index.tsx` |
| Created root route (wraps all routes) | `src/app/routes/__root.tsx` |
| Created `AdminLayout` — sidebar nav + main content `<Outlet>` + dynamic breadcrumbs | `src/components/layouts/AdminLayout.tsx` |
| Created `AnnotatorLayout` — top nav + `<Outlet>` | `src/components/layouts/AnnotatorLayout.tsx` |
| Created `QALayout` — top nav + `<Outlet>` | `src/components/layouts/QALayout.tsx` |
| Created route files for every route | `src/app/routes/**/*.tsx` |
| Updated `src/main.tsx` to mount `App` from `src/app/index.tsx` | `src/main.tsx` |

**Route file structure (actual):**

```
src/app/routes/
  __root.tsx                    # Root route (providers wrapper)
  index.tsx                     # Redirect to role-appropriate dashboard
  login.tsx
  forgot-password.tsx
  change-password.tsx
  unauthorized.tsx
  admin/
    route.tsx                   # AdminLayout (parent route with <Outlet>)
    index.tsx                   # Redirect to dashboard
    dashboard.tsx
    datasets/
      index.tsx                 # DatasetListPage
      $id.tsx                   # DatasetDetailPage
    annotation-classes.tsx
    users.tsx
    job-assignment.tsx
    export.tsx
    settings.tsx
    jobs/$jobId/history.tsx
  annotator/
    route.tsx                   # AnnotatorLayout
    index.tsx                   # Redirect to dashboard
    dashboard.tsx
    jobs/$jobId/annotate.tsx
    jobs/$jobId/history.tsx
  qa/
    route.tsx                   # QALayout
    index.tsx                   # Redirect to dashboard
    dashboard.tsx
    jobs/$jobId/review.tsx
    jobs/$jobId/history.tsx
```

**Route map (URL paths):**

```
/                               → Redirect based on role
/login
/forgot-password
/change-password
/unauthorized

/admin                          → AdminLayout
  /admin/dashboard
  /admin/datasets
  /admin/datasets/$id
  /admin/annotation-classes
  /admin/users
  /admin/job-assignment
  /admin/export
  /admin/settings
  /admin/jobs/$jobId/history

/annotator                      → AnnotatorLayout
  /annotator/dashboard
  /annotator/jobs/$jobId/annotate
  /annotator/jobs/$jobId/history

/qa                             → QALayout
  /qa/dashboard
  /qa/jobs/$jobId/review
  /qa/jobs/$jobId/history
```

### 0.4 Django Models (Complete)

**Description:** Defined the full application data model across all Django apps with proper fields, relationships, and permissions.

**Backend work:**

| Task | Key Files |
|------|-----------|
| Defined custom `User` model (UUID PK, email-based auth, role enum, status enum, force_password_change) | `backend/accounts/models.py` |
| Defined `Dataset` model (UUID PK, name, uploaded_by FK, upload_date, file_count, duplicate_count, status enum, error_message) | `backend/datasets/models.py` |
| Defined `Job` model (UUID PK, dataset FK, file_name, eml_content_compressed, content_hash, status enum, assigned_annotator FK, assigned_qa FK) | `backend/datasets/models.py` |
| Defined `AnnotationClass` model (UUID PK, name, display_label, color, description, created_by FK, is_deleted soft-delete flag) | `backend/core/models.py` |
| Defined `PlatformSetting` model (UUID PK, key unique, value) — for blind review toggle | `backend/core/models.py` |
| Defined `AnnotationVersion` model (UUID PK, job FK, version_number, created_by FK, source enum) | `backend/annotations/models.py` |
| Defined `Annotation` model (UUID PK, annotation_version FK, class_id FK, class_name, tag, start_offset, end_offset, original_text) | `backend/annotations/models.py` |
| Defined `DraftAnnotation` model (UUID PK, job FK unique, annotations JSON, updated_at) | `backend/annotations/models.py` |
| Defined `QAReviewVersion` model (UUID PK, job FK, version_number, annotation_version FK, reviewed_by FK, decision enum, comments, modifications_summary) | `backend/qa/models.py` |
| Defined `QADraftReview` model (UUID PK, job FK unique, data JSON, updated_at) | `backend/qa/models.py` |
| Defined `ExportRecord` model (UUID PK, dataset FK, job_ids JSON, file_size, file_path, exported_by FK) | `backend/exports/models.py` |
| Configured DRF authentication and permission classes | `backend/config/settings.py` |
| Added RBAC permission classes: IsAdmin, IsAnnotator, IsQA, IsAdminOrAnnotator, IsAdminOrQA, IsAnyRole | `backend/core/permissions.py` |

**Implementation Note — Storage evolution:**
Job storage migrated from file-system (`file_path`) to in-database compressed storage (`eml_content_compressed` BinaryField with zlib) via migrations 0002–0007. Deduplication via `content_hash` (SHA-256) added in migration 0008 with two-phase dedup (intra-ZIP + global). `Dataset.duplicate_count` tracks skipped duplicates.

### 0.5 Django Auth Configuration

**Description:** Configured the custom User model with email-based authentication, role field for RBAC, and session-based auth.

**Backend work:**

| Task | Key Files |
|------|-----------|
| Configured custom User model with `USERNAME_FIELD = "email"` | `backend/accounts/models.py` |
| Set up session-based authentication with CSRF protection | `backend/config/settings.py` |

### 0.6 Django File Storage Configuration

**Description:** Configured Django FileSystemStorage (MEDIA_ROOT) for dataset uploads, extracted .eml files, and export archives.

**Backend work:**

| Task | Key Files |
|------|-----------|
| Configured MEDIA_ROOT and MEDIA_URL in Django settings | `backend/config/settings.py` |
| Defined file path structure: `datasets/{datasetId}/`, `exports/` | `backend/config/settings.py` |
| Configured file upload handlers and max upload size | `backend/config/settings.py` |
| Added media URL routing for development | `backend/config/urls.py` |

### 0.7 Shared Types & API Client Layer

**Description:** Defined TypeScript types used across modules, created the API client wrapper, and configured React Query.

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Defined shared enums: `UserRole`, `UserStatus`, `JobStatus`, `DatasetStatus`, `AnnotationSource`, `QADecision`, `ContentViewMode`, `AnnotationQAStatus` | `src/types/enums.ts` |
| Defined shared interfaces: `User`, `Dataset`, `Job`, `AnnotationClass`, `AnnotationVersion`, `Annotation`, `QAReviewVersion`, `ExportRecord`, `WorkspaceAnnotation` | `src/types/models.ts` |
| Created axios HTTP client singleton with session cookie handling, CSRF token from cookie, 401 redirect, error interceptor with toast notifications | `src/lib/api-client.ts` |
| Created QueryClient factory with default options (60s staleTime, 1 retry, global mutation error fallback) | `src/lib/react-query.ts` |

---

## Phase 1 — Auth & Core Admin [COMPLETED]

> **Goal:** Implemented authentication (login flow, session management, route guards) and two independent admin CRUD modules (User Management, Annotation Classes). Auth came first; then User Management and Annotation Classes were built **in parallel**.

### 1.1 Authentication Module

**Dependencies:** Phase 0 (layout shells, routing, auth config, shared UI components).

**Module spec:** `docs/modules/authentication.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Implemented auth views: login, logout, me, change-password, forgot-password, reset-password | `backend/accounts/views.py` |
| Created auth serializers | `backend/accounts/serializers.py` |
| Defined auth URL routes | `backend/accounts/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Implemented auth lib — `AuthProvider` context, `AuthLoader` component, `useUser()` hook | `src/lib/auth.tsx` |
| Implemented RBAC utilities — role checks, permission helpers | `src/lib/authorization.tsx` |
| Created auth feature API hooks — `useLogin()`, `useLogout()`, `useChangePassword()`, `useForgotPassword()`, `useGetCurrentUser()` with `user-mapper.ts` | `src/features/auth/api/*.ts` |
| Implemented `LoginForm`, `ForgotPasswordForm`, `ChangePasswordForm` components | `src/features/auth/components/*.tsx` |
| Created auth route files — login, forgot-password, change-password at top level (not in auth/ subdir) | `src/app/routes/login.tsx`, `src/app/routes/forgot-password.tsx`, `src/app/routes/change-password.tsx` |
| Created unauthorized route | `src/app/routes/unauthorized.tsx` |
| Added auth guards via `beforeLoad` on protected route definitions | `src/app/routes/admin/route.tsx`, `src/app/routes/annotator/route.tsx`, `src/app/routes/qa/route.tsx` |

**UI screens covered:** `docs/ui/login.md`

### 1.2 User Management Module (parallel with 1.3)

**Dependencies:** Phase 0 + 1.1 (Authentication).

**Module spec:** `docs/modules/user-management.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created UserViewSet — list, create, update, deactivate, activate, job_impact actions | `backend/accounts/views.py` |
| Created user serializers | `backend/accounts/serializers.py` |
| Defined URL routes via DRF router | `backend/accounts/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created users feature API layer — `getUsers`, `createUser`, `updateUser`, `deactivateUser`, `activateUser`, `getUserJobImpact` | `src/features/users/api/get-users.ts`, `create-user.ts`, `update-user.ts`, `deactivate-user.ts`, `activate-user.ts`, `get-user-job-impact.ts` |
| Implemented `UserFormDialog`, `DeactivationConfirmDialog`, `UsersFilters`, `UsersTable` | `src/features/users/components/*.tsx` |
| Created users route | `src/app/routes/admin/users.tsx` |

**UI screens covered:** `docs/ui/user-management.md`

### 1.3 Annotation Class Management Module (parallel with 1.2)

**Dependencies:** Phase 0.

**Module spec:** `docs/modules/annotation-class-management.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created seed management command for 11 default annotation classes | `backend/core/management/commands/seed_annotation_classes.py` |
| Created AnnotationClassViewSet with CRUD + usage check (soft delete via `is_deleted`) | `backend/core/views.py` |
| Created serializers | `backend/core/serializers.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created annotation-classes feature API layer — `getAnnotationClasses`, `createAnnotationClass`, `updateAnnotationClass`, `deleteAnnotationClass`, `getAnnotationClassUsage` with `annotation-class-mapper.ts` | `src/features/annotation-classes/api/*.ts` |
| Implemented `AnnotationClassFormDialog`, `AnnotationClassesTable`, `DeleteConfirmDialog` | `src/features/annotation-classes/components/*.tsx` |
| Created annotation-classes route | `src/app/routes/admin/annotation-classes.tsx` |

**UI screens covered:** `docs/ui/annotation-class-list.md`

---

## Phase 2 — Data Pipeline [COMPLETED]

> **Goal:** Implemented dataset upload/extraction and job assignment. Job Assignment depended on Dataset Management (jobs must exist before they can be assigned).

### 2.1 Dataset Management Module

**Dependencies:** Phase 0 (file storage, data schema) + Phase 1 (auth).

**Module spec:** `docs/modules/dataset-management.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created DatasetViewSet — upload (.zip multipart), list, retrieve, delete (cascade) | `backend/datasets/views.py` |
| Implemented .zip extraction logic — validates .eml files, creates Job records, updates Dataset status | `backend/datasets/views.py` |
| Created JobViewSet — list by dataset, retrieve, raw content serving | `backend/datasets/views.py` |
| Created dataset and job serializers | `backend/datasets/serializers.py` |
| Defined URL routes | `backend/datasets/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created datasets feature API layer — `getDatasets`, `getDataset`, `getDatasetStatus`, `uploadDataset`, `deleteDataset`, `getJobsByDataset`, `getJobRawContent` with `dataset-mapper.ts` and `job-mapper.ts` | `src/features/datasets/api/*.ts` |
| Implemented `DatasetUploadDialog`, `DatasetDeleteConfirmDialog`, `FileDropZone`, `StatusBadge`, `DatasetJobsTable`, `DatasetStatusCards` | `src/features/datasets/components/*.tsx` |
| Created dataset list and detail routes | `src/app/routes/admin/datasets/index.tsx`, `$id.tsx` |

**UI screens covered:** `docs/ui/dataset-list.md`, `docs/ui/dataset-detail.md`, `docs/ui/dataset-upload.md`

### 2.2 Job Assignment Module

**Dependencies:** Phase 2.1 + Phase 1.2.

**Module spec:** `docs/modules/job-assignment.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created job assignment views — assign, bulk assign, reassign, user workloads | `backend/datasets/views.py` |
| Created assignment serializers | `backend/datasets/serializers.py` |
| Defined URL routes | `backend/datasets/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created job-assignment feature API layer — `getUnassignedJobs`, `getAssignedJobs`, `getInProgressJobs`, `assignJobs`, `assignJobsBulk`, `reassignJobs`, `getUserWorkloads` | `src/features/job-assignment/api/*.ts` |
| Implemented `UnassignedJobsTable`, `AssignedJobsTable`, `AssignmentControlsPanel`, `AssignmentPreviewDialog`, `BulkReassignDialog` | `src/features/job-assignment/components/*.tsx` |
| Implemented round-robin distribution algorithm | `src/features/job-assignment/utils/round-robin.ts` |
| Created job-assignment route with annotation/QA tabs | `src/app/routes/admin/job-assignment.tsx` |

**UI screens covered:** `docs/ui/job-assignment.md`

---

## Phase 3 — Core Annotation & QA Workflows [COMPLETED]

> **Goal:** Built the primary annotation and QA review interfaces. Shared components (RawContentViewer, EmailViewer, eml-parser) were built first, then the annotation and QA workspaces proceeded **in parallel**.

### 3.0 Shared Components (prerequisite for 3.1 and 3.2)

**Dependencies:** Phase 0 + Phase 1 + Phase 2.

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Implemented `.eml` parser — RFC 2047 encoded headers, RFC 2822 dates, multipart MIME, base64/quoted-printable decoding | `src/lib/eml-parser.ts` |
| Implemented `RawContentViewer` — monospace `<pre>`, line number gutter, colored `<span>` highlights, text selection → offset calculation, annotation badges via CSS `::after` (not textContent) | `src/components/raw-content-viewer.tsx` |
| Implemented `EmailViewer` — parsed email display with sender avatar, header fields, body | `src/components/email-viewer.tsx` |
| Implemented `EmailPreview` — rendered HTML/text preview | `src/components/email-preview.tsx` |
| Implemented `ClassSelectionPopup` — searchable class list with ARIA listbox/option, keyboard navigation, scroll-into-view | `src/components/class-selection-popup.tsx` |
| Implemented `SameValueLinkingDialog` — tag reuse suggestion | `src/components/same-value-linking-dialog.tsx` |
| Implemented `AnnotationsListTab` — table of annotations with tag, class, text, offsets, edit/delete | `src/components/annotations-list-tab.tsx` |
| Implemented offset calculation utilities — selection-to-offset mapping, CRLF normalization | `src/lib/offset-utils.ts` |

**UI screens covered:** `docs/ui/email-viewer.md`

### 3.1 Annotation Interface Module (parallel with 3.2)

**Dependencies:** Phase 3.0 + Phase 1.3.

**Module spec:** `docs/modules/annotation-interface.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created annotation views — start annotation, save draft, load draft, submit, get job for annotation | `backend/annotations/views.py` |
| Created annotation serializers | `backend/annotations/serializers.py` |
| Defined URL routes | `backend/annotations/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created annotations feature API layer — `startAnnotation`, `saveDraft`, `getDraft`, `submitAnnotation`, `getJobForAnnotation`, `getMyAnnotationJobs` with `annotation-mapper.ts` | `src/features/annotations/api/*.ts` |
| Implemented `AnnotationWorkspace` — resizable two-panel split, top bar, bottom bar with save/submit/count | `src/features/annotations/components/annotation-workspace.tsx` |
| Implemented `ReworkBanner` — QA rejection comments, reviewer info | `src/features/annotations/components/rework-banner.tsx` |
| Implemented `JobsSummaryBar` — status counts for annotator dashboard | `src/features/annotations/components/jobs-summary-bar.tsx` |
| Implemented `MyJobsTable` — annotator's assigned jobs with status-dependent actions | `src/features/annotations/components/my-jobs-table.tsx` |
| Implemented `useAnnotationWorkspace` hook — manages annotations, same-value map, tag counters, dirty state | `src/features/annotations/hooks/use-annotation-workspace.ts` |
| Created annotator dashboard route | `src/app/routes/annotator/dashboard.tsx` |
| Created annotation workspace route | `src/app/routes/annotator/jobs/$jobId/annotate.tsx` |

**UI screens covered:** `docs/ui/annotator-dashboard.md`, `docs/ui/annotation-interface.md`

### 3.2 QA Interface Module (parallel with 3.1)

**Dependencies:** Phase 3.0 + Phase 1.3.

**Module spec:** `docs/modules/qa-interface.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created QA review views — start review, accept, reject, get job for QA, blind review setting, save/load QA draft | `backend/qa/views.py` |
| Created QA serializers | `backend/qa/serializers.py` |
| Defined URL routes | `backend/qa/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created qa-review feature API layer — `startQAReview`, `acceptAnnotation`, `rejectAnnotation`, `getJobForQAReview`, `getBlindReviewSetting`, `getMyQAJobs`, `getQADraft`, `saveQADraft` with `qa-review-mapper.ts` | `src/features/qa-review/api/*.ts` |
| Implemented `QAReviewWorkspace` — two-panel split with edit mode toggle | `src/features/qa-review/components/qa-review-workspace.tsx` |
| Implemented `AnnotationReviewPopover` — Mark OK / Flag / Edit / Delete per annotation | `src/features/qa-review/components/annotation-review-popover.tsx` |
| Implemented `EditModeControls` — toggle button, modification counter | `src/features/qa-review/components/edit-mode-controls.tsx` |
| Implemented `AnnotationsReviewListTab` — status column, filter by status | `src/features/qa-review/components/annotations-review-list-tab.tsx` |
| Implemented `AcceptDialog`, `RejectDialog` — confirmation with summaries/comments | `src/features/qa-review/components/accept-dialog.tsx`, `reject-dialog.tsx` |
| Implemented `QAJobsSummaryBar` — status counts for QA dashboard | `src/features/qa-review/components/qa-jobs-summary-bar.tsx` |
| Implemented `MyQAJobsTable` — QA's assigned jobs with actions | `src/features/qa-review/components/my-qa-jobs-table.tsx` |
| Implemented `useQAReview` hook — manages original/current annotations, QA statuses, modifications, edit mode | `src/features/qa-review/hooks/use-qa-review.ts` |
| Created QA dashboard route | `src/app/routes/qa/dashboard.tsx` |
| Created QA review workspace route | `src/app/routes/qa/jobs/$jobId/review.tsx` |

**UI screens covered:** `docs/ui/qa-dashboard.md`, `docs/ui/qa-review-interface.md`

---

## Phase 4 — Audit, Export & Dashboard [COMPLETED]

> **Goal:** Built the three remaining modules that consume data produced by Phase 3 workflows. All three were **independent** of each other and were built in parallel.

### 4.1 Version History Module (parallel with 4.2 and 4.3)

**Dependencies:** Phase 3.

**Module spec:** `docs/modules/version-history.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created version history views — get timeline, get annotations for version (no new models, queries AnnotationVersion + QAReviewVersion) | `backend/history/views.py` |
| Created history serializers | `backend/history/serializers.py` |
| Defined URL routes | `backend/history/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created version-history feature API layer — `getVersionHistory`, `getAnnotationsForVersion`, `getJobInfo` with `history-mapper.ts` | `src/features/version-history/api/*.ts` |
| Implemented `VersionTimeline` — vertical chronological timeline with annotation/QA version cards | `src/features/version-history/components/version-timeline.tsx` |
| Implemented `VersionComparisonPanel` — side-by-side diff with added/removed/modified/unchanged | `src/features/version-history/components/version-comparison-panel.tsx` |
| Implemented `VersionDetailView` — all annotations for a single version | `src/features/version-history/components/version-detail-view.tsx` |
| Implemented `VersionHistoryPage` — shared page used across admin/annotator/QA routes | `src/features/version-history/components/version-history-page.tsx` |
| Implemented diff algorithm | `src/features/version-history/utils/version-diff.ts` |
| Created history route files for all three roles | `src/app/routes/admin/jobs/$jobId/history.tsx`, `annotator/jobs/$jobId/history.tsx`, `qa/jobs/$jobId/history.tsx` |

**UI screens covered:** `docs/ui/version-history.md`

### 4.2 Export Module (parallel with 4.1 and 4.3)

**Dependencies:** Phase 3.

**Module spec:** `docs/modules/export.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created export views — create export (de-identify + zip), preview, list history, list datasets with delivered, download | `backend/exports/views.py` |
| Implemented de-identification algorithm with `to_original_offset()` for CRLF-aware offset mapping | `backend/exports/views.py` |
| Used `StreamingHttpResponse` for exports >1MB with Content-Length header | `backend/exports/views.py` |
| Created export serializers | `backend/exports/serializers.py` |
| Defined URL routes | `backend/exports/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created export feature API layer — `getDatasetsWithDelivered`, `getDeliveredJobs`, `createExport`, `getExportPreview`, `getExportHistory` with `export-mapper.ts` | `src/features/export/api/*.ts` |
| Implemented `DeliveredJobsTable` — checkbox selection, file details | `src/features/export/components/delivered-jobs-table.tsx` |
| Implemented `ExportPreview` — side-by-side original vs de-identified | `src/features/export/components/export-preview.tsx` |
| Implemented `ExportControls` — preview / export buttons | `src/features/export/components/export-controls.tsx` |
| Implemented `ExportHistoryTable` — download links, metadata | `src/features/export/components/export-history-table.tsx` |
| Implemented client-side de-identification utility for preview | `src/lib/deidentify.ts` |
| Created export route | `src/app/routes/admin/export.tsx` |

**UI screens covered:** `docs/ui/export.md`

### 4.3 Admin Dashboard Module (parallel with 4.1 and 4.2)

**Dependencies:** Phase 2 + Phase 1.

**Module spec:** `docs/modules/admin-dashboard.md`

**Backend work:**

| Task | Key Files |
|------|-----------|
| Created dashboard views — stats, job status counts, recent datasets, annotator performance, QA performance | `backend/dashboard/views.py` |
| Fixed N+1 queries with annotated subqueries | `backend/dashboard/views.py` |
| Defined URL routes | `backend/dashboard/urls.py` |

**Frontend work:**

| Task | Key Files |
|------|-----------|
| Created dashboard feature API layer — `getDashboardStats`, `getJobStatusCounts`, `getRecentDatasets`, `getAnnotatorPerformance`, `getQAPerformance`, `getBlindReviewSetting`, `updateBlindReviewSetting`, `getDatasetOptions` with `dashboard-mapper.ts` | `src/features/dashboard/api/*.ts` |
| Implemented `StatsCards` — metric cards with counts | `src/features/dashboard/components/stats-cards.tsx` |
| Implemented `JobStatusChart` — bar chart using Recharts | `src/features/dashboard/components/job-status-chart.tsx` |
| Implemented `RecentDatasetsTable` — 5 most recent | `src/features/dashboard/components/recent-datasets-table.tsx` |
| Implemented `AnnotatorPerformanceTable` — sortable metrics | `src/features/dashboard/components/annotator-performance-table.tsx` |
| Implemented `QAPerformanceTable` — sortable metrics | `src/features/dashboard/components/qa-performance-table.tsx` |
| Implemented `QuickActions` — action buttons | `src/features/dashboard/components/quick-actions.tsx` |
| Created admin dashboard route with real API data | `src/app/routes/admin/dashboard.tsx` |
| Created admin settings route — blind review toggle | `src/app/routes/admin/settings.tsx` |

**Settings backend:**

| Task | Key Files |
|------|-----------|
| Created settings views — GET/PUT blind review toggle via PlatformSetting | `backend/core/settings_views.py` |
| Created min-annotation-length setting — GET/PUT with configurable minimum | `backend/core/settings_views.py`, `backend/core/settings_urls.py` |
| Defined settings URL routes | `backend/core/settings_urls.py` |

**UI screens covered:** `docs/ui/admin-dashboard.md`

---

## Phase 5 — Integration Testing & Polish [COMPLETED]

> **Goal:** End-to-end workflow validation, error handling hardening, UI polish, and performance optimization. No new modules — this phase hardened what was built in Phases 0–4.

### 5.1 Toast Notification System

| Task | Key Files |
|------|-----------|
| Integrated sonner toast library (custom `useTheme` from `src/lib/theme.tsx`, not next-themes) | `src/components/ui/sonner.tsx`, `src/lib/theme.tsx` |
| Added `toast.success()` calls on all 20 mutation hooks across features | All `useMutation` hooks |
| Created `getApiErrorMessage()` utility for consistent error extraction | `src/lib/api-client.ts` |
| Enhanced error interceptor — 403/409/500+ status toasts, network error toasts | `src/lib/api-client.ts` |
| Added global mutation `onError` fallback in React Query default options | `src/lib/react-query.ts` |

### 5.2 Loading & Empty States

| Task | Key Files |
|------|-----------|
| Created `TableSkeleton` component — reusable skeleton for data tables | `src/components/table-skeleton.tsx` |
| Created `EmptyState` component — icon + title + description + optional action | `src/components/empty-state.tsx` |
| Added skeleton loaders to 5 route pages and 2 workspace views | Various route files |
| Added empty states to 4 tables | Various table components |

### 5.3 Accessibility Improvements

| Task | Key Files |
|------|-----------|
| Added ARIA listbox/option roles + scroll-into-view on `ClassSelectionPopup` | `src/components/class-selection-popup.tsx` |
| Added `role=document` on `RawContentViewer` | `src/components/raw-content-viewer.tsx` |
| Added `aria-label` on `AnnotationsListTab` | `src/components/annotations-list-tab.tsx` |
| Standardized heading hierarchy across all pages | Various route files |
| Added `transition-colors` to `StatusBadge` | `src/features/datasets/components/status-badge.tsx` |

### 5.4 Performance Optimization

| Task | Key Files |
|------|-----------|
| `RawContentViewer` — single `<pre>` for line numbers, memoized segments | `src/components/raw-content-viewer.tsx` |
| Backend N+1 fixes — dashboard annotated queries, exports subquery annotations | `backend/dashboard/views.py`, `backend/exports/views.py` |
| `StreamingHttpResponse` for exports >1MB with Content-Length header | `backend/exports/views.py` |

### 5.5 Optimistic Locking & Error Handling

| Task | Key Files |
|------|-----------|
| Added `expected_status` parameter for optimistic locking on 5 job transition endpoints | `backend/datasets/views.py`, `backend/annotations/views.py`, `backend/qa/views.py` |
| Custom DRF exception handler with structured error responses | `backend/config/settings.py` |
| Configured Django LOGGING for structured backend logging | `backend/config/settings.py` |

---

## Post-Phase — E2E Testing [COMPLETED]

> Added after Phase 5. Playwright-based end-to-end tests for critical user flows.

### Setup

| Task | Key Files |
|------|-----------|
| Configured Playwright with Chromium | `frontend/playwright.config.ts` |
| Created E2E config for test credentials (gitignored) | `frontend/e2e/config.example.ts`, `frontend/e2e/config.ts` |
| Created auth fixtures — `loginViaUI()`, `getCredentials()`, `TestRole`, `ROLE_DASHBOARDS` | `frontend/e2e/fixtures/auth.ts` |
| Separated E2E types from app build | `frontend/tsconfig.e2e.json` |

### Tests

| Test File | Coverage |
|-----------|----------|
| `frontend/e2e/tests/login.spec.ts` | Login form rendering, invalid credentials, button states, role-based login + redirect |

---

## Appendix A — Module ↔ UI Screen Mapping

| Module | UI Screens |
|--------|-----------|
| Authentication (1.1) | `login.md` |
| User Management (1.2) | `user-management.md` |
| Annotation Class Management (1.3) | `annotation-class-list.md` |
| Dataset Management (2.1) | `dataset-list.md`, `dataset-detail.md`, `dataset-upload.md` |
| Job Assignment (2.2) | `job-assignment.md` |
| Annotation Interface (3.1) | `annotator-dashboard.md`, `annotation-interface.md` |
| QA Interface (3.2) | `qa-dashboard.md`, `qa-review-interface.md` |
| Version History (4.1) | `version-history.md` |
| Export (4.2) | `export.md` |
| Admin Dashboard (4.3) | `admin-dashboard.md` |
| Shared (3.0) | `email-viewer.md` (used across annotation, QA, dataset detail, version history) |

**All 15 UI screens accounted for. All 10 module specs accounted for.**

## Appendix B — Dependency Graph

```
Phase 0 ──────────────────────────────────────────────────────────────
  0.1 Tailwind CSS 4 Config
  0.2 Shared UI Components (32 shadcn)
  0.3 TanStack Router & Layout Shells
  0.4 Data Schema (all Django models)
  0.5 Auth Config (User role field)
  0.6 File Storage
  0.7 Shared Types & API Client
         │
         ▼
Phase 1 ──────────────────────────────────────────────────────────────
  1.1 Authentication
         │
    ┌────┴────┐
    ▼         ▼
  1.2 User  1.3 Annotation
  Mgmt      Classes
    │         │
    ▼         │
Phase 2 ──────┼───────────────────────────────────────────────────────
  2.1 Dataset │
  Management  │
    │         │
    ▼         │
  2.2 Job     │
  Assignment  │
    │         │
    ▼         ▼
Phase 3 ──────────────────────────────────────────────────────────────
  3.0 Shared Components (RawContentViewer, EmailViewer, eml-parser)
         │
    ┌────┴────┐
    ▼         ▼
  3.1 Annotation    3.2 QA
  Interface         Interface
    │         │         │
    ▼         ▼         ▼
Phase 4 ──────────────────────────────────────────────────────────────
  4.1 Version    4.2 Export    4.3 Admin
  History        Module       Dashboard
         │         │              │
         ▼         ▼              ▼
Phase 5 ──────────────────────────────────────────────────────────────
  5.1 Toast Notifications
  5.2 Loading & Empty States
  5.3 Accessibility
  5.4 Performance
  5.5 Optimistic Locking
```

## Appendix C — Key Files Reference

| File | Purpose |
|------|---------|
| `frontend/package.json` | Dependencies: React 19.2, TypeScript 5.9, Vite 7.2, TanStack Router/Query, Tailwind CSS 4.1, shadcn, Recharts, Sonner, Axios |
| `frontend/vite.config.ts` | Vite config with TanStackRouterVite (before react), tailwindcss plugin, Django proxy |
| `frontend/components.json` | shadcn/ui config (new-york style, neutral base, OKLCH colors) |
| `frontend/src/index.css` | Tailwind directives, @theme tokens, OKLCH light/dark variables, Geist fonts |
| `frontend/src/main.tsx` | React render entry point |
| `frontend/src/app/index.tsx` | App root export, mounts router inside providers |
| `frontend/src/app/router.tsx` | TanStack Router instance + route tree |
| `frontend/src/app/provider.tsx` | Root providers (QueryClient, Auth, ErrorBoundary, Toaster) |
| `frontend/src/lib/auth.tsx` | AuthProvider context, AuthLoader, useUser hook |
| `frontend/src/lib/authorization.tsx` | RBAC utilities (role checks, permission helpers) |
| `frontend/src/lib/api-client.ts` | Axios instance with CSRF, error interceptor, toast integration |
| `frontend/src/lib/react-query.ts` | QueryClient factory with default options |
| `frontend/src/lib/eml-parser.ts` | .eml file parser (RFC 2047/2822, MIME) |
| `frontend/src/lib/offset-utils.ts` | Selection-to-offset mapping, CRLF normalization |
| `frontend/src/lib/deidentify.ts` | Client-side de-identification for export preview |
| `frontend/src/lib/theme.tsx` | Custom theme provider (light/dark, not next-themes) |
| `frontend/src/types/enums.ts` | Const enum objects (UserRole, JobStatus, DatasetStatus, etc.) |
| `frontend/src/types/models.ts` | TypeScript interfaces for all backend models |
| `backend/config/settings.py` | Django settings (DB, auth, DRF, MEDIA, CORS, LOGGING) |
| `backend/config/urls.py` | Root URL config — all app patterns under `/api/` |
| `backend/accounts/models.py` | Custom User model (UUID PK, email auth, role, status) |
| `backend/datasets/models.py` | Dataset + Job models |
| `backend/core/models.py` | AnnotationClass + PlatformSetting |
| `backend/core/permissions.py` | RBAC permission classes |
| `backend/annotations/models.py` | AnnotationVersion, Annotation, DraftAnnotation |
| `backend/qa/models.py` | QAReviewVersion, QADraftReview |
| `backend/exports/models.py` | ExportRecord |
