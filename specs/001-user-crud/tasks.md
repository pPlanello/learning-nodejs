# Implementation Tasks: User CRUD Operations

**Feature**: `001-user-crud` | **Date**: February 18, 2026  
**Status**: Ready for Implementation | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Implementation Strategy

**Approach**: Test-First Hexagonal Architecture (Domain → Application → Infrastructure)  
**Task Sequence**: Setup → Foundational → Domain → User Stories (sequential) → Polish  
**Parallelization**: Where noted [P], tasks can run in parallel on independent files  
**MVP Scope**: US1+US2+US3 complete all read/write operations; US4+US5 deferrable for Phase 2

**Dependency Graph**:
```
Setup (T001-T003)
    ↓
Foundational (T004-T007) [Database, Config, Middleware]
    ↓
Domain Layer (T008-T018) [Entity, Value Objects, Exceptions]
    ↓
Application Layer (T019-T029) [Use Cases, DTOs] 
    ↓
US1 (T030-T040) Create User
    ↓
US2 (T041-T047) Get User
    ↓
US3 (T048-T062) Get All Users
    ↓
US4 (T063-T073) Update User (or can be deferred)
    ↓
US5 (T074-T082) Delete User (or can be deferred)
    ↓
Polish (T083-T090) [Testing, Documentation, Cleanup]
```

**Estimated Effort**:
- Setup & Foundational: 3-4 hours
- Domain Layer: 4-6 hours
- US1 (Create User): 6-8 hours
- US2 (Get User): 3-4 hours
- US3 (Get All Users): 5-6 hours
- US4 (Update User): 4-5 hours
- US5 (Delete User): 3-4 hours
- Polish: 4-5 hours
- **Total**: 32-42 hours (1-2 weeks at 20 hours/week)

---

## Phase 1: Project Setup

- [x] T001 Create directory structure per plan for src/Domain, src/Application, src/Infrastructure, tests/
- [x] T002 [P] Install dependencies: typeorm, pino, pino-http, class-validator, reflect-metadata
- [x] T003 Create .env file with DATABASE_URL, NODE_ENV, LOG_LEVEL, PORT

---

## Phase 2: Foundational Infrastructure

- [x] T004 Create PostgreSQL schema and `users` table with migration/seeds in src/Infrastructure/Persistence/
- [x] T005 [P] Configure TypeORM connection in src/Infrastructure/Config/database.config.ts
- [x] T006 [P] Setup Pino logger with traceId support in src/Infrastructure/Config/logger.config.ts
- [x] T007 Create Express app initialization in src/Infrastructure/Primary/server.ts with error middleware

---

## Phase 3: Domain Layer (Foundation for All User Stories)

### Value Objects (Type-Safe Business Concepts)

- [x] T008 [P] Create UserId value object in src/Domain/User/ValueObjects/user-id.value-object.ts with UUID validation
- [x] T009 [P] Create Email value object in src/Domain/User/ValueObjects/email.value-object.ts with format and length validation
- [x] T010 [P] Create HashedPassword value object in src/Domain/User/ValueObjects/hashed-password.value-object.ts with bcrypt hashing
- [x] T011 [P] Create InvalidEmailFormatException in src/Domain/User/ValueObjects/email.value-object.ts
- [x] T012 [P] Create WeakPasswordException in src/Domain/User/ValueObjects/hashed-password.value-object.ts

### Domain Exceptions

- [x] T013 [P] Create UserNotFoundException in src/Domain/User/user.exceptions.ts
- [x] T014 [P] Create DuplicateEmailException in src/Domain/User/user.exceptions.ts
- [x] T015 [P] Create InvalidUserIdException in src/Domain/User/user.exceptions.ts
- [x] T016 [P] Create InvalidUserStatusException in src/Domain/User/user.exceptions.ts

### Domain Entity & Ports

- [x] T017 Create User aggregate root entity in src/Domain/User/user.entity.ts with all properties and methods (isActive, updateProfile, updateEmail, delete)
- [x] T018 Create IUserRepository port interface in src/Domain/User/Ports/user.repository.port.ts with CRUD method signatures
- [x] T019 [P] Create ILogger port interface in src/Domain/Common/logger.port.ts

### Domain Layer Tests

