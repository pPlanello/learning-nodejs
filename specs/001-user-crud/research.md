# Research & Technical Decisions: User CRUD Operations

**Phase**: 0 - Outline & Research  
**Date**: February 18, 2026  
**Status**: Complete  
**Feature**: [User CRUD Implementation Plan](./plan.md)

## Summary

This document records all technical decisions and research conducted for the User CRUD feature implementation. All decisions align with the project constitution (Hexagonal Architecture, Test-First Imperative, TypeScript/Express/PostgreSQL stack) and the specification's functional requirements.

---

## Technical Decisions

### 1. Architecture: Hexagonal (Clean/Ports & Adapters)

**Decision**: Implement Domain-Application-Infrastructure three-layer hexagonal architecture

**Rationale**:
- Constitution mandates strict hexagonal isolation with zero dependencies between layers
- Enables independent testing of business logic (Domain/Application) without infrastructure concerns
- Domain layer containing User entity and business rules becomes easily reusable
- Clear separation of concerns: what (domain) vs. how (infrastructure)
- Proven pattern for enterprise Node.js backends

**Alternatives Considered**:
- **Monolithic MVC**: Simpler initially but violates constitution; difficult to test without database
- **Micro-services**: Overkill for User CRUD; excessive complexity
- **Layered (without strict ports/adapters)**: Would result in tight coupling; harder to switch database

**Evidence**: Constitution section 1 explicitly requires Hexagonal Architecture with strict dependencies

---

### 2. Delete Operation: Soft Delete (Logical Deletion)

**Decision**: Implement soft delete - mark users as inactive/deleted, retain data in database

**Rationale**:
- **Compliance**: Retains audit trail of all user operations for compliance/regulatory requirements
- **Data Recovery**: Accidental deletions can be recovered without database restore
- **Referential Integrity**: Related data remains valid; prevents foreign key violations
- **Business Intelligence**: Historical data available for analytics and reporting
- **Industry Standard**: Recommended practice for user management systems
- **Spec Assumption**: Specification explicitly states soft-delete is "preferred over hard delete"

**Implementation**:
- Add `deleted_at` timestamp column to User table (NULL = active, set timestamp when deleted)
- Domain layer: User entity tracks deleted status via value object
- Repository: List operations filter `WHERE deleted_at IS NULL`
- Retrieval: GetUser returns 404 if user.deleted_at is not NULL

**Alternatives Considered**:
- **Hard Delete**: Violates audit trail requirements; causes data recovery issues
- **Hybrid (both options)**: Adds unnecessary complexity; soft-delete covers all use cases

---

### 3. ORM: TypeORM

**Decision**: Use TypeORM for PostgreSQL persistence

