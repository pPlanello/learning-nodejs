import { Given } from '@cucumber/cucumber'
import request from 'supertest'

import { createUser, ensureApp, state } from '../context'

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
