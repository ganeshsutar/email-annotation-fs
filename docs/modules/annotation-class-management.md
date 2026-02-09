> **Note**: This is the original design specification written before implementation. The actual implementation follows this spec closely but may differ in specific component names, API signatures, and file organization. See the source code for authoritative reference.

# Annotation Class Management Module

## Purpose & Scope

Manages the PII annotation classes (types) used across the platform. Admins can create, edit, and delete annotation classes. Each class defines a machine-readable name, display label, highlight color, and optional description. The platform ships with 11 default classes seeded on first deployment. Classes are referenced by the annotation interface, QA review, and export modules.

## Related Requirements

| ID | Requirement |
|----|-------------|
| A-3 | CRUD operations on PII annotation classes |
| Section 5 | Annotation Classes (PII Types) — class structure, default classes, tag format |

## Components

### 1. AnnotationClassListPage
- Table of all annotation classes
- Columns: Color (swatch), Display Label, Name (monospace), Description, Created By, Actions
- "Add Class" button opens AnnotationClassFormDialog
- Row actions: Edit, Delete
- Sorted alphabetically by display label

### 2. AnnotationClassFormDialog (Modal)
- Mode: Create or Edit
- Fields:
  - **Display Label** — text input (required, e.g., "Email Address")
  - **Name** — auto-generated from display label (lowercase, underscores, e.g., `email_address`); editable but validated for format. Disabled in edit mode.
  - **Color** — color picker with preset palette (required)
  - **Description** — textarea (optional, guidance for annotators)
- Auto-name generation: `display_label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')`
- In edit mode, Name is locked (changing it would break existing tags)

### 3. AnnotationClassDeleteConfirmDialog
- Shows class name and display label
- Impact check: displays count of annotations using this class across all jobs
- If annotations exist: warns that deletion will orphan those annotations, requires explicit confirmation
- If no annotations exist: simple confirmation

## Data Flow

```
Admin clicks "Add Class"
        │
        ▼
AnnotationClassFormDialog opens
        │
        ▼
Admin enters Display Label → Name auto-generates
Admin picks Color, writes Description
        │
        ▼
Submit → API: createAnnotationClass mutation
        │
        ├─ Backend validates:
        │     └─ Name is unique (case-insensitive)
        │     └─ Name matches pattern: /^[a-z][a-z0-9_]*$/
        │     └─ Display label is unique
        │
        ├─ Creates AnnotationClass record
        │
        └─ Returns new class → list refreshes
```

```
Admin clicks Delete on a class
        │
        ▼
API: checkClassUsage query → returns annotation count
        │
        ▼
AnnotationClassDeleteConfirmDialog shows impact
        │
        ▼
Admin confirms → API: deleteAnnotationClass mutation
        │
        ▼
Class marked as deleted (soft delete) or removed
```

## Key Interactions

| From | To | Interaction |
|------|----|-------------|
| AnnotationClassListPage | AnnotationClassFormDialog | Opens for create/edit |
| AnnotationClassFormDialog | API | `createAnnotationClass` / `updateAnnotationClass` |
| AnnotationClassListPage | API | `listAnnotationClasses` query |
| Annotation Interface | Annotation Classes | Fetches class list for the class selection popup |
| QA Interface | Annotation Classes | Fetches class list for modifying annotations |
| Export Module | Annotation Classes | Uses class names to build replacement tags |

## State Management

### Page State
```typescript
interface AnnotationClassListState {
  classes: AnnotationClass[];
  loading: boolean;
  dialogOpen: boolean;
  dialogMode: 'create' | 'edit';
  selectedClass: AnnotationClass | null;
  deleteDialogOpen: boolean;
  deleteTarget: AnnotationClass | null;
  deleteImpact: { annotationCount: number } | null;
}
```

### AnnotationClass Model
```typescript
interface AnnotationClass {
  id: string;
  name: string;           // machine-readable, e.g., "email"
  displayLabel: string;   // human-readable, e.g., "Email Address"
  color: string;          // hex color, e.g., "#FF6B6B"
  description: string;    // optional guidance text
  createdBy: string;      // user ID of creator
  createdAt: string;
}
```

## API / Backend Operations

### REST API Endpoints
| Endpoint | Method | Input | Output | Notes |
|----------|--------|-------|--------|-------|
| `/api/annotation-classes/` | GET | — | `AnnotationClass[]` | Returns all active classes |
| `/api/annotation-classes/{id}/usage/` | GET | — | `{ annotationCount }` | Count of annotations referencing this class |
| `/api/annotation-classes/` | POST | `{ name, displayLabel, color, description }` | `AnnotationClass` | Validates uniqueness |
| `/api/annotation-classes/{id}/` | PATCH | `{ displayLabel?, color?, description? }` | `AnnotationClass` | Name cannot be changed |
| `/api/annotation-classes/{id}/` | DELETE | — | `{ success }` | Soft-deletes; existing annotations retain their class reference |

## Default Classes (Seeded)

The following 11 classes are created during initial deployment:

| Name | Display Label | Color |
|------|--------------|-------|
| `email` | Email Address | `#FF6B6B` |
| `first_name_person` | First Name | `#4ECDC4` |
| `last_name_person` | Last Name | `#45B7D1` |
| `phone` | Phone Number | `#96CEB4` |
| `address` | Street Address | `#FFEAA7` |
| `city` | City | `#DDA0DD` |
| `state` | State | `#98D8C8` |
| `zip_code` | ZIP Code | `#F7DC6F` |
| `card_number` | Card Number | `#E74C3C` |
| `account_number` | Account Number | `#AF7AC5` |
| `full_name_person` | Full Name | `#5DADE2` |

## Validation Rules

- **Name**: Must match `/^[a-z][a-z0-9_]*$/`, max 50 characters, unique (case-insensitive)
- **Display Label**: Required, 1–100 characters, unique
- **Color**: Valid hex color code (`#RRGGBB`)
- **Description**: Optional, max 500 characters
- Name is immutable after creation (editing the name would invalidate existing annotation tags)
