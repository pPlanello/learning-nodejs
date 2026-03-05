import { Then } from '@cucumber/cucumber'

import { state } from '../context'

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
    throw new Error('Response should not contain password or password_hash fields')
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
    throw new Error(`Expected updated name ${name} but got ${state.response.body.name}`)
  }
})

Then('the response updatedAt should be changed', () => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (!state.response.body.updatedAt) {
    throw new Error('Expected updatedAt field in response')
  }
})

Then('the response should contain updated status {string}', (status: string) => {
  if (state.response === undefined) {
    throw new Error('No response available for assertion')
  }

  if (state.response.body.status !== status) {
    throw new Error(`Expected updated status ${status} but got ${state.response.body.status}`)
  }
})