- [x] T020 [P] Write unit tests for UserId value object in tests/unit/domain/user/value-objects/user-id.value-object.spec.ts (100% coverage)
- [x] T021 [P] Write unit tests for Email value object in tests/unit/domain/user/value-objects/email.value-object.spec.ts (100% coverage)
- [x] T022 [P] Write unit tests for HashedPassword value object in tests/unit/domain/user/value-objects/hashed-password.value-object.spec.ts (100% coverage)
- [x] T023 Write unit tests for User entity in tests/unit/domain/user/user.entity.spec.ts (100% coverage, all state transitions)

---

## Phase 4: Application Layer (Use Cases Foundation)

### DTOs

- [x] T024 [P] Create UserResponseDTO in src/Application/User/DTOs/user.response.dto.ts with mapUserToDTO function
- [x] T025 [P] Create CreateUserRequest interface in src/Application/User/DTOs/create-user.dto.ts
- [x] T026 [P] Create UpdateUserRequest interface in src/Application/User/DTOs/update-user.dto.ts
- [x] T027 [P] Create GetAllUsersQuery interface in src/Application/User/DTOs/get-all-users.dto.ts

### Use Cases

- [x] T028 Create CreateUserUseCase in src/Application/User/UseCases/create-user.use-case.ts with email/password validation
- [x] T029 Create GetUserUseCase in src/Application/User/UseCases/get-user.use-case.ts
- [x] T030 Create GetAllUsersUseCase in src/Application/User/UseCases/get-all-users.use-case.ts with pagination
- [x] T031 Create UpdateUserUseCase in src/Application/User/UseCases/update-user.use-case.ts
- [x] T032 Create DeleteUserUseCase in src/Application/User/UseCases/delete-user.use-case.ts

### Application Layer Tests

- [x] T033 [P] Write unit tests for CreateUserUseCase in tests/unit/application/user/create-user.use-case.spec.ts (100% coverage)
- [x] T034 [P] Write unit tests for GetUserUseCase in tests/unit/application/user/get-user.use-case.spec.ts (100% coverage)
- [x] T035 [P] Write unit tests for GetAllUsersUseCase in tests/unit/application/user/get-all-users.use-case.spec.ts (100% coverage)
- [x] T036 [P] Write unit tests for UpdateUserUseCase in tests/unit/application/user/update-user.use-case.spec.ts (100% coverage)
- [x] T037 [P] Write unit tests for DeleteUserUseCase in tests/unit/application/user/delete-user.use-case.spec.ts (100% coverage)

---

## Phase 5: Infrastructure Layer (Repository & Adapters)

### Database Adapter

- [x] T038 Create UserDatabaseEntity TypeORM entity in src/Infrastructure/Persistence/entities/user.database-entity.ts
- [x] T039 Create TypeORMUserRepository implementation in src/Infrastructure/Secondary/repositories/typeorm-user.repository.ts
- [x] T040 [P] Write integration tests for TypeORMUserRepository in tests/integration/repositories/typeorm-user.repository.spec.ts

### HTTP Infrastructure

- [x] T041 [P] Create error-handler middleware in src/Infrastructure/Primary/middleware/error-handler.middleware.ts (map domain exceptions to HTTP)
- [x] T042 [P] Create trace-id middleware in src/Infrastructure/Primary/middleware/trace-id.middleware.ts
- [x] T043 [P] Create request-logger middleware in src/Infrastructure/Primary/middleware/request-logger.middleware.ts with Pino integration

### Pino Adapter

- [x] T044 Create PinoLoggerAdapter in src/Infrastructure/Adapters/pino-logger.adapter.ts implementing ILogger port

---

## Phase 6: User Story 1 - Create New User (Priority P1)

### Feature Definition

- [x] T045 [US1] Write Gherkin feature for create user in tests/acceptance/features/user-crud.feature (all 4 acceptance scenarios)
- [x] T046 [US1] Implement step definitions for create user in tests/acceptance/step-definitions/user-crud.steps.ts using Supertest

### Controllers & Routing

- [x] T047 [US1] Create CreateUserController in src/Infrastructure/Primary/controllers/user/user.controllers.ts with OpenAPI JSDoc
- [x] T048 [US1] Create user routes in src/Infrastructure/Primary/routes/user/user.routes.ts (POST /users)
- [x] T049 [US1] [P] Write acceptance test execution for create user scenario (Cucumber step with HTTP assertions)