**Rationale**:
- **TypeScript-First**: Native TypeScript support; full type safety without mapping layers
- **Decorator Pattern**: @Entity, @Column decorators make schema definition declarative and maintainable
- **Query Builder**: Type-safe query construction preventing SQL injection
- **Migrations**: Built-in migration system for schema evolution
- **Already in Ecosystem**: Commonly used with Express in Node.js
- **Repository Pattern**: Built-in Active Repository pattern (we'll create a Repository Port adapter)

**Alternatives Considered**:
- **Sequelize**: JavaScript-focused; less type-safe than TypeORM
- **Prisma**: Modern and type-safe but adds additional abstraction; schema incompatibility with PostgreSQL-first approach
- **Drizzle**: Lightweight but newer, less ecosystem support
- **Raw PostgreSQL (pg library)**: Requires manual mapping; higher vulnerability to SQL injection; violates DRY principle

**Implementation**:
- TypeORM @Entity decorator for database schema mapping
- Custom repository class implements IUserRepository port (hexagonal adapter)
- Domain entities remain pure TypeScript classes with business logic

---

### 4. Logging: Pino Logger

**Decision**: Implement Pino structured logging library

**Rationale**:
- **Constitution Requirement**: Constitution section 6 mandates Pino for all operations with traceId
- **Performance**: Extremely fast structured logging (JSON serialization optimized)
- **Distributed Tracing**: Native traceId support for tracking requests across layers
- **Production-Ready**: Mature library used in enterprise Node.js deployments
- **Log Levels**: DEBUG, INFO, WARN, ERROR severity support matching operation needs
- **Redaction Plugin**: Built-in support for masking sensitive data (passwords)

**Alternatives Considered**:
- **Winston**: Feature-rich but slower; more configuration overhead
- **Bunyan**: Production-grade but less active maintenance
- **console.log()**: Violates logging requirements; no traceId support

**Implementation**:
- Create Pino logger adapter implementing ILogger port
- Inject into use cases via constructor dependency injection
- Middleware: AttachTraceIdMiddleware generates UUID v4 traceId per request
- All log calls include traceId in child logger context

---

### 5. Validation: DTO + Value Objects

**Decision**: Two-layer validation: DTOs at infrastructure edge, Value Objects in domain

**Rationale**:
- **Separation of Concerns**: DTOs handle HTTP/serialization concerns; Domain handles business rules
- **Reusability**: Value Objects (Email, Password) can be reused across use cases
- **Type Safety**: TypeScript ensures validation contracts
- **Performance**: Validation fails fast at infrastructure layer before reaching domain

**Implementation**:
- **InputDTOs**: `CreateUserDTO`, `UpdateUserDTO` with class-validator decorators (email format, required fields)
- **Value Objects**: `Email` class enforces uniqueness during domain operation; `Password` class handles hashing
- **OutputDTO**: `UserResponseDTO` maps domain entity to JSON without exposing internal fields

**Alternatives Considered**:
- **Only domain validation**: Moves serialization logic to domain layer, violating separation of concerns
- **Only DTO validation**: Bypasses business rule validation; can create invalid domain state

---

### 6. Payment/Auth: Basic Approach (No External Dependencies)

**Decision**: User CRUD handles passwords locally; no external payment/auth services required initially

**Rationale**:
- **Specification Requirement**: Spec assumes "Passwords are provided and managed through this CRUD system (no external authentication initially)"
- **Simplicity**: MVP focus on core CRUD operations
- **Password Security**: Use bcrypt or argon2 for hashing; never store plaintext
- **Future-Safe**: Architecture allows injection of OAuth/SAML later via port interfaces

**Implementation**:
- Password validation in Password Value Object using bcrypt hashing
- `CreateUserUseCase` receives plaintext password, hashes via Password VO, stores hash in DB
- No integration with external auth providers at this stage

---

### 7. API Contract: OpenAPI 3.0 + Swagger UI

**Decision**: Document API using OpenAPI 3.0 specification with Swagger UI

**Rationale**:
- **Constitution Requirement**: Section 5 mandates "OpenAPI/Swagger specification MUST be maintained and version-controlled"
- **Developer Experience**: Swagger UI provides interactive API documentation
- **Contract-First**: Living documentation stays in sync with implementation
- **Tooling Ecosystem**: OpenAPI spec enables code generation, testing tools, API analytics

**Implementation**:
- JSDoc comments in Express controllers document request/response schemas
- swagger-jsdoc library generates OpenAPI spec from JSDoc
- Serve Swagger UI at `/api-docs` endpoint
- Version as `v1` in spec; semantic versioning for future changes

---

### 8. Error Handling: Domain Exceptions → HTTP Status Codes

**Decision**: Map domain exceptions to HTTP status codes in infrastructure layer

**Rationale**:
- **Separation of Concerns**: Domain knows about business errors (UserNotFound); Infrastructure knows about HTTP
- **Constitution Requirement**: Section 3 mandates exception mapping; Section 4 forbids stack trace leakage
- **Standardization**: RFC 7231 HTTP status codes for consistent API behavior

**Mapping**:
```
UserNotFoundException → 404 Not Found
DuplicateEmailException → 409 Conflict
InvalidEmailFormatException → 400 Bad Request
ValidationException (missing fields) → 400 Bad Request
InvalidPasswordException → 400 Bad Request
```

**Implementation**:
- Global error handler middleware catches all exceptions
- Maps to appropriate HTTP status code
- Returns JSON error response with user-friendly message (no stack traces)

---

### 9. Database Schema: Normalized PostgreSQL

**Decision**: Single User table with efficient schema design

**Schema Outline**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_deleted_at (deleted_at)
);
```

**Rationale**:
- **UUID for ID**: Better for distributed systems; prevents ID enumeration attacks
- **Soft Delete via deleted_at**: Retains audit trail while filtering inactive users
- **Timestamps**: created_at for audit, updated_at for concurrency detection
- **Indexed email**: Fast lookups for uniqueness checks and authentication (future)
- **Status enum**: Supports future status transitions (active, suspended, pending_verification)

---

### 10. Pagination: Offset-Based with Limits

**Decision**: Implement offset-based pagination with configurable limit (default 10, max 100)

**Rationale**:
- **Simple to Understand**: Developers familiar with offset/limit pattern
- **Stateless**: No cursor state required; easy for end users
- **Performance**: Efficient for small offsets; acceptable for typical admin use
- **Flexibility**: Supports arbitrary page jumps

**Implementation**:
```
GET /users?page=1&limit=10
Response includes:
{
  data: [...],
  total: 1234,
  page: 1,
  limit: 10,
  totalPages: 124
}
```

**Alternatives Considered**:
- **Cursor-based**: More efficient for large offsets but requires stateful cursor management
- **Keyset Pagination**: Best performance but complex implementation; overkill for MVP

---

### 11. Testing Strategy: BDD + TDD + Integration

**Decision**: Three-tier testing approach aligned with constitution requirements

**Specification Test (BDD - User-Focused)**:
- Cucumber .feature files with Gherkin scenarios (all 5 user stories)
- Step implementations using Supertest for HTTP testing
- Integration with real PostgreSQL in docker-compose
- Goal: Verify each acceptance scenario works end-to-end
- Tools: @cucumber/cucumber, supertest

**Unit Tests (TDD - Developer-Focused)**:
- Jest tests for Domain layer (User entity, Value Objects, use cases)
- 100% code coverage requirement for src/Domain/ and src/Application/
- Mocked dependencies (in-memory repository implementations)
- Goal: Verify business logic correctness in isolation
- Tools: Jest, ts-jest

**Integration Tests**:
- TypeORM repository tests against real PostgreSQL instance
- Express middleware tests (error handling, tracing)
- Goal: Verify adapters work correctly
- Environment: docker-compose with PostgreSQL test database

**Rationale**:
- Constitution mandates "Test First Imperative" with "Red-Green-Refactor cycle at two levels"
- Each layer tested independently per its responsibilities
- Fast feedback (unit → minutes), thorough coverage (integration), user validation (acceptance)

---

### 12. Development Environment: Docker Compose for Dependencies

**Decision**: Use docker-compose for PostgreSQL and other infrastructure services

**Rationale**:
- **Consistency**: All developers/CI systems run identical database version
- **Isolation**: No conflicts with local PostgreSQL installations
- **Reset Simplicity**: `docker-compose down -v && docker-compose up` resets database
- **Production Parity**: Container image distribution follows production deployment

**Services**:
```yaml
postgres:
  image: postgres:16
  environment:
    POSTGRES_DB: user_crud_db
    POSTGRES_USER: app_user
    POSTGRES_PASSWORD: app_password
  ports:
    - "5432:5432"
