import { Before, Given, Then, When } from '@cucumber/cucumber'
import request, { Response } from 'supertest'

import { PinoLoggerAdapter } from '@Infrastructure/adapters/pino-logger.adapter'
import { buildApp } from '@Infrastructure/primary/server'
import { InMemoryUserRepository } from '@Infrastructure/secondary/repositories/in-memory-user.repository'

const state: {
  app?: ReturnType<typeof buildApp>
  response?: Response
  createPayload?: Record<string, unknown>
  updatePayload?: Record<string, unknown>
  requestedUserId?: string
  requestedUserEmail?: string
  previousUpdatedAt?: string
  listQuery?: string
} = {}

let inMemoryUserRepository = new InMemoryUserRepository()

Before(() => {
  inMemoryUserRepository = new InMemoryUserRepository()
  state.app = buildApp({
    userRepository: inMemoryUserRepository,
    logger: new PinoLoggerAdapter(),
  })
  state.response = undefined
  state.createPayload = undefined
  state.updatePayload = undefined
  state.requestedUserId = undefined
  state.requestedUserEmail = undefined
  state.previousUpdatedAt = undefined
  state.listQuery = undefined
})

const ensureApp = (): ReturnType<typeof buildApp> => {
  if (state.app === undefined) {
    state.app = buildApp({
      userRepository: inMemoryUserRepository,
      logger: new PinoLoggerAdapter(),
    })
  }

  return state.app
}

const createUser = async (name: string, email: string): Promise<string> => {
  const app = ensureApp()
  const response = await request(app).post('/api/v1/users').send({
    name,
    email,
    password: 'SecurePass123!',
  })

  return response.body.id as string
}

