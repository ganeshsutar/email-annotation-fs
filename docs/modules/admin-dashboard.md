> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Admin Dashboard Module

## Purpose & Scope

The Admin landing page providing a high-level overview of platform activity. Displays summary statistics (datasets, jobs by status), a job status distribution chart, recent datasets, and annotator/QA performance tables. Serves as the central navigation hub for Admins with quick-action links to key workflows.

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-7 | Dashboard — overview of all datasets, jobs by status, annotator/QA performance |
| A-9 | Blind review toggle — accessible from dashboard settings |

## Components

### 1. AdminDashboardPage (Main Layout)
- Left sidebar navigation (persistent across all admin pages)
- Main content area with dashboard widgets

### 2. Sidebar Navigation
- Logo / App name
- Navigation links:
  - Dashboard (active)
  - Datasets
  - Annotation Classes
  - Users
  - Job Assignment
  - Export
  - Settings (blind review toggle)
- Current user display (name, role badge) at bottom
- Sign Out button

### 3. StatsCards Row
- Row of summary cards across the top:
  - **Total Datasets** — count with trend indicator
  - **Total Jobs** — total count
  - **Jobs Pending Assignment** — UPLOADED status count (link to Job Assignment)
  - **Jobs In Progress** — ASSIGNED + IN_PROGRESS + QA_ASSIGNED + QA_IN_PROGRESS count
  - **Jobs Delivered** — DELIVERED count
  - **Jobs Awaiting QA** — ANNOTATED status count (link to QA assignment)

### 4. JobStatusChart
- Bar chart or stacked bar showing job counts per status
- Statuses: UPLOADED, ASSIGNED, IN_PROGRESS, ANNOTATED, QA_ASSIGNED, QA_IN_PROGRESS, ACCEPTED, REJECTED, DELIVERED
- Color-coded bars matching status badges
- Clickable bars link to filtered job views

### 5. RecentDatasetsTable
- Table showing the 5 most recently uploaded datasets
- Columns: Name, Upload Date, File Count, Status Summary (mini progress bar), Actions
- "View All" link to Dataset List page
- Row click navigates to Dataset Detail

### 6. AnnotatorPerformanceTable
- Table showing annotator productivity metrics
- Columns: Annotator Name, Assigned Jobs, Completed Jobs, In Progress, Acceptance Rate (%), Avg Annotations/Job
- Sortable by any column
- "View All" link to detailed performance page (future)

### 7. QAPerformanceTable
- Table showing QA reviewer metrics
- Columns: QA User Name, Reviewed Jobs, Accepted, Rejected, In Review, Avg Review Time
- Sortable by any column

### 8. QuickActions
- Contextual action buttons/links:
  - "Upload Dataset" → opens DatasetUploadDialog
  - "Assign Annotation Jobs" → navigates to Job Assignment (Annotation tab)
  - "Assign QA Jobs" → navigates to Job Assignment (QA tab)
  - "Export Delivered Jobs" → navigates to Export page

## Data Flow

```
Admin navigates to /admin/dashboard
        │
        ▼
Parallel API calls:
  ├─ getDashboardStats → stats card data
  ├─ getJobStatusCounts → chart data
  ├─ listRecentDatasets → recent datasets table
  ├─ getAnnotatorPerformance → annotator metrics
  └─ getQAPerformance → QA metrics
        │
        ▼
Dashboard renders with all widgets populated
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| Sidebar | All Admin Pages | Navigation links |
| StatsCards | Job Assignment | "Pending" card links to assignment |
| RecentDatasetsTable | Dataset Detail | Row click navigates |
| QuickActions | Dataset Upload, Job Assignment, Export | Direct navigation/dialog open |
| JobStatusChart | Filtered Job Views | Clicking a bar filters by status |

## State Management

### Dashboard State
```typescript
interface AdminDashboardState {
  stats: {
    totalDatasets: number;
    totalJobs: number;
    pendingAssignment: number;
    inProgress: number;
    delivered: number;
    awaitingQA: number;
  };
  jobStatusCounts: Record<JobStatus, number>;
  recentDatasets: DatasetSummary[];
  annotatorPerformance: AnnotatorMetrics[];
  qaPerformance: QAMetrics[];
  loading: boolean;
}

interface AnnotatorMetrics {
  userId: string;
  name: string;
  assignedJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  acceptanceRate: number;     // percentage
  avgAnnotationsPerJob: number;
}

interface QAMetrics {
  userId: string;
  name: string;
  reviewedJobs: number;
  acceptedJobs: number;
  rejectedJobs: number;
  inReviewJobs: number;
  avgReviewTime: string;      // formatted duration
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Output | Notes |
|----------|--------|--------|-------|
| `/api/dashboard/stats/` | GET | `DashboardStats` | Aggregate counts |
| `/api/dashboard/job-status-counts/` | GET | `Record<JobStatus, number>` | For chart |
| `/api/dashboard/recent-datasets/` | GET | `DatasetSummary[]` | Most recent (limit 5) |
| `/api/dashboard/annotator-performance/` | GET | `AnnotatorMetrics[]` | All active annotators |
| `/api/dashboard/qa-performance/` | GET | `QAMetrics[]` | All active QA users |

### Refresh Strategy
- Dashboard data refreshes on page navigation (no auto-polling)
- Individual widgets can be manually refreshed via a refresh icon
- Data is not cached across navigation — always fetches fresh on mount
