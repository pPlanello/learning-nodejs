# Quick Start: User CRUD Implementation Guide

**Phase**: 1 - Design  
**Date**: February 18, 2026  
**Status**: Implementation Guide  
**Feature**: [User CRUD Implementation Plan](./plan.md)

---

## Overview

This guide provides step-by-step instructions for implementing the User CRUD feature following the hexagonal architecture and test-first approach mandated by the constitution.

**Implementation Sequence** (recommended order):
1. **Domain Layer** (Pure business logic, no dependencies)
2. **Application Layer** (Use cases, depends only on domain)
3. **Infrastructure Layer** (Adapters, depends on application & domain)
4. **Testing** (Acceptance tests, integration tests, unit tests)
5. **Documentation** (OpenAPI, deployment guides)

**Estimated Effort**: 1-2 weeks for one developer  
**Prerequisites**: Node.js 20+, PostgreSQL 16, Docker, pnpm

---

## Part 1: Setup & Configuration

### 1.1 Install Dependencies

```bash
# From repository root
pnpm install

# Add ORM and logging libraries
pnpm add typeorm reflect-metadata pino pino-http
pnpm add -D ts-node @types/pino

# Add validation library
pnpm add class-validator class-transformer
```

### 1.2 Database Configuration

Create `.env` in repository root:

```env
DATABASE_URL=postgresql://app_user:app_password@localhost:5432/user_crud_db
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
```

### 1.3 Start PostgreSQL

```bash
# Using docker-compose (ensure postgres service is defined)
docker-compose up -d postgres

# Verify connection
psql postgresql://app_user:app_password@localhost:5432/user_crud_db -c "SELECT 1"
```

### 1.4 Run Migrations

```bash
# (TypeORM will auto-sync schema in dev)
pnpm run build
# Migration will create `users` table automatically
```

---

## Part 2: Domain Layer Implementation

### 2.1 Create Domain Structure

```bash
mkdir -p src/Domain/User/Entities
mkdir -p src/Domain/User/ValueObjects
mkdir -p src/Domain/User/Ports
mkdir -p src/Domain/Common
```

### 2.2 Implementation Sequence

**Step 1: Value Objects** (no dependencies)

```typescript
// src/Domain/User/ValueObjects/user-id.value-object.ts
import { randomUUID } from 'crypto';

export class UserId {
  readonly value: string;

  constructor(value?: string) {
    this.value = value || randomUUID();
  }

  static generate(): UserId {
    return new UserId();
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

```typescript
// src/Domain/User/ValueObjects/email.value-object.ts
export class InvalidEmailFormatException extends Error {
  constructor(email: string) {
    super(`Email format invalid: ${email}`);
    this.name = 'InvalidEmailFormatException';
  }
}

export class Email {
  readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (!this.isValidFormat(trimmed)) {
      throw new InvalidEmailFormatException(value);
    }
    this.value = trimmed.toLowerCase();
  }

  private isValidFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length >= 5 && email.length <= 254;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

```typescript
// src/Domain/User/ValueObjects/hashed-password.value-object.ts
import { hashSync, compareSync } from 'bcrypt';

export class WeakPasswordException extends Error {
  constructor() {
    super('Password must be at least 8 characters with uppercase, lowercase, digit, and special character');
    this.name = 'WeakPasswordException';
  }
}

export class HashedPassword {
  readonly hash: string;

  constructor(plaintext: string) {
    if (!this.isStrong(plaintext)) {
      throw new WeakPasswordException();
    }
    this.hash = hashSync(plaintext, 10);
  }

  private isStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
  }

  isCorrect(plaintext: string): boolean {
    return compareSync(plaintext, this.hash);
  }
}
```

**Step 2: Domain Exceptions**

```typescript
// src/Domain/User/user.exceptions.ts
export class UserNotFoundExc extends Error {
  constructor(id: string) {
    super(`User with ID ${id} not found`);
    this.name = 'UserNotFoundException';
  }
}

export class DuplicateEmailExc extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'DuplicateEmailException';
  }
}

export class InvalidUserIdExc extends Error {
  constructor(id: string) {
    super(`Invalid user ID format: ${id}`);
    this.name = 'InvalidUserIdException';
  }
}
```

**Step 3: User Entity (Aggregate Root)**

