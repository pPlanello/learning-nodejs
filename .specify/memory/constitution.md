# learning-nodejs: Constitution

## Core Principles

### 1. Hexagonal Architecture
Strict Hexagonal Isolation:
    
* **Domain:**
    * *Responsability:* Business Logic, Entities, Value Objects, Domain Exceptions.
    * *Constraints:* Zero Dependencies. No Express, No TypeORM, No libraries except internal logic.
* **Application:**
    * *Responsability:* Use Cases, Orchestration, Input/Output Ports (Interfaces).
    * *Constraints:* Depends only on Domain. No knowledge of HTTP or Databases.
* **Infrastructure:**
    * *Responsability:* Adapters (Express, Postgres, Redis, External APIs).
    * *Constraints:* Depends on Application and Domain. Implements Domain Interfaces.

**Strict Rule:** Any import of infrastructure/ inside domain/ or application/ is a violation and must be rejected.

### 2. Test First Imperative
We follow the Red-Green-Refactor cycle at two levels:

1. **Acceptance (BDD):** Gherkin features (.feature) must be written first to define the "Definition of Done" for the business.
2. **Unit (TDD):** Logic in src/domain must have 100% coverage via Jest.
3. **Integration:** Adapters (Postgres, Axios) must be tested against real (or containerized) instances using docker-compose.

### 3. Coding Standards & Clean Code
* **Ubiquitous Language:** Use the same terms in the code as used in the .feature files (e.g., if the spec says "Subscriber," don't call the class User).
* **File Naming:** kebab-case.ts.
* **Class Naming:** PascalCase.
* **Function Naming:** camelCase.
* **Side Effects:** Functions must be small and do one thing. If a function contains "And" in its description, it should probably be split.
* **Naming Conventions**
    * *Interfaces:* Prefixed with I (e.g., IUserRepository) or named as Ports (e.g., UserReader).
    * *Use Cases:* Named as actions (e.g., CreateUserUseCase.ts).
    * *Files:* Kebab-case (e.g., user-repository.ts).
* **Error Handling:** Domain exceptions must be thrown in the Domain layer.
* **The Infrastructure layer (Adapters):** is responsible for mapping Domain Exceptions to HTTP Status Codes (e.g., UserNotFoundException -> 404 Not Found).
* **Data Flow:** Use Data Transfer Objects (DTOs) to pass data from Infrastructure to Application.
* **Never expose Domain Entities** directly via API responses; map them to public schemas/JSON first.

### 4. Security & Governance
* **Secrets:** Never hardcode credentials. Use .env with validation (e.g., dotenv-safe).
* **Errors:** Never leak stack traces to the end user. Map internal errors to standardized HTTP status codes in the Primary Adapters.
* **Validation:** Input validation must happen at the edge (Infrastructure) via DTOs and inside the Domain (Value Objects).

### 5. Documentation API
* API documentation MUST include: endpoints, request/response schemas, status codes, error formats
* OpenAPI/Swagger specification MUST be maintained and version-controlled
* Contract changes MUST follow semantic versioning (breaking vs non-breaking)
* Implementation MUST validate against documented contracts

### 6. Tracing transactions
* All operations in project MUST be trace by logger using Pino library.
* All trace MUST have a traceId.

---

## Technical Stack Requirements
* **Runtime:** Node.js (latest stable version)
* **Package Manager:** `pnpm`
* **Language:** TypeScript
* **Testing:**
  * **BDD/E2E:** Cucumber + Supertest + Chai
  * **TDD/Unit:** Jest
* **Architecture:** Hexagonal (Application, Domain, Infrastructure)
* **Tracing Log:** Pino 
* **Code Quality:** Prettier + ESLint
* **Documentation API:** OpenAPI/Swagger UI
* **Specifications:** [Spec-kit](https://github.com/github/spec-kit)
* **DataBase:** Postgress

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## Development Workflow

**Feature Development Process:**
1. Define requirements in `.specify/features/*.md` using Gherkin-style scenarios.
2. Sync: Run pnpm run specs:generate to update the living documentation.
3. Write a failing E2E test in `acceptance-test/features/`
4. Implement a scenario in `acceptance-test/step_definitions`.
5. Write failing unit tests in tests/domain/ and tests/application/.
6. Implement the minimum code in `src/` to pass tests in domain and application logic.
7. Implement the minimum code in `src/infrastructure` to pass acceptance test.
8. Write documentation swagger api in controllers.
9. Refactor: Clean code while maintaining architectural boundaries.
10. Verify all tests pass
11. Code review focusing on architecture compliance


**Code Review Requirements:**
1. Architecture compliance: Verify hexagonal boundaries are not violated
2. Type safety: Check for any usage and missing type definitions
3. Test coverage: Ensure adequate test coverage for new code
4. Contract adherence: Validate API implementation matches documented contract
5. Read-only constraint: Confirm no write operations on external database

**Quality Gates:**
1. All tests pass (unit, integration, contract)
2. TypeScript compilation succeeds with strict mode
3. API implementation matches OpenAPI specification
4. Code review approved by at least one team member
5. Architecture principles validated

## Governance
**Version Control:**
* Constitution changes MUST follow semantic versioning:
    * MAJOR: Backward incompatible changes (principle removal, fundamental shifts)
    * MINOR: New principles added or significant expansions
    * PATCH: Clarifications, wording improvements, non-semantic changes
**Version**: 1.0.0 | **Ratified**: 2026-02-18 | **Last Amended**: 2026-02-18