### Validation & Error Handling

- [x] T050 [US1] [P] Create input validation DTO for CreateUserRequest with class-validator decorators in src/Application/User/DTOs/

### Integration & Testing

- [x] T051 [US1] Run acceptance tests for create user (Gherkin scenarios should pass)
- [x] T052 [US1] Verify 100% unit test coverage for CreateUserUseCase
- [x] T053 [US1] Manual HTTP test: curl POST /users with valid data, verify 201 + user ID in response

---

## Phase 7: User Story 2 - Retrieve Single User (Priority P1)

### Feature Definition

- [x] T054 [US2] Write Gherkin feature for get user in tests/acceptance/features/user-crud.feature (all 4 acceptance scenarios)
- [x] T055 [US2] Implement step definitions for get user in tests/acceptance/step-definitions/user-crud.steps.ts

### Controllers & Routing

- [x] T056 [US2] Create GetUserController in src/Infrastructure/Primary/controllers/user/user.controllers.ts with OpenAPI JSDoc
- [x] T057 [US2] Add GET /users/{id} route in src/Infrastructure/Primary/routes/user/user.routes.ts
- [x] T058 [US2] [P] Write acceptance test execution for get user scenario

### Testing

- [x] T059 [US2] Run acceptance tests for get user (all scenarios should pass)
- [x] T060 [US2] Verify 100% unit test coverage for GetUserUseCase
- [x] T061 [US2] Verify 404 response for non-existent user via manual HTTP test
- [x] T062 [US2] Verify no password_hash in response schema

---

## Phase 8: User Story 3 - List All Users with Pagination (Priority P1)

### Feature Definition

- [x] T063 [US3] Write Gherkin feature for get all users in tests/acceptance/features/user-crud.feature (all 4 acceptance scenarios with pagination)
- [x] T064 [US3] Implement step definitions for get all users in tests/acceptance/step-definitions/user-crud.steps.ts

### Controllers & Routing

- [x] T065 [US3] Create GetAllUsersController in src/Infrastructure/Primary/controllers/user/user.controllers.ts with pagination parameters
- [x] T066 [US3] Add GET /users route with query parameters (page, limit, sort, filter) in src/Infrastructure/Primary/routes/user/user.routes.ts
- [x] T067 [US3] [P] Write acceptance test execution for get all users scenario with pagination

### Validation & Query Building

- [x] T068 [US3] Implement pagination logic in GetAllUsersUseCase (calculate offset, validate limits)
- [x] T069 [US3] [P] Implement filter/sort logic in repository query builder (deleted_at IS NULL, status, createdAt range)

### Testing

- [x] T070 [US3] Run acceptance tests for get all users (pagination metadata correct, filtering works)
- [x] T071 [US3] Verify 100% unit test coverage for GetAllUsersUseCase
- [x] T072 [US3] Manual HTTP test: curl GET /users?page=1&limit=10, verify pagination metadata (total, page, limit, totalPages)
- [x] T073 [US3] Manual HTTP test: Verify soft-deleted users excluded from list (deleted_at IS NULL filter)

---

## Phase 9: User Story 4 - Update Existing User (Priority P2)

### Feature Definition

- [x] T074 [US4] Write Gherkin feature for update user in tests/acceptance/features/user-crud.feature (all 4 acceptance scenarios)
- [x] T075 [US4] Implement step definitions for update user in tests/acceptance/step-definitions/user-crud.steps.ts

### Controllers & Routing

- [x] T076 [US4] Create UpdateUserController in src/Infrastructure/Primary/controllers/user/user.controllers.ts
- [x] T077 [US4] Add PATCH /users/{id} route in src/Infrastructure/Primary/routes/user/user.routes.ts
- [x] T078 [US4] [P] Write acceptance test execution for update user scenario

### Validation & Domain Operations

- [x] T079 [US4] Implement email uniqueness re-check in UpdateUserUseCase when email field changes
- [x] T080 [US4] [P] Implement partial update logic (only update provided fields)

### Testing