```typescript
// src/Domain/User/user.entity.ts
import { UserId } from './ValueObjects/user-id.value-object';
import { Email } from './ValueObjects/email.value-object';
import { HashedPassword } from './ValueObjects/hashed-password.value-object';

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

export class User {
  id: UserId;
  name: string;
  email: Email;
  password: HashedPassword;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(
    id: UserId,
    name: string,
    email: Email,
    password: HashedPassword,
    status: UserStatus = 'active',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    deletedAt: Date | null = null,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  isActive(): boolean {
    return this.deletedAt === null && this.status === 'active';
  }

  updateProfile(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  updateEmail(email: Email): void {
    this.email = email;
    this.updatedAt = new Date();
  }

  delete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
```

**Step 4: Repository Port (Interface)**

```typescript
// src/Domain/User/Ports/user.repository.port.ts
import { User } from '../user.entity';
import { Email } from '../ValueObjects/email.value-object';
import { UserId } from '../ValueObjects/user-id.value-object';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(page: number, limit: number, filters?: any): Promise<{ data: User[]; total: number }>;
  update(user: User): Promise<User>;
  delete(id: UserId): Promise<void>;
}
```

**Step 5: Logger Port (Interface)**

```typescript
// src/Domain/Common/logger.port.ts
export interface ILogger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error): void;
}
```

### 2.3 Write Unit Tests for Domain

```typescript
// tests/unit/domain/user/user.entity.spec.ts
import { User } from '../../../../src/Domain/User/user.entity';
import { UserId } from '../../../../src/Domain/User/ValueObjects/user-id.value-object';
import { Email } from '../../../../src/Domain/User/ValueObjects/email.value-object';
import { HashedPassword } from '../../../../src/Domain/User/ValueObjects/hashed-password.value-object';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    const id = new UserId();
    const email = new Email('test@example.com');
    const password = new HashedPassword('SecurePass123!');
    user = new User(id, 'John Doe', email, password);
  });

  describe('create', () => {
    it('should create user with valid data', () => {
      expect(user.name).toBe('John Doe');
      expect(user.email.value).toBe('test@example.com');
      expect(user.status).toBe('active');
      expect(user.deletedAt).toBeNull();
    });

    it('should be active when created', () => {
      expect(user.isActive()).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('should update name and updatedAt', () => {
      const previousUpdatedAt = user.updatedAt;
      user.updateProfile('Jane Doe');
      expect(user.name).toBe('Jane Doe');
      expect(user.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should set deletedAt and make inactive', () => {
      user.delete();
      expect(user.deletedAt).not.toBeNull();
      expect(user.isActive()).toBe(false);
    });
  });
});
```

---

## Part 3: Application Layer Implementation

### 3.1 Create Application Structure

```bash
mkdir -p src/Application/User/UseCases
mkdir -p src/Application/User/DTOs
mkdir -p src/Application/Common
```

### 3.2 Use Case Implementation

```typescript
// src/Application/User/UseCases/create-user.use-case.ts
import { User } from '../../../Domain/User/user.entity';
import { UserId } from '../../../Domain/User/ValueObjects/user-id.value-object';
import { Email, InvalidEmailFormatException } from '../../../Domain/User/ValueObjects/email.value-object';
import { HashedPassword, WeakPasswordException } from '../../../Domain/User/ValueObjects/hashed-password.value-object';
import { IUserRepository } from '../../../Domain/User/Ports/user.repository.port';
import { ILogger } from '../../../Domain/Common/logger.port';
import { DuplicateEmailExc } from '../../../Domain/User/user.exceptions';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger,
  ) {}

  async execute(request: CreateUserRequest): Promise<User> {
    this.logger.info('Creating user', { email: request.email });

    // Validate email format
    let email: Email;
    try {
      email = new Email(request.email);
    } catch (error) {
      this.logger.warn('Invalid email format', { email: request.email });
      throw error; // Let domain exception propagate
    }

    // Check email uniqueness
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser && !existingUser.deletedAt) {
      throw new DuplicateEmailExc(email.toString());
    }

    // Validate password strength
    let password: HashedPassword;
    try {
      password = new HashedPassword(request.password);
    } catch (error) {
      this.logger.warn('Weak password provided');
      throw error;
    }

    // Create user
    const user = new User(
      UserId.generate(),
      request.name,
      email,
      password,
    );

    const savedUser = await this.userRepository.create(user);
    this.logger.info('User created successfully', { userId: savedUser.id.toString() });

    return savedUser;
  }
}
```

