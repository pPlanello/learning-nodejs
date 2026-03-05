# Data Model: User Domain

**Phase**: 1 - Design  
**Date**: February 18, 2026  
**Status**: Complete  
**Feature**: [User CRUD Implementation Plan](./plan.md)

## Domain Entities & Value Objects

### 1. User Entity (Aggregate Root)

The User is the primary domain entity representing a system user account with core identity and lifecycle management.

```typescript
class User {
  // Properties (extracted from Aggregate)
  id: UserId
  name: string
  email: Email
  password: HashedPassword
  status: UserStatus
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null

  // Methods (business logic)
  canBeDeleted(): boolean
  updateProfile(name: string): void
  updateEmail(email: Email): void
  delete(): void
  isActive(): boolean
  isDeleted(): boolean
}
```

**Properties**:

| Field | Type | Validation | Constraints | Purpose |
|-------|------|-----------|-----------|---------|
| `id` | `UserId` (UUID) | Generated | PRIMARY KEY, UNIQUE, NOT NULL | Unique system identifier; non-sequential to prevent enumeration attacks |
| `name` | `string` | Max 255 chars; required | NOT NULL | User's full name; used for display and identification |
| `email` | `Email` (VO) | Format validation; uniqueness | UNIQUE, NOT NULL, INDEX | User's contact email; serves as secondary unique identifier |
| `password` | `HashedPassword` (VO) | Bcrypt hash; never plaintext | NOT NULL | Secure password storage; never transmitted or logged |
| `status` | `UserStatus` (enum) | One of: ACTIVE, SUSPENDED, PENDING_VERIFICATION | DEFAULT: ACTIVE | User account state for lifecycle management |
| `createdAt` | `Date` (timestamp) | ISO 8601 | NOT NULL, DEFAULT NOW | Audit trail: when user created; immutable after creation |
| `updatedAt` | `Date` (timestamp) | ISO 8601 | NOT NULL, DEFAULT NOW | Audit trail: last modification time; updated on any change |
| `deletedAt` | `Date \| null` (timestamp) | ISO 8601 or NULL | NULL = active, NOT NULL = deleted | Soft delete marker; enables data recovery and audit trail |

**Invariants** (business rules enforced at aggregate boundary):

1. **Email Uniqueness**: No two active users share the same email (checked before creation/update)
2. **Required Fields**: name, email, password always present; never null or empty strings
3. **Name Length**: Between 1-255 characters; no leading/trailing whitespace after trim
4. **Password Immutability**: Once stored as hash, cannot be accessed; only compared via bcrypt
5. **Single-Use Deletion**: Once deleted, deletion cannot be undone at entity level (can be recovered from backup only)
6. **Timestamp Invariant**: createdAt ≤ updatedAt; deletedAt ≥ updatedAt if present

**Aggregate Responsibilities**:

- Enforce invariants during construction and state changes
- Provide safe methods for modifications (no direct property access)
- Emit domain events for observers (future: e.g., UserCreatedEvent, UserDeletedEvent)
- Remain independent of infrastructure concerns (no database imports, no HTTP knowledge)

---

### 2. Value Objects (Immutable Business Concepts)

Value Objects represent concepts that are identified by their value rather than identity. They are immutable and reusable.

#### 2a. UserId (Value Object)

```typescript
class UserId {
  readonly value: string // UUID string

  constructor(value?: string) {
    if (value && !isValidUUID(value)) {
      throw new InvalidUserIdException(value)
    }
    this.value = value ?? randomUUID()
  }

  equals(other: UserId): boolean
  toString(): string
}
```

**Validation**:
- Must be valid UUID v4 format
- Throws `InvalidUserIdException` if invalid

**Purpose**:
- Type safety: prevents mixing user ID with other UUIDs
- Encapsulates ID generation logic
- Domain language: `new UserId()` creates new ID

**Invariants**:
- Immutable after construction
- Always valid UUID format
- Equality based on UUID value, not object identity

---

#### 2b. Email (Value Object)

```typescript
class Email {
  readonly value: string

  constructor(value: string) {
    const trimmed = value.trim()
    if (!this.isValidFormat(trimmed)) {
      throw new InvalidEmailFormatException(value)
    }
    this.value = trimmed.toLowerCase() // normalize to lowercase
  }

  private isValidFormat(email: string): boolean
  equals(other: Email): boolean
  toString(): string
}
```

**Validation Rules**:
- Format: Matches RFC 5322 simplified regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Length: 5-254 characters (RFC 5321 limit)
- No leading/trailing whitespace
- Case-insensitive comparison (normalized to lowercase internally)

**Exceptions Thrown**:
- `InvalidEmailFormatException`: Email format invalid or length out of bounds

**Purpose**:
- Ensures all emails used in domain are valid format
- Provides normalized comparison (case-insensitive)
- Reusable across multiple user contexts if domain expands

**Invariants**:
- Immutable after construction
- Always lowercase for consistent comparison
- Always valid format
- Equality based on lowercase value

---

#### 2c. HashedPassword (Value Object)

