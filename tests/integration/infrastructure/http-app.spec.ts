import request from 'supertest'

import { InMemoryUserRepository } from '@Infrastructure/secondary/repositories/in-memory-user.repository'

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://local:test@localhost:5432/testdb'

const { PinoLoggerAdapter } = require('@Infrastructure/adapters/pino-logger.adapter')
const { buildApp } = require('@Infrastructure/primary/server')

describe('HTTP app infrastructure', () => {
  const app = buildApp({
    userRepository: new InMemoryUserRepository(),
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