- [x] T081 [US4] Run acceptance tests for update user (email uniqueness validated, updatedAt timestamp changes)
- [x] T082 [US4] Verify 100% unit test coverage for UpdateUserUseCase
- [x] T083 [US4] Manual HTTP test: PATCH /users/{id} with updated name, verify response includes updatedAt

---

## Phase 10: User Story 5 - Delete User (Priority P3)

### Feature Definition

- [x] T084 [US5] Write Gherkin feature for delete user in tests/acceptance/features/user-crud.feature (all 4 acceptance scenarios)
- [x] T085 [US5] Implement step definitions for delete user in tests/acceptance/step-definitions/user-crud.steps.ts

### Controllers & Routing

- [x] T086 [US5] Create DeleteUserController in src/Infrastructure/Primary/controllers/user/user.controllers.ts
- [x] T087 [US5] Add DELETE /users/{id} route in src/Infrastructure/Primary/routes/user/user.routes.ts
- [x] T088 [US5] [P] Write acceptance test execution for delete user scenario

### Testing

- [x] T089 [US5] Run acceptance tests for delete user (soft-delete verified, user not returned in GET after delete)
- [x] T090 [US5] Verify 100% unit test coverage for DeleteUserUseCase
- [x] T091 [US5] Manual HTTP test: DELETE /users/{id} returns 204, subsequent GET returns 404

---

## Phase 11: Polish & Cross-Cutting Concerns

### Documentation

- [x] T092 Generate OpenAPI specification from JSDoc comments in all controllers via swagger-jsdoc
- [x] T093 Setup Swagger UI endpoint at /api-docs serving generated OpenAPI spec
- [x] T094 Create API_DOCUMENTATION.md with curl examples for all 5 operations

### Testing Coverage & Quality

- [x] T095 Run full test suite: `pnpm run test` (unit + e2e) → verify all pass
- [x] T096 Verify unit test coverage ≥95% for src/Domain/ and src/Application/ via Jest coverage report
- [x] T097 Run ESLint: `pnpm run lint` → verify no violations
- [x] T098 Run Prettier: `pnpm run format:check` → verify code formatting

### Logging & Monitoring

- [x] T099 Verify Pino logs include traceId in all HTTP requests (check server logs)
- [x] T100 Add debug logging to all use case execute() methods (entry/exit with parameters)
- [x] T101 Verify error responses never include stack traces (check ErrorResponse schema)

### Architecture Verification

- [x] T102 Code review: Verify no infrastructure imports in src/Domain/ or src/Application/
- [x] T103 Code review: Verify all domain exceptions properly mapped to HTTP status codes
- [x] T104 Code review: Verify all DTOs properly strip password/password_hash from responses

### Database & Performance

- [x] T105 Verify database indexes on email, deleted_at, created_at for query performance
- [x] T106 Manual load test: Send 100 concurrent POST /users requests, verify <500ms p95 response time
- [x] T107 [P] Run docker-compose integration tests with real PostgreSQL (verify persistence, transactions)

### Final Verification & Deployment Prep

- [x] T108 Create .gitlab-ci.yml or GitHub Actions workflow to run all tests on commit
- [x] T109 Document deployment procedure in DEPLOYMENT.md
- [x] T110 Create .dockerignore and Dockerfile for containerization
- [x] T111 Final end-to-end walkthrough: Create user → Get user → List users → Update user → Delete user → Verify all operations work correctly

---

## Testing Breakdown by Layer

### Unit Tests (Domain + Application) - 100% Coverage Required

```
Domain Layer Tests (T020-T023):
  ✓ UserId value object validation (UUID format, equality)
  ✓ Email value object validation (format, length, uniqueness logic)
  ✓ HashedPassword value object (strength validation, bcrypt, comparison)
  ✓ User entity lifecycle (create, update, delete state transitions)

Application Layer Tests (T033-T037):
  ✓ CreateUserUseCase (validation flow, exception handling, repository calls)
  ✓ GetUserUseCase (retrieval, 404 handling, deleted user filtering)
  ✓ GetAllUsersUseCase (pagination logic, filtering, sorting)
  ✓ UpdateUserUseCase (partial updates, email uniqueness re-check)
  ✓ DeleteUserUseCase (soft-delete, verification)
```

### Integration Tests