```typescript
class HashedPassword {
  readonly hash: string // bcrypt hash, never expose

  constructor(plaintext: string) {
    if (!this.isStrongPassword(plaintext)) {
      throw new WeakPasswordException()
    }
    this.hash = hashSync(plaintext, SALT_ROUNDS)
  }

  static fromHash(hash: string): HashedPassword
  isCorrect(plaintext: string): boolean
}
```

**Password Strength Rules**:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*)

**Exceptions Thrown**:
- `WeakPasswordException`: Password doesn't meet strength requirements

**Security Properties**:
- Password never stored/logged as plaintext
- Hash generated via bcrypt with SALT_ROUNDS=10
- `isCorrect()` method uses bcrypt.compareSync to prevent timing attacks
- Immutable: hash cannot be changed after creation

**Purpose**:
- Enforces password security standards
- Encapsulates bcrypt hashing logic
- Prevents accidental plaintext password exposure

**Invariants**:
- Plaintext password never accessible after construction
- Hash always valid bcrypt format
- Comparison via secure bcrypt (not string equality)

---

#### 2d. UserStatus (Value Object / Enum)

```typescript
enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

class UserStatusVO {
  readonly status: UserStatus

  constructor(status: UserStatus) {
    if (!Object.values(UserStatus).includes(status)) {
      throw new InvalidUserStatusException(status)
    }
    this.status = status
  }

  isActive(): boolean
  isSuspended(): boolean
  isPendingVerification(): boolean
}
```

**Valid States**:
- `ACTIVE`: User account operational; can authenticate and use system
- `SUSPENDED`: Account temporarily or permanently disabled; cannot authenticate
- `PENDING_VERIFICATION`: Account awaiting email verification (future enhancement)

**Purpose**:
- Type-safe status representation
- Validation of allowed transitions
- Clear domain language

**Note**: Current MVP only uses ACTIVE and soft-delete. Other statuses reserved for future phases.

---

### 3. Domain Exceptions

Domain exceptions represent business rule violations that should be handled at application layer.

```typescript
// Base domain exception
class DomainException extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

// Specific domain exceptions
class UserNotFoundException extends DomainException {
  constructor(userId: UserId) {
    super(`User with ID ${userId.toString()} not found`)
  }
}

class DuplicateEmailException extends DomainException {
  constructor(email: Email) {
    super(`User with email ${email.toString()} already exists`)
  }
}

class InvalidEmailFormatException extends DomainException {
  constructor(email: string) {
    super(`Email format invalid: ${email}`)
  }
}

class WeakPasswordException extends DomainException {
  constructor() {
    super(`Password must be at least 8 characters with uppercase, lowercase, digit, and special character`)
  }
}

class InvalidUserIdException extends DomainException {
  constructor(id: string) {
    super(`Invalid user ID format: ${id}`)
  }
}

class InvalidUserStatusException extends DomainException {
  constructor(status: string) {
    super(`Invalid user status: ${status}`)
  }
}
```

**Purpose**:
- Document all business rule violations possible in domain
- Enable type-safe exception handling in application layer
- Provide clear error messages for mapping to HTTP responses

**Mapping to HTTP Status Codes** (see contracts for details):
| Exception | HTTP Status | Reason |
|-----------|------------|--------|
| `UserNotFoundException` | 404 Not Found | Requested resource doesn't exist |
| `DuplicateEmailException` | 409 Conflict | Resource cannot be created due to constraint |
| `InvalidEmailFormatException` | 400 Bad Request | Client provided invalid input |
| `WeakPasswordException` | 400 Bad Request | Client provided invalid input |
| `InvalidUserIdException` | 400 Bad Request | Client provided invalid input |

---

## Entity Lifecycle & State Transitions

