# Implementation Plan: User CRUD Operations

**Branch**: `001-user-crud` | **Date**: February 18, 2026 | **Spec**: [specs/001-user-crud/spec.md](../spec.md)
**Input**: Feature specification from `/specs/001-user-crud/spec.md`

**Note**: This plan implements the full CRUD system for User entities following hexagonal architecture with strict test-first approach (BDD acceptance tests + TDD unit tests).

## Summary

Complete implementation of User CRUD operations (Create, Read Single, Read All, Update, Delete) using Express RESTful API with PostgreSQL persistence. The implementation follows hexagonal architecture with clear separation between Domain (business logic), Application (use cases), and Infrastructure (adapters) layers. All operations include comprehensive validation, error handling, audit logging via Pino with traceId, and OpenAPI documentation.

## Technical Context

**Language/Version**: TypeScript 5.3 (Node.js latest)  
**Primary Dependencies**: Express 4.18.2, TypeORM (to be added for DB), Pino (to be added for logging), OpenAPI/Swagger  
**Storage**: PostgreSQL (relational database with ACID transactions)  
**Testing**: Jest (unit tests, 100% coverage required), Cucumber (BDD acceptance tests with Gherkin), Supertest (HTTP integration)  
**Target Platform**: Linux/Docker production environment  
**Project Type**: Hexagonal backend (single Node.js service)  
**Performance Goals**: 500ms p95 per operation (from spec SC-002), handle 100 concurrent CRUD requests  
**Constraints**: Sub-500ms response time, <100ms message passing between layers, graceful error handling without stack trace leaks  
**Scale/Scope**: Single User entity, 5 operations (Create, Get, GetAll with pagination, Update, Delete), 1-2 week implementation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Architectural Compliance

| Requirement | Status | Notes |
|------------|--------|-------|
| Hexagonal Architecture enforced | ✅ PASS | Domain layer will contain User entity and business rules; Application layer will contain CRUD use cases; Infrastructure will contain Express adapters and PostgreSQL repository implementation |
| Domain layer zero dependencies | ✅ PASS | User entity and value objects (Email, Password) will have no external imports except internal types |
| Application layer no infra dependencies | ✅ PASS | Use case classes will depend only on domain and interfaces (ports: IUserRepository) |
| Infrastructure layer adapter pattern | ✅ PASS | Express controllers will implement HTTP adapter; UserRepository will implement IUserRepository port |
| Architecture violations rejected | ✅ PASS | Code review will verify no infrastructure imports in domain/application layers |

### Test-First Imperative

| Requirement | Status | Notes |
|------------|--------|-------|
| BDD Gherkin features defined first | ✅ PASS | Will create `.feature` files for all 5 user stories before implementing |
| Acceptance tests cover all scenarios | ✅ PASS | E2E tests via Cucumber will validate each acceptance scenario |
| Unit tests 100% coverage (domain) | ✅ PASS | Jest configuration requires 100% coverage for domain/application layers |
| TDD cycle followed | ✅ PASS | Red-Green-Refactor: failing test → implementation → refactor |
| Integration tests for adapters | ✅ PASS | Supertest will test Express controllers; docker-compose will test database integration |

### Coding Standards & Language

| Requirement | Status | Notes |
|------------|--------|-------|
| Ubiquitous language consistency | ✅ PASS | Spec uses "User", classes named `User`, files use `user-*.ts` naming |
| File naming kebab-case | ✅ PASS | All new files will follow pattern: `create-user.use-case.ts`, `user.entity.ts` |
| Class naming PascalCase | ✅ PASS | Classes: `CreateUserUseCase`, `UserEntity`, `UserNotFoundException` |
| Function naming camelCase | ✅ PASS | Methods: `createUser()`, `getUserById()`, `deleteUser()` |
| Single Responsibility | ✅ PASS | Each use case class handles one operation; separation by layer ensures focused responsibilities |
| Error mapping to HTTP | ✅ PASS | Domain exceptions (UserNotFound, EmailAlreadyExists) → HTTP adapters (404, 409) |
| Input validation at edge | ✅ PASS | DTOs in Infrastructure layer validate incoming requests; Value Objects validate in Domain |
| No entity exposure in API | ✅ PASS | HTTP responses use DTO schemas, never expose raw domain entities |

### Security & Governance

