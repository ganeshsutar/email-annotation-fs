> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Authentication Module

## Purpose & Scope

Handles user authentication, session management, and role-based access control (RBAC) for the platform. All users authenticate via Django's built-in authentication system. Each user is assigned one of three roles — ADMIN, ANNOTATOR, or QA — stored as a field on the custom User model. The module enforces route-level guards so users can only access pages appropriate to their role.

## Related Requirements

| ID | Requirement |
|----|-------------|
| NF-1 | Secure login with role-based access control |
| A-6 | User management — Admin creates users with roles |

## Components

### 1. LoginPage
- Email and password form fields
- "Sign In" submit button
- "Forgot Password?" link triggering the password reset flow
- Error display for invalid credentials, locked accounts, or network errors
- Redirects to role-appropriate dashboard on success

### 2. ForgotPasswordPage
- Email input to request a reset code
- Verification code + new password form (second step)
- Confirmation message on success, link back to login

### 3. ForceChangePasswordPage
- Shown on first login when the user's `force_password_change` flag is `True` (set during account creation)
- New password + confirm password fields
- Redirects to role-appropriate dashboard on success

### 4. AuthProvider (Context)
- Wraps the application, providing current user state to all components
- Exposes: `user`, `role`, `isAuthenticated`, `isLoading`, `login()`, `logout()`, `changePassword()`
- Persists session using Django session cookie managed by the browser
- Session validity checked via `GET /api/auth/me/` on app mount

### 5. ProtectedRoute
- Higher-order component / wrapper for route definitions
- Props: `allowedRoles: Role[]`
- Checks `isAuthenticated` — redirects to `/login` if false
- Checks `role` against `allowedRoles` — redirects to `/unauthorized` if not permitted
- Shows loading spinner while auth state is being resolved

### 6. UnauthorizedPage
- Displayed when a user tries to access a route outside their role permissions
- Shows message and link back to their own dashboard

## Data Flow

```
User enters credentials
        │
        ▼
LoginPage calls AuthProvider.login(email, password)
        │
        ▼
POST /api/auth/login/ → Django authenticates credentials
        │
        ├─ Success → Django returns user data { id, email, name, role, force_password_change }
        │              │
        │              ▼
        │         AuthProvider reads role from response
        │              │
        │              ▼
        │         Sets user state: { id, email, name, role }
        │              │
        │              ▼
        │         Redirect to role-based dashboard:
        │           ADMIN      → /admin/dashboard
        │           ANNOTATOR  → /annotator/dashboard
        │           QA         → /qa/dashboard
        │
        ├─ force_password_change: true → Redirect to /change-password
        │
        └─ Error → Display error message on LoginPage
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| LoginPage | AuthProvider | `login(email, password)` |
| AuthProvider | Django REST API | `POST /api/auth/login/`, `GET /api/auth/me/`, `POST /api/auth/logout/` |
| ProtectedRoute | AuthProvider | Reads `isAuthenticated`, `role` |
| App Router | ProtectedRoute | Wraps each route with role requirements |
| Any Component | AuthProvider | Reads `user` for display (name, role) |
| ForceChangePasswordPage | AuthProvider | `changePassword(newPassword)` via `POST /api/auth/change-password/` |

## State Management

### Auth Context State
```typescript
interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'ANNOTATOR' | 'QA';
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;       // true while checking stored session on app load
}
```

### Storage
- Django session cookie managed by the browser (HttpOnly, Secure)
- No custom token storage needed — Django handles session lifecycle
- On app mount, AuthProvider calls `GET /api/auth/me/` to restore state from the session

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | When | Notes |
|----------|--------|------|-------|
| `/api/auth/login/` | POST | Login form submit | Accepts `{ email, password }`, returns user data + sets session cookie |
| `/api/auth/logout/` | POST | User clicks "Sign Out" | Clears Django session, resets client state |
| `/api/auth/me/` | GET | App mount / session check | Returns current user data or 401 if not authenticated |
| `/api/auth/change-password/` | POST | First login password change | Accepts `{ new_password }`, clears `force_password_change` flag |
| `/api/auth/forgot-password/` | POST | Forgot password request | Accepts `{ email }`, sends reset email with token |
| `/api/auth/reset-password/` | POST | Reset password submit | Accepts `{ token, new_password }`, completes the reset flow |

### User Role Field
- `role` — field on the custom User model, set during account creation by the Admin (see User Management module)
- Values: `ADMIN`, `ANNOTATOR`, `QA`
- Read from the user data returned by the login and session endpoints

### Route Guard Configuration
```
/login                          → Public (redirect to dashboard if already authenticated)
/change-password                → Public (only during force_password_change flow)
/forgot-password                → Public
/admin/*                        → ADMIN only
/annotator/*                    → ANNOTATOR only
/qa/*                           → QA only
```

## Security Considerations

- Passwords follow Django's password validators (configured in Django settings)
- Sessions are managed server-side with configurable expiry
- Logout invalidates the server-side session and clears the session cookie
- No role information is trusted from the client — backend views validate the user's `role` field from the database independently
- API requests include the session cookie automatically, validated by Django's session middleware