```

---

## Specification Alignment Verification

| Spec Requirement | Implementation Decision | Evidence |
|-----------------|------------------------|----------|
| Soft delete or hard delete | Soft delete (deleted_at timestamp) | Research section 2 |
| 500ms response time (SC-002) | TypeORM + indexed queries + connection pooling | Performance tuning in implementation |
| Handle 100 concurrent requests (SC-003) | Express clustering + connection pool sizing | Load testing phase |
| 10,000+ users support (SC-006) | Pagination with indexed queries | Schema section, index strategy |
| Audit trail (SC-010) | Pino logging with traceId; soft delete preserves history | Section 4, section 2 |
| RESTful API (FR-020) | Express controllers following REST conventions | HTTP status code mapping |
| Unique email validation (FR-002) | PostgreSQL unique constraint + domain validation | Validation strategy |
| Email format validation (FR-003) | DTO class-validator decorator + Value Object | Validation strategy |
| Secure password storage (FR-004) | bcrypt hashing in Password Value Object | Section 6 |
| Pagination metadata (FR-012) | Offset-based with total/page/limit/totalPages | Section 10 |

---

## Open Questions Resolved

✅ **All constitutional and specification requirements are resolvable with above technical decisions.**  
✅ **No NEEDS CLARIFICATION markers remain.**  
✅ **Ready to proceed to Phase 1: Design (data-model.md, contracts, quickstart.md).**