| Requirement | Status | Notes |
|------------|--------|-------|
| No hardcoded secrets | ✅ PASS | Use dotenv-safe with validation for DB connection, API keys |
| Error stack traces not leaked | ✅ PASS | Express middleware will map internal errors to standard HTTP responses |
| Input validation comprehensive | ✅ PASS | Email format, required fields, password strength validated at DTOs and Value Objects |
| No write operations on external DB | ✅ PASS | User CRUD only writes to own PostgreSQL schema; no external system writes |

### Documentation & Tracing

| Requirement | Status | Notes |
|------------|--------|-------|
| OpenAPI/Swagger specification | ✅ PASS | Express controllers will include JSDoc comments; swagger-ui will auto-generate from controllers |
| Contract version control | ✅ PASS | API version v1 documented; semantic versioning followed for future changes |
| All operations traced with Pino | ✅ PASS | Every HTTP request gets traceId; Pino logger tracks operation flow through all layers |
| Transaction traceId consistency | ✅ PASS | traceId passed from Express middleware → use case → repository; included in logs |

### Stack Compliance

| Requirement | Status | Notes |
|------------|--------|-------|
| Node.js latest stable | ✅ PASS | Using latest LTS version |
| TypeScript 5.3+ | ✅ PASS | Strict mode, full type coverage required |
| pnpm package manager | ✅ PASS | All dependencies installed via pnpm |
| Jest 100% coverage | ✅ PASS | Jest configured in package.json; coverage thresholds set |
| Cucumber BDD framework | ✅ PASS | @cucumber/cucumber installed; feature files in standard location |
| Supertest for HTTP tests | ✅ PASS | Dependency present for integration testing |
| PostgreSQL database | ✅ PASS | Production database; docker-compose will provide test instance |
| Pino logging library | ✅ PASS | To be added; will replace console logging |

### Gate Evaluation

**Overall Result**: ✅ **GATE PASS**

All constitution requirements are met or will be enforced during implementation. No violations detected. Feature is ready to proceed to Phase 0 research and Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-crud/
├── spec.md              # ✅ Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0 output (TO CREATE - research unknowns)
├── data-model.md        # Phase 1 output (TO CREATE - entities and relationships)
├── quickstart.md        # Phase 1 output (TO CREATE - implementation quick reference)
├── contracts/           # Phase 1 output directory
│   ├── user-api.openapi.yaml  # TO CREATE - OpenAPI 3.0 specification
│   └── user.dto.ts            # TO CREATE - Data Transfer Objects
└── checklists/
    └── requirements.md   # ✅ Specification quality checklist
