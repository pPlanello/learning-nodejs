import request from 'supertest'

import {
  type FindAllUsersOptions,
  type IUserRepository,
} from '@Domain/user/ports/user.repository.port'
import { Email } from '@Domain/user/value-objects/email.value-object'
import { type UserId } from '@Domain/user/value-objects/user-id.value-object'
import { type User } from '@Domain/user/user.entity'

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://local:test@localhost:5432/testdb'

const { PinoLoggerAdapter } = require('@Infrastructure/adapters/pino-logger.adapter')
const { buildApp } = require('@Infrastructure/primary/server')

class TestUserRepository implements IUserRepository {
  private readonly usersById = new Map<string, User>()

  public async create(user: User): Promise<User> {
    this.usersById.set(user.id.toString(), user)
    return user
  }

  public async findById(id: UserId): Promise<User | null> {
    return this.usersById.get(id.toString()) ?? null
  }

  public async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.usersById.values()) {
      if (user.email.toString() === email.toString()) {
        return user
      }
    }

    return null
  }

  public async findAll(options: FindAllUsersOptions): Promise<{ data: User[]; total: number }> {
    const users = [...this.usersById.values()].filter((user) => user.deletedAt === null)
    const offset = (options.page - 1) * options.limit
    const data = users.slice(offset, offset + options.limit)

    return {
      data,
      total: users.length,
    }
  }

  public async update(user: User): Promise<User> {
    this.usersById.set(user.id.toString(), user)
    return user
  }
}

describe('HTTP app infrastructure', () => {
  const app = buildApp({
    userRepository: new TestUserRepository(),
    logger: new PinoLoggerAdapter(),
  })

  it('serves OpenAPI JSON', async () => {
    const response = await request(app).get('/api-docs/openapi.json')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ openapi: '3.0.0' }))
  })

  it('runs basic create/get flow and returns trace headers', async () => {
    const created = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'Infra Http User',
        email: `infra.http.${Date.now()}@example.com`,
        password: 'SecurePass123!',
      })

    expect(created.status).toBe(201)
    expect(created.headers['x-trace-id']).toBeDefined()
    expect(created.body.password).toBeUndefined()
    expect(created.body.password_hash).toBeUndefined()

    const found = await request(app).get(`/api/v1/users/${created.body.id}`)
    expect(found.status).toBe(200)
  })

  it('maps invalid request errors with traceId and no stack', async () => {
    const response = await request(app).get('/api/v1/users/invalid-id')

    expect(response.status).toBe(400)
    expect(response.body.traceId).toBeDefined()
    expect(response.body.stack).toBeUndefined()
  })
})