```
Infrastructure Layer Tests (T040):
  ✓ TypeORMUserRepository (create, read, update, delete with real DB)
  ✓ Database schema integrity (constraints, indexes)
  ✓ Soft-delete filtering (deleted users not returned)
  ✓ Unique email constraint enforcement
```

### Acceptance Tests (BDD) - All Scenarios

```
Feature: User CRUD Operations
  Scenario: Create New User (T045-T053)
    ✓ Create with valid data → 201 + ID
    ✓ Duplicate email → 409 Conflict
    ✓ Missing fields → 400 Bad Request
    ✓ Weak password → 400 Bad Request

  Scenario: Get User (T054-T062)
    ✓ Get existing user → 200 + full data
    ✓ Get non-existent → 404 Not Found
    ✓ Get deleted user → 404 Not Found
    ✓ No password in response

  Scenario: List Users (T063-T073)
    ✓ Get page 1, limit 10 → returns data + pagination metadata
    ✓ Filter by status → returns matching users only
    ✓ Deleted users excluded → only active in response
    ✓ Large dataset (10k+ users) → pagination works efficiently

  Scenario: Update User (T074-T083)
    ✓ Update name → success + updatedAt changes
    ✓ Update email (unique) → success + validation
    ✓ Update email (duplicate) → 409 Conflict
    ✓ Invalid data → 400 Bad Request

  Scenario: Delete User (T084-T091)
    ✓ Delete existing user → 204 No Content
    ✓ Subsequent GET → 404 Not Found
    ✓ User in list before, not after delete
    ✓ Delete non-existent → 404 Not Found
```

---

## Dependencies & Parallelization Matrix

### Can Run in Parallel (Independent Files)

| Group | Tasks | Rationale |
|-------|-------|-----------|
| Value Objects | T008-T012 | No dependencies between them |
| Domain Exceptions | T013-T016 | No dependencies between them |
| VO Tests | T020-T022 | No dependencies between them |
| DTOs | T024-T027 | No dependencies between them |
| Use Cases | T028-T032 | Can write stubs for repository, then implement after repo exists |
| Domain Tests | T033-T037 | Mock repository, independent execution |
| Middleware | T041-T043 | No dependencies between them |
| Controllers | T047, T056, T065, T076, T086 | No file conflicts, use different endpoints |
| Integration Tests | T040, T107 | Use separate test database instances |

### Must Run Sequentially (Dependencies)

| Sequence | Reason |
|----------|--------|
| T004 → T005 | Database must exist before TypeORM connection config |
| T018 → T028-T032 | Port interface must exist before use cases use it |
| T024-T027 → T047, T056, T065 | DTOs used by controllers |
| T039 → T040 | Repository implementation before integration tests |
| T041 → T049, T058, T070 | Error middleware needed for acceptance tests |

---

## Success Acceptance Criteria (Definition of Done)

### All Acceptance Scenarios Passing

- [x] **US1 Tests**: `pnpm run test:e2e -- tests/acceptance/features/user-crud.feature --name "Create"` → All 4 scenarios pass
- [x] **US2 Tests**: `pnpm run test:e2e -- tests/acceptance/features/user-crud.feature --name "Retrieve Single"` → All 4 scenarios pass
- [x] **US3 Tests**: `pnpm run test:e2e -- tests/acceptance/features/user-crud.feature --name "List All"` → All 4 scenarios pass
- [x] **US4 Tests**: `pnpm run test:e2e -- tests/acceptance/features/user-crud.feature --name "Update"` → All 4 scenarios pass
- [x] **US5 Tests**: `pnpm run test:e2e -- tests/acceptance/features/user-crud.feature --name "Delete"` → All 4 scenarios pass

### Unit Test Coverage

- [x] Domain layer ≥100% coverage (all value objects, entity, exceptions)
- [x] Application layer ≥100% coverage (all use cases)
- [x] Infrastructure layer ≥90% coverage (controllers, repository, middleware)
- [x] Command: `pnpm run test:unit -- --coverage` passes threshold

### Code Quality

- [x] ESLint: `pnpm run lint` → No errors or violations
- [x] Prettier: `pnpm run format:check` → All files formatted
- [x] TypeScript: `tsc --noEmit` → No compilation errors
- [x] No console.log statements (use Pino logger exclusively)

### Architecture Compliance

