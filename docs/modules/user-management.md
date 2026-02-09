> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# User Management Module

## Purpose & Scope

Enables Admins to create, view, and manage user accounts on the platform. Users are created via the Django User model with `User.objects.create_user()`, which sends a temporary password email. Each user is assigned a role (ADMIN, ANNOTATOR, or QA) stored as a field on the custom User model. The module also manages the user list view, filtering, and user deactivation.

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-6 | Create/manage users with roles (Admin, Annotator, QA) |
| NF-1 | Secure login with role-based access control |

## Components

### 1. UserListPage
- Table displaying all platform users
- Columns: Name, Email, Role, Status (Active/Inactive), Created Date
- Role filter dropdown (All / Admin / Annotator / QA)
- Status filter (All / Active / Inactive)
- Search by name or email
- "Add User" button opens UserFormDialog
- Row actions: Edit, Deactivate/Activate

### 2. UserFormDialog (Modal)
- Mode: Create or Edit
- Fields:
  - **Name** — text input (required)
  - **Email** — email input (required, unique; disabled in edit mode)
  - **Role** — radio buttons: Admin, Annotator, QA (required)
- Create mode: calls the create user API endpoint, which sends a temporary password to the user's email
- Edit mode: updates name and/or role

### 3. UserDeactivationConfirmDialog
- Confirmation modal before deactivating a user
- Shows impact: number of currently assigned (in-progress) jobs
- Deactivation sets `User.is_active=False` — does not delete data
- Deactivated users cannot log in but their historical annotations/reviews remain intact

## Data Flow

```
Admin clicks "Add User"
        │
        ▼
UserFormDialog opens (Create mode)
        │
        ▼
Admin fills name, email, selects role → clicks "Create"
        │
        ▼
API call: createUser mutation
        │
        ├─ Backend: User.objects.create_user(email, name, tempPassword)
        │     └─ Sets role field on User model
        │     └─ Sends invitation email with temporary password
        │
        ├─ Backend: Creates User record in database (same operation)
        │     └─ { id, name, email, role, status: ACTIVE, created_at }
        │
        └─ Response: New user object
                │
                ▼
        UserListPage refreshes, shows new user
```

```
User first login with temporary password
        │
        ▼
Backend returns { force_password_change: true }
        │
        ▼
ForceChangePasswordPage (see Authentication module)
        │
        ▼
User sets permanent password → account fully active
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| UserListPage | UserFormDialog | Opens dialog for create/edit |
| UserFormDialog | API | `createUser` / `updateUser` mutation |
| API (DRF ViewSet) | Django ORM | `User.objects.create_user()`, `User.save()`, `User.is_active = False/True` |
| UserListPage | API | `listUsers` query with filters |
| UserDeactivationConfirmDialog | API | `deactivateUser` mutation |
| Job Assignment Module | User Management | Fetches annotators/QA users for assignment dropdowns |

## State Management

### Page State
```typescript
interface UserListState {
  users: User[];
  loading: boolean;
  filters: {
    search: string;
    role: 'ALL' | 'ADMIN' | 'ANNOTATOR' | 'QA';
    status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
  };
  dialogOpen: boolean;
  dialogMode: 'create' | 'edit';
  selectedUser: User | null;
}
```

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ANNOTATOR' | 'QA';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/users/` | GET | `?role=&status=&search=&page=` | `{ results[], count }` | Filterable by role, status, search text |
| `/api/users/{id}/` | GET | — | `User` | Single user details |
| `/api/users/` | POST | `{ name, email, role }` | `User` | Creates user with `User.objects.create_user()` |
| `/api/users/{id}/` | PATCH | `{ name?, role? }` | `User` | Updates user fields |
| `/api/users/{id}/deactivate/` | POST | — | `User` | Sets `is_active=False`, unassigns ASSIGNED jobs |
| `/api/users/{id}/activate/` | POST | — | `User` | Sets `is_active=True` |

### Backend Logic (DRF ViewSet)
1. **createUser**: Validates email uniqueness → calls `User.objects.create_user()` with `role` → sends temporary password email → returns user
2. **updateUser**: Updates User model fields (role, name) directly in Django ORM
3. **deactivateUser**: Sets `User.is_active = False` → unassigns any ASSIGNED (not IN_PROGRESS) jobs
4. **activateUser**: Sets `User.is_active = True`

## Validation Rules

- Email must be valid format and unique across all users (active or inactive)
- Name is required, 1–100 characters
- Role must be one of: ADMIN, ANNOTATOR, QA
- Cannot deactivate your own account
- Cannot change the role of the last remaining ADMIN
