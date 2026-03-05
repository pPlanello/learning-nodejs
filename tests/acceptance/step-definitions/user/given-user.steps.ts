import { Given } from '@cucumber/cucumber'

import { ensureApp, state } from '../context'
import { UserAcceptanceApi } from '../api/user.api'

const userApi = new UserAcceptanceApi(ensureApp)

Given('I have a valid create user payload', () => {
  state.createPayload = {
    name: 'Create User',
    email: `create.user.${Date.now()}@example.com`,
    password: 'SecurePass123!',
  }
})

Given('an existing user with email {string}', async (email: string) => {
  await userApi.createDefault('Existing User', email)
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
  state.requestedUserId = await userApi.createDefault(
    'Existing User',
    `existing.user.${Date.now()}@example.com`,
  )
})

Given('I request user id {string}', (id: string) => {
  state.requestedUserId = id
})

Given('a deleted user in the system', async () => {
  const userId = await userApi.createDefault(
    'Deleted User',
    `deleted.user.${Date.now()}@example.com`,
  )
  await userApi.delete(userId)
  state.requestedUserId = userId
})

Given('an existing user to update', async () => {
  state.requestedUserId = await userApi.createDefault(
    'Update User',
    `update.user.${Date.now()}@example.com`,
  )
})

Given('another existing user with email {string}', async (email: string) => {
  await userApi.createDefault('Another User', email)
})

Given('an existing user to delete', async () => {
  state.requestedUserId = await userApi.createDefault(
    'Delete User',
    `delete.user.${Date.now()}@example.com`,
  )
})

Given('an already deleted user', async () => {
  const userId = await userApi.createDefault(
    'Already Deleted User',
    `already.deleted.user.${Date.now()}@example.com`,
  )
  await userApi.delete(userId)
  state.requestedUserId = userId
})

Given('I have {int} active users in the system', async (count: number) => {
  for (let i = 0; i < count; i++) {
    await userApi.createDefault(`Active User ${i}`, `active.user.${i}.${Date.now()}@example.com`)
  }
})

Given('I have users with mixed statuses', async () => {
  const suspendedUserId = await userApi.createDefault(
    'Suspended User',
    `suspended.user.${Date.now()}@example.com`,
  )
  await userApi.update(suspendedUserId, { status: 'suspended' })
  await userApi.createDefault('Active User', `active.user.${Date.now()}@example.com`)
})

Given('I have users where one is soft deleted', async () => {
  const deletedUserId = await userApi.createDefault(
    'Soft Deleted User',
    `soft.deleted.user.${Date.now()}@example.com`,
  )
  await userApi.delete(deletedUserId)
  await userApi.createDefault('Active User', `active.user.${Date.now()}@example.com`)
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
