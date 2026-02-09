> **Note**: This is the original UI wireframe/spec written before implementation. The final UI follows this design direction but may differ in specific layout details and interaction patterns.

# Login Screen

> **Module Reference**: [Authentication](../modules/authentication.md)

## ASCII Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                      │
│                                                                                                      │
│                                                                                                      │
│                                                                                                      │
│                                                                                                      │
│                          ┌──────────────────────────────────────────┐                                 │
│                          │                                          │                                 │
│                          │     ┌──────────────────────────────┐     │                                 │
│                          │     │    📧  Email PII Annotator   │     │                                 │
│                          │     └──────────────────────────────┘     │                                 │
│                          │                                          │                                 │
│                          │     Email                                │                                 │
│                          │     ┌──────────────────────────────┐     │                                 │
│                          │     │ user@example.com             │     │                                 │
│                          │     └──────────────────────────────┘     │                                 │
│                          │                                          │                                 │
│                          │     Password                             │                                 │
│                          │     ┌──────────────────────────────┐     │                                 │
│                          │     │ ••••••••••                   │     │                                 │
│                          │     └──────────────────────────────┘     │                                 │
│                          │                                          │                                 │
│                          │     ┌──────────────────────────────┐     │                                 │
│                          │     │         SIGN IN              │     │                                 │
│                          │     └──────────────────────────────┘     │                                 │
│                          │                                          │                                 │
│                          │         Forgot Password?                 │                                 │
│                          │                                          │                                 │
│                          │  ┌──────────────────────────────────┐    │                                 │
│                          │  │ ⚠ Invalid email or password     │    │                                 │
│                          │  └──────────────────────────────────┘    │                                 │
│                          │                                          │                                 │
│                          └──────────────────────────────────────────┘                                 │
│                                                                                                      │
│                                                                                                      │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Labels

| # | Element | Description |
|---|---------|-------------|
| 1 | App Logo / Title | "Email PII Annotator" centered at top of card |
| 2 | Email Input | Text field with placeholder "user@example.com" |
| 3 | Password Input | Password field with masked characters |
| 4 | Sign In Button | Primary button, full width, submits the form |
| 5 | Forgot Password Link | Text link below button, navigates to password reset flow |
| 6 | Error Alert | Conditionally displayed below the form when authentication fails |

## Interactive Elements

| Element | Action | Result |
|---------|--------|--------|
| Email Input | Type email address | Validates email format on blur |
| Password Input | Type password | Masked input |
| Sign In Button | Click (enabled when both fields filled) | Calls `POST /api/auth/login/` → redirect to role dashboard |
| Forgot Password Link | Click | Navigates to forgot password page |
| Enter Key | Press in either field | Submits the form (same as Sign In click) |

## Navigation Flow

```
Login Page
  │
  ├─ Successful login (ADMIN)      → /admin/dashboard
  ├─ Successful login (ANNOTATOR)  → /annotator/dashboard
  ├─ Successful login (QA)         → /qa/dashboard
  ├─ force_password_change response → /change-password
  ├─ Forgot Password click         → /forgot-password
  └─ Error                         → Stay on login, show error alert
```

## States

- **Default**: Empty form fields, Sign In button disabled
- **Filled**: Both fields have values, Sign In button enabled
- **Loading**: Spinner on Sign In button, fields disabled
- **Error**: Red error alert shown below the form
- **Force Change Password**: Redirects to change password page (separate screen)
