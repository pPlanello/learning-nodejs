# Node.js Hexagonal Backend (SDD)

This project follows Specification-Driven Development (SDD) with a Hexagonal Architecture. Business rules are isolated in Domain/Application layers, while infrastructure concerns are handled through adapters.

## 🛠 Tech Stack
* **Runtime:** Node.js (latest stable version)
* **Package Manager:** `pnpm`
* **Language:** TypeScript
* **Testing:** * **BDD/E2E:** Cucumber + Supertest + Chai
  * **Unit/TDD:** Jest
* **Architecture:** Hexagonal (Application, Domain, Infrastructure)
* **Code Quality:** Prettier + ESLint
* **Specifications:** [Spec-kit](https://github.com/github/spec-kit)

---

## ⚡ Current Setup / Run / Test Commands

### Setup

```bash
pnpm install
```

Create `.env` with at least:

```env
DATABASE_URL=postgresql://local:test@localhost:5432/testdb
PORT=3000
LOG_LEVEL=info
```

### Run

```bash
pnpm run dev
```

### Build & Start

```bash
pnpm run build
pnpm run start
```

### Tests

```bash
pnpm run test          # unit + e2e
pnpm run test:unit     # jest
pnpm run test:e2e      # dockerized acceptance flow
```

`test:e2e` uses orchestrated scripts in `scripts/`:
- `run-e2e.cjs` (coordinator)
- `start-e2e.cjs` (build image + compose up + DB readiness)
- `execute-e2e.cjs` (run Cucumber)
- `stop-e2e.cjs` (compose down + image cleanup)

Acceptance compose file:
- `tests/acceptance/docker-compose.acceptance-test.yml`

## Quality Commands

```bash
pnpm run lint
pnpm run format:check
pnpm run format
pnpm exec tsc --noEmit
```

## API Docs
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON: http://localhost:3000/api-docs/openapi.json

## 🏗 Architectural Layers - Hexagonal Architecture

Following the Hexagonal pattern, the code is divided into three distinct layers to manage dependencies effectively:

### Domain (`src/domain`)
- Entities, value objects, domain exceptions, and ports (interfaces)
- No infrastructure dependencies

### Application (`src/application`)
- Use cases that orchestrate domain logic
- Depends only on domain contracts

### Infrastructure Layer (`src/infrastructure`)
Contains the "Adapters" (technological implementations).
- **Primary Adapters:** Entry points like Express controllers or CLI commands.
- **Secondary Adapters:** Implementations of Domain interfaces (e.g., PostgreSQL Repositories, Stripe API clients).

---

## 📝 Specification Driven Development (SDD)

We use the `/specs` folder as the **Source of Truth** for IA and Developer. Before writing any code, the behavior is defined here using **spec-kit**.

In `.specify/memory` folder we have the file constitution.md which is a structured document that defines the core values, behaviors, and safety boundaries for an AI model.

### The `/specs` Folder Structure
- **`specs/requirements/`**: Detailed documentation generated or managed via `spec-kit`.

---
## 📜 BusinessDriven Development (BDD)

We use the `/tests/acceptance` folder as the **Source of Truth** for Business and Developer. Before writing any code, the behavior is defined here using the specific feature files.

### The `/tests/acceptance` Folder Structure
- **`tests/acceptance/features/`**: Contains the Gherkin files (`.feature`) describing the system behavior.
- **`tests/acceptance/step-definitions/`**: Implementation of Gherkin behaviors.


---

## 📂 Project Directory Structure

```text
.
├── .specify/
│   └── memory/
│       └── constitution.md
├── specs/
│   └── 001-user-crud/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       ├── tasks.md
│       ├── checklists/
│       └── contracts/
├── scripts/
│   ├── build.cjs
│   ├── run-command.cjs
│   ├── run-e2e.cjs
│   ├── start-e2e.cjs
│   ├── execute-e2e.cjs
│   ├── stop-e2e.cjs
│   └── run-jest-unit.cjs
├── src/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── tests/
│   ├── acceptance/
│   │   ├── cucumber.js
│   │   ├── docker-compose.acceptance-test.yml
│   │   ├── features/
│   │   └── step-definitions/
│   ├── unit/
│   └── integration/
└── package.json
```

## Development Workflow
1. Define or update feature specs in `specs/<feature-id>/`.
2. Run `pnpm run specs:generate` when needed.
3. Write/adjust acceptance tests first (`tests/acceptance`).
4. Write/adjust unit tests (`tests/unit`, `tests/integration`).
5. Implement/update code in `src/` to satisfy specs and tests.