```typescript
// src/Application/User/UseCases/get-user.use-case.ts
import { User } from '../../../Domain/User/user.entity';
import { UserId } from '../../../Domain/User/ValueObjects/user-id.value-object';
import { IUserRepository } from '../../../Domain/User/Ports/user.repository.port';
import { ILogger } from '../../../Domain/Common/logger.port';
import { UserNotFoundExc } from '../../../Domain/User/user.exceptions';

export class GetUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private logger: ILogger,
  ) {}

  async execute(userId: string): Promise<User> {
    this.logger.debug('Fetching user', { userId });

    const id = new UserId(userId);
    const user = await this.userRepository.findById(id);

    if (!user || user.deletedAt) {
      throw new UserNotFoundExc(userId);
    }

    return user;
  }
}
```

### 3.3 DTOs

```typescript
// src/Application/User/DTOs/user.response.dto.ts
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export function mapUserToDTO(user: any): UserResponseDTO {
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email.toString(),
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    deletedAt: user.deletedAt?.toISOString() ?? null,
  };
}
```

---

## Part 4: Infrastructure Layer Implementation

### 4.1 Create Infrastructure Structure

```bash
mkdir -p src/Infrastructure/Primary/controllers/user
mkdir -p src/Infrastructure/Primary/middleware
mkdir -p src/Infrastructure/Secondary/repositories
mkdir -p src/Infrastructure/Persistence
mkdir -p src/Infrastructure/Config
```

### 4.2 Database Entity (TypeORM)

```typescript
// src/Infrastructure/Persistence/entities/user.database-entity.ts
import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('users')
@Index(['email'])
@Index(['deletedAt'])
export class UserDatabaseEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 254, unique: true })
  email: string;

  @Column('varchar')
  password_hash: string;

  @Column('varchar', { default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('timestamp', { nullable: true })
  deleted_at: Date | null;
}
```

### 4.3 Repository Implementation

```typescript
// src/Infrastructure/Secondary/repositories/typeorm-user.repository.ts
import { Repository } from 'typeorm';
import { User } from '../../../Domain/User/user.entity';
import { UserId } from '../../../Domain/User/ValueObjects/user-id.value-object';
import { Email } from '../../../Domain/User/ValueObjects/email.value-object';
import { HashedPassword } from '../../../Domain/User/ValueObjects/hashed-password.value-object';
import { IUserRepository } from '../../../Domain/User/Ports/user.repository.port';
import { UserDatabaseEntity } from '../../Persistence/entities/user.database-entity';

export class TypeORMUserRepository implements IUserRepository {
  constructor(private repository: Repository<UserDatabaseEntity>) {}

  async create(user: User): Promise<User> {
    const entity = this.repository.create({
      id: user.id.toString(),
      name: user.name,
      email: user.email.toString(),
      password_hash: user.password.hash,
      status: user.status,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      deleted_at: user.deletedAt,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: UserId): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email: email.toString() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const [entities, total] = await this.repository.findAndCount({
      where: { deleted_at: null },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: entities.map(entity => this.toDomain(entity)),
      total,
    };
  }

  async update(user: User): Promise<User> {
    await this.repository.update(user.id.toString(), {
      name: user.name,
      email: user.email.toString(),
      status: user.status,
      updated_at: user.updatedAt,
    });

    return user;
  }

  async delete(id: UserId): Promise<void> {
    await this.repository.update(id.toString(), {
      deleted_at: new Date(),
    });
  }

  private toDomain(entity: UserDatabaseEntity): User {
    return new User(
      new UserId(entity.id),
      entity.name,
      new Email(entity.email),
      this.restorePassword(entity.password_hash),
      entity.status as any,
      entity.created_at,
      entity.updated_at,
      entity.deleted_at,
    );
  }

  private restorePassword(hash: string): HashedPassword {
    return HashedPassword.fromHash(hash);
  }
}
```

### 4.4 Express Controllers

```typescript
// src/Infrastructure/Primary/controllers/user/user.controllers.ts
import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../../Application/User/UseCases/create-user.use-case';
import { mapUserToDTO } from '../../../../Application/User/DTOs/user.response.dto';

export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async handle(request: Request, response: Response): Promise<void> {
    const result = await this.createUserUseCase.execute({
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
    });

    response.status(201).json(mapUserToDTO(result));
  }
}
```

### 4.5 Middleware & Error Handling

