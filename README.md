# 🚀 Node.js Hexagonal Backend: SDD Constitution

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

## 🏗 Architectural Layers

Following the Hexagonal pattern, the code is divided into three distinct layers to manage dependencies effectively:

### 1. Domain Layer (`src/Domain`)
The core of the system. It contains the business rules, Entities, Value Objects, and Domain Exceptions.
- **Rules:** Zero dependencies. It defines "Ports" (Interfaces) for repositories or external services.

### 2. Application Layer (`src/Application`)
Coordinates the execution of business logic. It contains the **Use Cases**.
- **Rules:** Depends only on the Domain. It orchestrates how data flows without knowing about HTTP or Databases.

### 3. Infrastructure Layer (`src/Infrastructure`)
Contains the "Adapters" (technological implementations).
- **Primary Adapters:** Entry points like Express controllers or CLI commands.
- **Secondary Adapters:** Implementations of Domain interfaces (e.g., PostgreSQL Repositories, Stripe API clients).

---

## 📝 Specification-Driven Development (SDD)

We use the `/specs` folder as the **Source of Truth**. Before writing any code, the behavior is defined here using **spec-kit**.

### The `/specs` Folder Structure
- **`specs/features/`**: Contains the Gherkin files (`.feature`) describing the system behavior.
- **`specs/constitution.md`**: Defines the project's architectural constraints and coding standards.
- **`specs/requirements/`**: Detailed documentation generated or managed via `spec-kit`.

> **Workflow:** > 1. Write the requirement in `/specs/features`.
> 2. Run `spec-kit` to validate/generate documentation.
> 3. Implement the failing test in `features/step_definitions`.
> 4. Code the logic in `src/` to satisfy the specification.

---

## 📂 Project Directory Structure

```text
.
├── specs/                 # SDD: Living documentation & Gherkin source
│   ├── features/          # .feature files (User Stories)
│   └── constitution.md    # Project Standards & Architectural Rules
├── src/
│   ├── Domain/            # Business Logic & Repository Interfaces (Ports)
│   ├── Application/       # Use Cases (Interactors)
│   └── Infrastructure/    # Adapters (Express, DB, External Clients)
├── features/
│   ├── step_definitions/  # Cucumber implementations (E2E with Supertest)
│   └── support/           # Cucumber hooks and World context
├── tests/
│   └── Unit/              # TDD: Logic testing for Domain/Application
├── .prettierrc            # Code formatting standards
├── cucumber.js            # Cucumber-js configuration
└── tsconfig.json          # TypeScript strict configuration
```

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
pnpm run test:e2e
```

### Full Test Report
Run the entire suite to ensure no regressions:
```bash
pnpm run test
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