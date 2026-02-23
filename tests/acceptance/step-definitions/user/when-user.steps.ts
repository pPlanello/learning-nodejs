import { When } from '@cucumber/cucumber'
import request from 'supertest'

import { ensureApp, state } from '../context'

When('I submit the create user request', async () => {
  const app = ensureApp()
  state.response = await request(app).post('/api/v1/users').send(state.createPayload)
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