```typescript
// src/Infrastructure/Primary/middleware/error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const traceId = request.headers['x-trace-id'] as string;

  // Map domain exceptions to HTTP status
  const statusMap: Record<string, number> = {
    'InvalidEmailFormatException': 400,
    'WeakPasswordException': 400,
    'InvalidUserIdException': 400,
    'DuplicateEmailException': 409,
    'UserNotFoundException': 404,
  };

  const status = statusMap[error.name] || 500;

  response.status(status).json({
    error: error.name,
    message: error.message,
    statusCode: status,
    timestamp: new Date().toISOString(),
    traceId,
  });
}
```

---

## Part 5: Acceptance Tests (BDD)

### 5.1 Feature File

```gherkin
# tests/acceptance/features/user-crud.feature
Feature: User CRUD Operations
  Background:
    Given the system is clean with no users

  Scenario: Create a new user
    When I create a user with:
      | name     | John Doe           |
      | email    | john@example.com   |
      | password | SecurePass123!     |
    Then the user is created successfully
    And the response contains the user ID

  Scenario: Get user by ID
    Given I have created a user with:
      | name     | Jane Smith         |
      | email    | jane@example.com   |
      | password | SecurePass123!     |
    When I retrieve the user by ID
    Then the response contains user data

  Scenario: List all users
    Given I have created 3 users
    When I request all users with limit 10
    Then I receive 3 users
    And total count is 3

  Scenario: Update user
    Given I have created a user
    When I update the user name to "Updated Name"
    Then the user is updated successfully

  Scenario: Delete user
    Given I have created a user
    When I delete the user
    Then the user is soft-deleted
    And the user is not returned in list queries
```

### 5.2 Step Definitions

```typescript
// tests/acceptance/step-definitions/user-crud.steps.ts
import { Given, When, Then, BeforeEach } from '@cucumber/cucumber';
import request from 'supertest';

let app: any;
let userId: string;
let response: any;

Given('the system is clean with no users', async () => {
  // Clear database
  await resetDatabase();
});

When('I create a user with:', async (dataTable) => {
  const data = dataTable.rowsHash();
  response = await request(app)
    .post('/api/v1/users')
    .send(data)
    .expect(201);
  userId = response.body.id;
});

Then('the user is created successfully', () => {
  expect(response.status).toBe(201);
  expect(response.body.id).toBeDefined();
});

// ... more steps
```

---

## Part 6: Testing Execution

```bash
# Run unit tests (domain + application)
pnpm run test:unit

# Run acceptance tests (E2E with real database)
pnpm run test:e2e

# Run all tests
pnpm run test
```

---

## Part 7: Development Workflow

### Code Generation

```bash
# After implementing changes
pnpm run format    # Prettier formatting
pnpm run lint      # ESLint check
pnpm run build     # TypeScript compilation
```

### Running Server

```bash
# Development mode (auto-reload)
pnpm run dev

# Production mode
pnpm run build
pnpm run start
```

### OpenAPI Documentation

Documentation will be automatically generated from JSDoc comments in controllers and served at:

```
http://localhost:3000/api-docs
```

---

## Implementation Checklist

- [ ] Domain layer: User entity, value objects, exceptions
- [ ] Domain layer: Unit tests (100% coverage)
- [ ] Application layer: Use cases (Create, Get, GetAll, Update, Delete)
- [ ] Application layer: Unit tests for use cases
- [ ] Repository port interface implemented
- [ ] TypeORM database entity and schema
- [ ] TypeORM repository implementation
- [ ] Integration tests for repository
- [ ] Express controllers for all endpoints
- [ ] Error handling middleware
- [ ] Middleware: Trace ID injection
- [ ] Middleware: Pino request logging
- [ ] Global error handler (domain exceptions → HTTP)
- [ ] OpenAPI JSDoc comments in controllers
- [ ] Swagger UI endpoint
- [ ] Acceptance tests (Gherkin scenarios)
- [ ] Acceptance test step definitions
- [ ] All tests passing (unit + integration + acceptance)
- [ ] Code review: Architecture compliance verified
- [ ] Deployment configuration

---

## Key Principles Reminder

✅ **Hexagonal Architecture**: Domain → Application → Infrastructure (one-way dependency)  
✅ **Test First**: Write failing tests before implementation  
✅ **Type Safety**: Full TypeScript with strict mode  
✅ **Error Handling**: Domain exceptions mapped to HTTP status codes in infrastructure  
✅ **Logging**: All operations traced with Pino + traceId  
✅ **No Secret Leaks**: Use .env with dotenv-safe validation  
✅ **Documentation**: OpenAPI spec auto-generated from JSDoc  
✅ **Code Quality**: Prettier + ESLint enforcement  

