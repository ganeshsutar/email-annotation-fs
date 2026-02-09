> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Job Assignment Module

## Purpose & Scope

Provides Admins with tools to assign annotation jobs to Annotators and QA jobs to QA users. Supports two assignment strategies: manual (Admin picks specific annotator/QA for selected jobs) and round-robin (system distributes evenly across selected users). Handles both initial annotation assignment (UPLOADED → ASSIGNED) and QA assignment (ANNOTATED → QA_ASSIGNED).

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-4 | Assign annotation jobs manually or via round-robin |
| A-5 | Assign QA jobs from the QA pool manually or via round-robin |
| Workflow 3.2 | Job Assignment (Admin) |

## Components

### 1. JobAssignmentPage
- **Tabs**: Annotation Assignment / QA Assignment
- Each tab has the same layout but operates on different job pools and user roles

### 2. UnassignedJobsTable (per tab)
- Shows jobs eligible for assignment:
  - Annotation tab: jobs with status `UPLOADED`
  - QA tab: jobs with status `ANNOTATED`
- Columns: Checkbox, File Name, Dataset Name, Created Date, Current Status
- Filters: Dataset dropdown, date range
- Search by file name
- Select all / deselect all checkbox in header
- Shows count of selected jobs

### 3. AssignmentControlsPanel
- **Strategy Toggle**: Manual / Round-Robin radio buttons
- **Manual mode**:
  - Single user selector dropdown (shows only active ANNOTATOR or QA users depending on tab)
  - "Assign Selected" button
- **Round-Robin mode**:
  - Multi-select user list with checkboxes (select which users to include in distribution)
  - Preview button → shows distribution preview before confirming
  - "Assign" button
- Selected job count display
- Disabled state when no jobs are selected

### 4. AssignmentPreviewDialog (Round-Robin)
- Table showing proposed distribution:
  - Columns: User Name, Jobs Assigned (count), Current Workload (existing assigned jobs)
  - List of specific job file names per user (collapsible)
- "Confirm Assignment" and "Cancel" buttons
- Distribution algorithm: sorts users by current workload (ascending), assigns jobs one-by-one to user with fewest total jobs

### 5. BulkReassignDialog
- For reassigning already-assigned jobs (e.g., when an annotator is unavailable)
- Select jobs → pick new assignee → confirm
- Only available for jobs in ASSIGNED or QA_ASSIGNED status (not in-progress)

## Data Flow

### Manual Assignment
```
Admin selects Annotation or QA tab
        │
        ▼
Unassigned jobs load (UPLOADED or ANNOTATED status)
        │
        ▼
Admin checks boxes on specific jobs
        │
        ▼
Admin selects "Manual" strategy → picks a user from dropdown
        │
        ▼
Clicks "Assign Selected"
        │
        ▼
API: assignJobs mutation
  Input: { jobIds[], assigneeId, assignmentType: 'ANNOTATION' | 'QA' }
        │
        ▼
Backend:
  ├─ Validates all jobs are in correct status
  ├─ Updates each job:
  │     Annotation: { status: ASSIGNED, assigned_annotator: userId }
  │     QA:         { status: QA_ASSIGNED, assigned_qa: userId }
  └─ Returns updated jobs
        │
        ▼
Table refreshes — assigned jobs no longer appear in unassigned list
```

### Round-Robin Assignment
```
Admin checks boxes on jobs (or "Select All")
        │
        ▼
Admin selects "Round-Robin" strategy
        │
        ▼
Admin selects users to include in distribution
        │
        ▼
Clicks "Preview"
        │
        ▼
Frontend calculates distribution:
  1. Fetch current workload per selected user
  2. Sort users by total assigned jobs (ascending)
  3. For each job to assign:
     a. Find user with lowest total count
     b. Assign job to that user
     c. Increment their count
  4. Display preview table
        │
        ▼
Admin reviews preview → clicks "Confirm"
        │
        ▼
API: assignJobsBulk mutation
  Input: { assignments: [{ jobId, assigneeId }][], assignmentType }
        │
        ▼
Backend processes all assignments atomically
        │
        ▼
Table refreshes with results
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| JobAssignmentPage | API | `listUnassignedJobs`, `assignJobs`, `assignJobsBulk` |
| JobAssignmentPage | User Management | Fetches active ANNOTATOR / QA users |
| DatasetDetailPage | JobAssignmentPage | "Assign Jobs" link pre-filters by dataset |
| Admin Dashboard | JobAssignmentPage | Quick action links |
| Assignment | Annotator Dashboard | Assigned jobs appear on annotator's job list |
| Assignment | QA Dashboard | Assigned QA jobs appear on QA user's job list |

## State Management

### Page State
```typescript
interface JobAssignmentState {
  activeTab: 'ANNOTATION' | 'QA';
  jobs: Job[];
  loading: boolean;
  selectedJobIds: Set<string>;
  filters: {
    datasetId: string | null;
    search: string;
  };
  strategy: 'MANUAL' | 'ROUND_ROBIN';
  // Manual mode
  selectedUserId: string | null;
  // Round-robin mode
  selectedUserIds: Set<string>;
  // Users available for assignment
  availableUsers: User[];
  // Preview
  previewOpen: boolean;
  previewDistribution: AssignmentPreview[] | null;
}

interface AssignmentPreview {
  user: User;
  jobIds: string[];
  currentWorkload: number;
  newTotal: number;
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/jobs/unassigned/` | GET | `?type=ANNOTATION\|QA&dataset_id=&search=&page=` | `{ results[], count }` | UPLOADED (annotation) or ANNOTATED (QA) |
| `/api/users/` | GET | `?role=&status=ACTIVE` | `User[]` | Active users of given role |
| `/api/jobs/workloads/` | GET | `?user_ids=&type=` | `{ userId, assignedCount }[]` | Current job counts per user |
| `/api/jobs/assign/` | POST | `{ jobIds[], assigneeId, type }` | `Job[]` | Manual assignment |
| `/api/jobs/assign-bulk/` | POST | `{ assignments: [{jobId, assigneeId}][], type }` | `Job[]` | Round-robin assignment |
| `/api/jobs/reassign/` | POST | `{ jobIds[], newAssigneeId, type }` | `Job[]` | Reassign from one user to another |

### Status Transitions
| Tab | From Status | To Status | Field Updated |
|-----|-------------|-----------|---------------|
| Annotation | `UPLOADED` | `ASSIGNED` | `assigned_annotator` |
| QA | `ANNOTATED` | `QA_ASSIGNED` | `assigned_qa` |
| Reassign (Annotation) | `ASSIGNED` | `ASSIGNED` | `assigned_annotator` (changed) |
| Reassign (QA) | `QA_ASSIGNED` | `QA_ASSIGNED` | `assigned_qa` (changed) |

## Validation Rules

- Jobs must be in the correct status for assignment (UPLOADED for annotation, ANNOTATED for QA)
- Assignee must be an active user with the correct role
- Cannot assign a job to the same annotator who already annotated it (for QA assignment)
- Round-robin requires at least one user selected
- Bulk operations are atomic — if any assignment fails, all roll back
