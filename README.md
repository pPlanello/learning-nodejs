# Node.js Hexagonal Backend: SDD Constitution

This project is built following the **Specification-Driven Development (SDD)** paradigm. It utilizes a strict **Hexagonal Architecture** to ensure the business logic remains isolated, testable, and independent of external technologies.

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

## 🏗 Architectural Layers - Hexagonal Architecture

Following the Hexagonal pattern, the code is divided into three distinct layers to manage dependencies effectively:

### 1. Domain Layer (`src/domain`)
The core of the system. It contains the business rules, Entities, Value Objects, and Domain Exceptions.
- **Rules:** Zero dependencies. It defines "Ports" (Interfaces) for repositories or external services.

### 2. Application Layer (`src/application`)
Coordinates the execution of business logic. It contains the **Use Cases**.
- **Rules:** Depends only on the Domain. It orchestrates how data flows without knowing about HTTP or Databases.

### 3. Infrastructure Layer (`src/infrastructure`)
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

We use the `/acceptance-test` folder as the **Source of Truth** for Business and Developer. Before writing any code, the behavior is defined here using the specfic feature file.

### The `/acceptance-test` Folder Structure
- **`acceptance-test/features/`**: Contains the Gherkin files (`.feature`) describing the system behavior.
- **`acceptance-test/step_definitions/`**: Implementation of a gherkin behaviours.


---

## 📂 Project Directory Structure

```text
.
├── .specify/                    # SDD: Living documentation
│   ├── features/               # .feature files (User Stories)
|   |  ├── spec.md              # Feature specification
│   |  ├── plan.md              # Implementation plan
│   |  ├── research.md          # Technical research
│   |  ├── data-model.md        # Domain model
│   |  ├── quickstart.md        # Developer guide
│   |  ├── tasks.md             # 
│   |  └── contracts/
|   |       └── openapi.yaml    # API contract
│   └── memory/
|       └── constitution.md     # Project Standards & Architectural Rules
├── scripts/
|   ├── build.sh                # build docker image for a project
|   └── run-acceptance-test.sh  # execute Gherkin docker image
├── src/
│   ├── domain/                 # Business Logic & Repository Interfaces (Ports)
│   ├── application/            # Use Cases (Interactors)
│   └── infrastructure/         # Adapters (Express, DB, External Clients)
├── acceptance-test/
|   ├── features/               # Gherkin information
│   ├── step_definitions/       # Cucumber implementations (E2E with Supertest)
│   ├── support/                # Cucumber hooks and World context
|   |   └── cucumber.js         # Cucumber-js configuration
|   └── docker-compose.yaml     # Infraestructure
├── tests/
│   ├── application/            # TDD: Logic testing for application
│   └── domain/                 # TDD: Logic testing for domain
├── .prettierrc                 # Code formatting standards
└── tsconfig.json               # TypeScript strict configuration
```
---
## 💻 Workflow to development

1. Write the requirement in `/specs/features`.
2. Run `spec-kit` to validate/generate documentation.
3. Implement the failing test e2e in `acceptance-test/`.
4. Implement the failing test unit in `tests/`
5. Code the logic in `src/` to satisfy the specification.

---


# 🚀 Getting Started: Development Guide

Follow these steps to set up your environment and understand the development workflow for this Specification-Driven project.

---

## 🛠 Prerequisites

Ensure you have the following installed:
- **Node.js** (v20.0.0 or higher)
- **pnpm** (Recommended package manager)
- **Docker** (For running infrastructure dependencies like Databases)

---

## 🚦 1. Installation

Clone the repository and install the dependencies using `pnpm`:

```bash
pnpm install
```

## 🧪 2. Running Tests
The project enforces a "Test-First" culture:

### Unit Testing (TDD)
Focused on the Domain and Application layers using Jest. These tests ensure business logic is correct in isolation.
```bash
pnpm run test:unit
```

### Acceptance Testing (BDD)
Focused on the Infrastructure layer using Cucumber and Supertest. These tests verify the specifications defined in the /specs folder.
```bash
scripts/build.sh && scripts/run-acceptance-test.sh
```

### Full Test Report
Run the entire suite to ensure no regressions:
```bash
scripts/build.sh && scripts/run-all-test.sh
```

## 3. ✨ Code Quality & Standards
To maintain the project's "Constitution" and ensure a clean Hexagonal codebase, we enforce the following:

### Formatting
We use Prettier to maintain a consistent code style across the team.
```bash
# Check for formatting issues
pnpm run format:check

# Automatically fix formatting
pnpm run format
```

### Linting
Strict TypeScript linting to prevent common bugs and architectural violations (like importing Infrastructure into Domain).
```bash
pnpm run lint
```

### SDD Generation
If you have updated the .feature files in /specs, sync them using spec-kit:
```bash
pnpm run specs:generate
```