### User State Machine

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [CREATED]  → ACTIVE → [UPDATED] → ACTIVE      │
│      ↓                    ↓                      │
│      │              [DELETED] → DELETED (soft)  │
│      │                    ↓                      │
│      └────────────────────┘                      │
│           (soft-delete)                          │
└─────────────────────────────────────────────────┘
```

**States**:

1. **CREATED**: Immediately becomes ACTIVE (except future: PENDING_VERIFICATION for email verification)
2. **ACTIVE**: Normal operating state; accessible via retrieve operations
3. **DELETED (soft)**: deletedAt timestamp set; filtered out from normal queries; remains in database

**Transitions**:

- **Create**: New User → ACTIVE (immediate)
- **Update**: ACTIVE User → ACTIVE (updates updatedAt timestamp)
- **Delete**: ACTIVE User → DELETED (sets deletedAt, remains in database)
- **No Recovery**: DELETED → ACTIVE (not supported; soft-delete is one-way at application level)

**Invariants During Transitions**:

- Creation: All properties validated, email uniqueness verified
- Update: Email uniqueness re-checked if email changed
- Delete: Only ACTIVE users can be deleted

---

## Database Schema (SQL)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT status_valid CHECK (status IN ('active', 'suspended', 'pending_verification')),
  INDEX idx_email (email),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_status (status)
);

-- Index for GetAllUsers with deleted_at filtering
CREATE INDEX idx_users_active ON users(created_at DESC) WHERE deleted_at IS NULL;

-- Trigger to update updated_at on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Schema Decisions**:

- **id (UUID)**: Globally unique identifier; no sequential prediction
- **email (UNIQUE)**: Database-level uniqueness constraint; prevents race conditions
- **password_hash (VARCHAR 255)**: Bcrypt hash always exactly 60 characters
- **status (VARCHAR 50 NOT NULL)**: Normalized status value; CHECK constraint validates values
- **created_at (TIMESTAMP NOT NULL)**: Immutable; audit trail
- **updated_at (TIMESTAMP NOT NULL)**: Auto-updated by trigger on any UPDATE
- **deleted_at (TIMESTAMP NULL)**: NULL = active; NOT NULL = deleted; enables soft delete
- **Indexes**: 
  - `idx_email`: Fast email uniqueness lookups
  - `idx_deleted_at`: Fast filtering for active users
  - `idx_users_active`: Optimized for GetAllUsers query with deleted_at filtering
  - `idx_status`: Fast status filtering (future when status transitions used)

---

## Validation Rules Summary

### Input Validation (At Domain Layer Entry)

| Field | Rule | Violation Exception |
|-------|------|-------------------|
| `name` | 1-255 chars, required | `InvalidNameException` |
| `email` | Valid RFC 5322 format, 5-254 chars | `InvalidEmailFormatException` |
| `email` | Unique across active users | `DuplicateEmailException` |
| `password` | Min 8 chars, uppercase, lowercase, digit, special | `WeakPasswordException` |
| `id` (on retrieval) | Valid UUID format | `InvalidUserIdException` |
| `status` | One of: ACTIVE, SUSPENDED, PENDING_VERIFICATION | `InvalidUserStatusException` |

### Output (Never Expose):

- ❌ Never return plaintext password
- ❌ Never return password hash
- ❌ Never return internal exception details in API
- ✅ Return only JSON schema fields: id, name, email, status, createdAt, updatedAt, deletedAt

---

## Use Case Data Requirements

Each use case defines its input/output contracts independent of infrastructure:

### CreateUserUseCase

**Input**:
```typescript
{
  name: string
  email: string
  password: string
}
```

**Output**:
```typescript
{
  id: string (UUID)
  name: string
  email: string
  status: 'active'
  createdAt: Date
  updatedAt: Date
  deletedAt: null
}
```

**Domain Operations**:
1. Validate email format → throw InvalidEmailFormatException
2. Validate password strength → throw WeakPasswordException
3. Check email uniqueness via IUserRepository → throw DuplicateEmailException
4. Create User aggregate with new UserId
5. Return aggregate (application layer converts to DTO for HTTP)

### GetUserUseCase

**Input**:
```typescript
{ id: string (UUID) }
```

**Output**:
```typescript
// Same schema as CreateUserUseCase output
```

**Domain Operations**:
1. Validate ID format → throw InvalidUserIdException
2. Retrieve from IUserRepository → throw UserNotFoundException
3. Verify not deleted (deletedAt == null)

### GetAllUsersUseCase

**Input**:
```typescript
{
  page: number (default 1)
  limit: number (default 10, max 100)
  filter?: { status?: string, createdAfter?: Date }
  sort?: { field: string, direction: 'asc' | 'desc' }
}
```

**Output**:
```typescript
{
  data: [User]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

**Domain Operations**:
1. Calculate offset from page/limit
2. Query repository with filters (including deleted_at IS NULL)
3. Return paginated result set

### UpdateUserUseCase

**Input**:
```typescript
{
  id: string (UUID)
  name?: string
  email?: string
  status?: string
}
```

**Output**:
```typescript
// Same schema as CreateUserUseCase output (updated values)
```

**Domain Operations**:
1. Retrieve user → throw UserNotFoundException
2. Verify not deleted
3. Validate new email format if changing → throw InvalidEmailFormatException
4. Check new email uniqueness if changing → throw DuplicateEmailException
5. Apply updates to aggregate
6. Persist via IUserRepository

### DeleteUserUseCase

**Input**:
```typescript
{ id: string (UUID) }
```

**Output**:
```typescript
// void or { success: true }
```

**Domain Operations**:
1. Retrieve user → throw UserNotFoundException
2. Verify not already deleted
3. Call user.delete() to set deleted_at
4. Persist via IUserRepository

---

## Relationships & Dependencies

**User Aggregate Dependencies** (internal domain):
- UserId (Value Object)
- Email (Value Object)
- HashedPassword (Value Object)
- UserStatus (Value Object)

**Use Case Dependencies**:
- User Aggregate (domain entity)
- IUserRepository Port (interface; implementation in infrastructure)
- ILogger Port (interface; implementation as Pino adapter)

**Database Entity Dependencies**:
- PostgreSQL `users` table schema

**Note**: No external service dependencies for MVP. Authentication/payment/notifications beyond scope of User CRUD.

