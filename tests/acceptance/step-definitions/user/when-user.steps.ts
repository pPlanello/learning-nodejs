import { When } from '@cucumber/cucumber'

import { ensureApp, state } from '../context'
import { UserAcceptanceApi } from '../api/user.api'

const userApi = new UserAcceptanceApi(ensureApp)

When('I submit the create entities request', async () => {
  state.response = await userApi.create(state.createPayload ?? {})
})

When('I request the entities by the stored id', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No stored entities id available for get request')
  }

  state.response = await userApi.getById(state.requestedUserId)
})

When('I submit the get entities request', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No entities id provided for get request')
  }

  state.response = await userApi.getById(state.requestedUserId)
})

When('I submit the update entities request', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No entities id provided for update request')
  }

  await new Promise((resolve) => setTimeout(resolve, 2))

  state.response = await userApi.update(state.requestedUserId, state.updatePayload ?? {})
})

When('I request the users list with query {string}', async (query: string) => {
  state.listQuery = query
  state.response = await userApi.list(query)
})

When('I submit the delete entities request', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No entities id provided for delete request')
  }

  state.response = await userApi.delete(state.requestedUserId)
})

When('I submit the create user request', async () => {
  state.response = await userApi.create(state.createPayload ?? {})
})

When('I request the user by the stored id', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No stored user id available for get request')
  }
  state.response = await userApi.getById(state.requestedUserId)
})

When('I submit the get user request', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No user id provided for get request')
  }
  state.response = await userApi.getById(state.requestedUserId)
})

When('I submit the update user request', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No user id provided for update request')
  }
  await new Promise((resolve) => setTimeout(resolve, 2))
  state.response = await userApi.update(
    state.requestedUserId,
    state.updatePayload ?? { name: 'Updated Name' },
  )
})

When('I submit the delete user request', async () => {
  if (state.requestedUserId === undefined) {
    throw new Error('No user id provided for delete request')
  }
  state.response = await userApi.delete(state.requestedUserId)
})
