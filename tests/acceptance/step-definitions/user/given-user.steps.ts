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
  const res = await request(app).post('/api/v1/users').send({
    name: 'Existing User',
    email: `existing.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  state.requestedUserId = res.body.id
})

Given('I request user id {string}', (id: string) => {
  state.requestedUserId = id
})

Given('a deleted user in the system', async () => {
  const app = ensureApp()
  const res = await request(app).post('/api/v1/users').send({
    name: 'Deleted User',
    email: `deleted.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  await request(app).delete(`/api/v1/users/${res.body.id}`)
  state.requestedUserId = res.body.id
})

Given('an existing user to update', async () => {
  const app = ensureApp()
  const res = await request(app).post('/api/v1/users').send({
    name: 'Update User',
    email: `update.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  state.requestedUserId = res.body.id
})

Given('another existing user with email {string}', async (email: string) => {
  const app = ensureApp()
  await request(app).post('/api/v1/users').send({
    name: 'Another User',
    email,
    password: 'SecurePass123!',
  })
})

Given('an existing user to delete', async () => {
  const app = ensureApp()
  const res = await request(app).post('/api/v1/users').send({
    name: 'Delete User',
    email: `delete.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  state.requestedUserId = res.body.id
})

Given('an already deleted user', async () => {
  const app = ensureApp()
  const res = await request(app).post('/api/v1/users').send({
    name: 'Already Deleted User',
    email: `already.deleted.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  await request(app).delete(`/api/v1/users/${res.body.id}`)
  state.requestedUserId = res.body.id
})

Given('I have {int} active users in the system', async (count: number) => {
  const app = ensureApp()
  for (let i = 0; i < count; i++) {
    await request(app).post('/api/v1/users').send({
      name: `Active User ${i}`,
      email: `active.user.${i}.${Date.now()}@example.com`,
      password: 'SecurePass123!',
    })
  }
})

Given('I have users with mixed statuses', async () => {
  const app = ensureApp()
  // Create suspended user
  const resSuspended = await request(app).post('/api/v1/users').send({
    name: 'Suspended User',
    email: `suspended.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  await request(app)
    .patch(`/api/v1/users/${resSuspended.body.id}`)
    .send({ status: 'suspended' })
  // Create active user
  await request(app).post('/api/v1/users').send({
    name: 'Active User',
    email: `active.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
})

Given('I have users where one is soft deleted', async () => {
  const app = ensureApp()
  const res = await request(app).post('/api/v1/users').send({
    name: 'Soft Deleted User',
    email: `soft.deleted.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
  await request(app).delete(`/api/v1/users/${res.body.id}`)
  await request(app).post('/api/v1/users').send({
    name: 'Active User',
    email: `active.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  })
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