- [x] ✅ Domain layer has zero external dependencies (only types)
- [x] ✅ Application layer depends only on domain & ports (no infrastructure)
- [x] ✅ All domain exceptions caught and mapped to HTTP status codes
- [x] ✅ No password/password_hash exposed in API responses
- [x] ✅ All operations logged with traceId in Pino

### Performance & Scalability

- [x] Load test: 100 concurrent requests → p95 response time <500ms
- [x] Pagination: Query 10,000+ users → <200ms response time
- [x] Database indexes: Created on email, deleted_at, created_at
- [x] Connection pooling: Configured for concurrent connections

### Documentation

- [x] OpenAPI/Swagger spec generated and served at /api-docs
- [x] All controllers have JSDoc comments with request/response examples
- [x] API_DOCUMENTATION.md with curl examples for all 5 operations
- [x] README.md updated with setup/run/test instructions

---

## Manual Testing Checklist (Before Merge)

### Happy Path (All Operations Succeed)

```bash
# 1. Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'
# ✓ Expect: 201 Conflict + user ID

# 2. Get user
curl -X GET http://localhost:3000/api/v1/users/{id}
# ✓ Expect: 200 OK + user data (no password_hash)

# 3. Get all users
curl -X GET http://localhost:3000/api/v1/users?page=1&limit=10
# ✓ Expect: 200 OK + data array + pagination metadata

# 4. Update user
curl -X PATCH http://localhost:3000/api/v1/users/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe"}'
# ✓ Expect: 200 OK + updated user

# 5. Delete user
curl -X DELETE http://localhost:3000/api/v1/users/{id}
# ✓ Expect: 204 No Content

# 6. Verify deletion
curl -X GET http://localhost:3000/api/v1/users/{id}
# ✓ Expect: 404 Not Found
```

### Error Cases

```bash
# Duplicate email
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"john@example.com","password":"SecurePass123!"}'
# ✓ Expect: 409 Conflict + DuplicateEmail error

# Invalid email format
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"invalid-email","password":"SecurePass123!"}'
# ✓ Expect: 400 Bad Request + InvalidEmailFormat error

# Weak password
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john2@example.com","password":"weak"}'
# ✓ Expect: 400 Bad Request + WeakPassword error

# Missing required field
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john3@example.com"}'
# ✓ Expect: 400 Bad Request + Missing password field error
```

---

## Documentation Links

- **Specification**: [spec.md](./spec.md) - User stories, requirements, success criteria
- **Implementation Plan**: [plan.md](./plan.md) - Architecture, project structure, technical decisions
- **Research & Decisions**: [research.md](./research.md) - Technical justifications, alternatives considered
- **Data Model**: [data-model.md](./data-model.md) - Domain entities, value objects, database schema
- **Quick Start Guide**: [quickstart.md](./quickstart.md) - Code examples and implementation walkthrough
- **API Contracts**: [contracts/user-api.openapi.yaml](./contracts/user-api.openapi.yaml) - OpenAPI 3.0 specification
- **DTOs**: [contracts/user.dto.ts](./contracts/user.dto.ts) - TypeScript interfaces for request/response

---

## Task Tracking Commands

```bash
# Count total tasks
grep -c "^- \[ \]" specs/001-user-crud/tasks.md

# Count completed tasks
grep -c "^- \[x\]" specs/001-user-crud/tasks.md

# Filter by phase
grep "^## Phase" specs/001-user-crud/tasks.md

# Filter by user story
grep "\[US1\]" specs/001-user-crud/tasks.md
grep "\[US2\]" specs/001-user-crud/tasks.md
grep "\[US3\]" specs/001-user-crud/tasks.md
grep "\[US4\]" specs/001-user-crud/tasks.md
grep "\[US5\]" specs/001-user-crud/tasks.md

# Filter parallelizable tasks
grep "\[P\]" specs/001-user-crud/tasks.md

# Run tests
pnpm run test                  # All tests
pnpm run test:unit            # Unit tests only
pnpm run test:e2e             # Acceptance tests only
pnpm run test:unit -- --coverage  # With coverage report
```

---

**Generated**: February 18, 2026  
**Feature Branch**: `001-user-crud`  
**Status**: Ready for Implementation  
**Total Tasks**: 110 (with parallelization opportunities for ~25% time savings)