Given('I have a valid create user payload', () => {
  state.createPayload = {
    name: 'Create User',
    email: `create.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  }
})

Given('an existing user with email {string}', async (email: string) => {
  const app = ensureApp()
  await request(app).post('/api/v1/users').send({
    name: 'Existing User',
    email,
    password: 'SecurePass123!',
  })
})

Given('I have a create user payload with email {string}', (email: string) => {
  state.createPayload = {
    name: 'Duplicate Candidate',
    email,
    password: 'SecurePass123!',
  }
})

Given('I have an invalid create user payload with missing required fields', () => {
  state.createPayload = {
    email: `missing.fields.${Date.now()}@example.com`,
  }
})

Given('I have a create user payload with weak password', () => {
  state.createPayload = {
    name: 'Weak Password User',
    email: `weak.password.${Date.now()}@example.com`,
    password: 'weak',
  }
})

When('I submit the create user request', async () => {
  const app = ensureApp()
  state.response = await request(app).post('/api/v1/users').send(state.createPayload)
})

Given('an existing user in the system', async () => {
  const app = ensureApp()
  const response = await request(app)
    .post('/api/v1/users')
    .send({
      name: 'Get User Existing',
      email: `get.user.${Date.now()}@example.com`,
      password: 'SecurePass123!',
    })

  state.requestedUserId = response.body.id as string
})

Given('an existing user to update', async () => {
  const app = ensureApp()
  const response = await request(app)
    .post('/api/v1/users')
    .send({
      name: 'Update Candidate',
      email: `update.candidate.${Date.now()}@example.com`,
      password: 'SecurePass123!',
    })

  state.requestedUserId = response.body.id as string
  state.requestedUserEmail = response.body.email as string
  state.previousUpdatedAt = response.body.updatedAt as string
})

Given('another existing user with email {string}', async (email: string) => {
  await createUser('Update Other User', email)
})

Given('I have an update payload with name {string}', (name: string) => {
  state.updatePayload = { name }
})

Given('I have an update payload with email {string}', (email: string) => {
  state.updatePayload = { email }
})

Given('I have an update payload with status {string}', (status: string) => {
  state.updatePayload = { status }
})

Given('I request user id {string}', (userId: string) => {
  state.requestedUserId = userId
})

Given('a deleted user in the system', async () => {
  const app = ensureApp()
  state.requestedUserId = await createUser('Deleted User', `deleted.user.${Date.now()}@example.com`)
  await request(app).delete(`/api/v1/users/${state.requestedUserId}`)
})

Given('I have {int} active users in the system', async (count: number) => {
  for (let index = 0; index < count; index += 1) {
    await createUser(`List User ${index + 1}`, `list.user.${Date.now()}.${index}@example.com`)
  }
})

Given('I have users with mixed statuses', async () => {
  const app = ensureApp()
  const activeUserId = await createUser('Status Active', `status.active.${Date.now()}@example.com`)
  const suspendedUserId = await createUser(
    'Status Suspended',
    `status.suspended.${Date.now()}@example.com`,
  )

  await request(app).patch(`/api/v1/users/${activeUserId}`).send({ status: 'active' })
  await request(app).patch(`/api/v1/users/${suspendedUserId}`).send({ status: 'suspended' })
})

Given('I have users where one is soft deleted', async () => {
  const app = ensureApp()
  const activeUserId = await createUser('List Active', `list.active.${Date.now()}@example.com`)
  const deletedUserId = await createUser('List Deleted', `list.deleted.${Date.now()}@example.com`)

  state.requestedUserId = activeUserId
  await request(app).delete(`/api/v1/users/${deletedUserId}`)
})

Given('an existing user to delete', async () => {
  state.requestedUserId = await createUser(
    'Delete Candidate',
    `delete.candidate.${Date.now()}@example.com`,
  )
})

Given('an already deleted user', async () => {
  const app = ensureApp()
  state.requestedUserId = await createUser(
    'Already Deleted',
    `already.deleted.${Date.now()}@example.com`,
  )
  await request(app).delete(`/api/v1/users/${state.requestedUserId}`)
})

When('I request the user by the stored id', async () => {
  const app = ensureApp()

  if (state.requestedUserId === undefined) {
    throw new Error('No stored user id available for get request')
  }

  state.response = await request(app).get(`/api/v1/users/${state.requestedUserId}`)
})

When('I submit the get user request', async () => {
  const app = ensureApp()

  if (state.requestedUserId === undefined) {
    throw new Error('No user id provided for get request')
  }

  state.response = await request(app).get(`/api/v1/users/${state.requestedUserId}`)
})

When('I submit the update user request', async () => {
  const app = ensureApp()

  if (state.requestedUserId === undefined) {
    throw new Error('No user id provided for update request')
  }

  await new Promise((resolve) => setTimeout(resolve, 2))

  state.response = await request(app)
    .patch(`/api/v1/users/${state.requestedUserId}`)
    .send(state.updatePayload)
})

When('I request the users list with query {string}', async (query: string) => {
  const app = ensureApp()
  state.listQuery = query
  state.response = await request(app).get(`/api/v1/users${query}`)
})

When('I submit the delete user request', async () => {
  const app = ensureApp()

  if (state.requestedUserId === undefined) {
    throw new Error('No user id provided for delete request')
  }

  state.response = await request(app).delete(`/api/v1/users/${state.requestedUserId}`)
})

Then('the response status should be {int}', (statusCode: number) => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (state.response.status !== statusCode) {
    throw new Error(`Expected status ${statusCode} but received ${state.response.status}`)
  }
})

Then('the response should contain a generated user id', () => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (typeof state.response.body.id !== 'string' || state.response.body.id.trim() === '') {
    throw new Error('Expected response body to contain a non-empty id')
  }
})

Then('the response should contain the requested user id', () => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (state.requestedUserId === undefined) {
    throw new Error('No requested user id available for assertion')
  }

  if (state.response.body.id !== state.requestedUserId) {
    throw new Error(
      `Expected response id ${state.requestedUserId} but received ${String(state.response.body.id)}`,
    )
  }
})

Then('the response should not contain password fields', () => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if ('password' in state.response.body || 'password_hash' in state.response.body) {
    throw new Error('Response must not contain password or password_hash fields')
  }
})

Then(
  'the pagination metadata should be page {int} limit {int} total {int} totalPages {int}',
  (page: number, limit: number, total: number, totalPages: number) => {
    if (state.response === undefined) {
      throw new Error('No response available for assertion')
    }

    if (
      state.response.body.page !== page ||
      state.response.body.limit !== limit ||
      state.response.body.total !== total ||
      state.response.body.totalPages !== totalPages
    ) {
      throw new Error(`Unexpected pagination metadata: ${JSON.stringify(state.response.body)}`)
    }
  },
)

Then('the users list should contain {int} items', (itemsCount: number) => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (!Array.isArray(state.response.body.data)) {
    throw new Error('Response body data is not an array')
  }

  if (state.response.body.data.length !== itemsCount) {
    throw new Error(
      `Expected ${itemsCount} users but got ${String(state.response.body.data.length)}`,
    )
  }
})

Then('all listed users should have status {string}', (expectedStatus: string) => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (!Array.isArray(state.response.body.data)) {
    throw new Error('Response body data is not an array')
  }

  const allMatch = state.response.body.data.every(
    (user: Record<string, unknown>) => user.status === expectedStatus,
  )

  if (!allMatch) {
    throw new Error(`Not all users have expected status ${expectedStatus}`)
  }
})

Then('the response should contain updated name {string}', (name: string) => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (state.response.body.name !== name) {
    throw new Error(
      `Expected updated name ${name} but received ${String(state.response.body.name)}`,
    )
  }
})

Then('the response updatedAt should be changed', () => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (state.previousUpdatedAt === undefined) {
    throw new Error('No previous updatedAt value available for assertion')
  }

  const previous = new Date(state.previousUpdatedAt).getTime()
  const current = new Date(String(state.response.body.updatedAt)).getTime()

  if (Number.isNaN(previous) || Number.isNaN(current)) {
    throw new Error('Invalid updatedAt values for comparison')
  }

  if (current <= previous) {
    throw new Error('Expected updatedAt to be greater than previous updatedAt')
  }
})

Then('the response should contain updated status {string}', (status: string) => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (state.response.body.status !== status) {
    throw new Error(
      `Expected updated status ${status} but received ${String(state.response.body.status)}`,
    )
  }
})