```

### Source Code (repository root) - Hexagonal Architecture

Implementing **Option 1: Hexagonal Backend** (Domain, Application, Infrastructure separation)

```text
src/
├── Domain/
│   ├── User/
│   │   ├── user.entity.ts                 # User aggregate root, no dependencies
│   │   ├── user.exceptions.ts             # UserNotFoundException, DuplicateEmailException, etc.
│   │   ├── value-objects/
│   │   │   ├── email.value-object.ts      # Email validation (format, uniqueness logic)
│   │   │   ├── password.value-object.ts   # Password hashing/validation
│   │   │   └── user-id.value-object.ts    # User ID type safety
│   │   └── ports/
│   │       └── user.repository.port.ts    # Interface (no implementation) 
│   │
│   └── Common/
│       ├── domain-event.ts                # Base domain event class
│       └── value-object.ts                # Base value object class
│
├── Application/
│   ├── User/
│   │   ├── use-cases/
│   │   │   ├── create-user.use-case.ts   # CreateUserUseCase, depends on IUserRepository port
│   │   │   ├── get-user.use-case.ts      # GetUserUseCase
│   │   │   ├── get-all-users.use-case.ts # GetAllUsersUseCase with pagination
│   │   │   ├── update-user.use-case.ts   # UpdateUserUseCase
│   │   │   └── delete-user.use-case.ts   # DeleteUserUseCase
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts        # Input DTO with validation
│   │   │   ├── get-user-query.dto.ts     # Query parameters (ID, pagination)
│   │   │   ├── update-user.dto.ts        # Update payload
│   │   │   └── user.response.dto.ts      # Output DTO (never expose domain entity)
│   │   └── user-application.service.ts   # Orchestration service (optional)
│   │
│   └── Common/
│       ├── application-exception.ts       # Base exception for application layer
│       └── logger.port.ts                 # ILogger interface (dependency for all use cases)
│
├── Infrastructure/
│   ├── Primary/ (Inbound adapters - HTTP)
│   │   ├── server.ts                     # Express app initialization
│   │   ├── http-server.ts                # HTTP server startup
│   │   ├── routes/
│   │   │   └── user/
│   │   │       └── user.routes.ts        # Route definitions
│   │   ├── controllers/
│   │   │   └── user/
│   │   │       ├── create-user.controller.ts      # POST /users
│   │   │       ├── get-user.controller.ts         # GET /users/:id
│   │   │       ├── get-all-users.controller.ts    # GET /users?page=1&limit=10
│   │   │       ├── update-user.controller.ts      # PATCH /users/:id
│   │   │       └── delete-user.controller.ts      # DELETE /users/:id
│   │   ├── middleware/
│   │   │   ├── error-handler.middleware.ts        # Global error handler (maps domain exceptions → HTTP)
│   │   │   ├── trace-id.middleware.ts             # Generates/passes traceId via Pino
│   │   │   └── request-logger.middleware.ts       # Pino HTTP logging
│   │   └── openapi/
│   │       └── swagger-config.ts          # Swagger UI initialization + JSDoc -> OpenAPI
│   │
│   ├── Secondary/ (Outbound adapters - Data & External Services)
│   │   └── User/
│   │       └── repositories/
│   │           └── typeorm-user.repository.ts     # Implements IUserRepository port
│   │
│   ├── Common/
│   │   ├── config/
│   │   │   ├── database.config.ts         # PostgreSQL connection config (from env)
│   │   │   └── logger.config.ts           # Pino logger setup with traceId
│   │   └── adapters/
│   │       └── pino-logger.adapter.ts     # Implements ILogger port
│   │
│   └── Persistence/
│       ├── database.ts                    # Database initialization
│       └── entities/
│           └── user.database-entity.ts    # TypeORM @Entity (maps to Domain User)
│
└── index.ts                              # Package entry point

tests/
├── acceptance/                           # Cucumber BDD E2E tests
│   ├── features/
│   │   └── user-crud.feature             # Gherkin scenarios for all 5 user stories
│   └── step-definitions/
│       └── user-crud.steps.ts            # Cucumber step implementations (Supertest)
│
├── unit/                                 # Jest TDD unit tests (Domain + Application)
│   ├── domain/
│   │   ├── user/
│   │   │   ├── user.entity.spec.ts       # User aggregate tests
│   │   │   ├── user.exceptions.spec.ts  
│   │   │   └── value-objects/
│   │   │       ├── email.value-object.spec.ts
│   │   │       ├── password.value-object.spec.ts
│   │   │       └── user-id.value-object.spec.ts
│   │   └── common/
│   │       └── value-object.spec.ts
│   │
│   └── application/
│       └── user/
│           ├── create-user.use-case.spec.ts
│           ├── get-user.use-case.spec.ts
│           ├── get-all-users.use-case.spec.ts
│           ├── update-user.use-case.spec.ts
│           └── delete-user.use-case.spec.ts
│
└── integration/                          # Integration tests (adapters, real DB)
    └── repositories/
        └── typeorm-user.repository.spec.ts  # Tests with real PostgreSQL instance
```

**Structure Decision**: 
- **Hexagonal Pattern**: Clear separation of Domain (zero dependencies) → Application (use cases) → Infrastructure (adapters)
- **Primary Adapter**: Express HTTP controllers handle input validation and HTTP mapping
- **Secondary Adapter**: TypeORM repository implements the IUserRepository port for PostgreSQL persistence
- **Logging**: Pino adapter implements ILogger port; middleware injects traceId into all logs
- **Testing**: BDD acceptance tests (Cucumber) for user journeys; TDD unit tests (Jest) for domain/application logic; integration tests for repository implementations
- **Error Handling**: Domain exceptions thrown in business logic; Primary adapter middleware catches and maps to HTTP status codes
- **Package Structure**: Feature-based organization (User/) within each architectural layer for clear separation of concerns

## Complexity Tracking

No constitution violations requiring justification. The hexagonal architecture naturally enforces all requirements.
