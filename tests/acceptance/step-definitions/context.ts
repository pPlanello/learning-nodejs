import request, { type Response } from 'supertest'

import { PinoLoggerAdapter } from '@Infrastructure/adapters/pino-logger.adapter'
import { buildApp } from '@Infrastructure/primary/server'
import { InMemoryUserRepository } from '@Infrastructure/secondary/repositories/in-memory-user.repository'

export interface AcceptanceState {
  app?: ReturnType<typeof buildApp>
  response?: Response
  createPayload?: Record<string, unknown>
  updatePayload?: Record<string, unknown>
  requestedUserId?: string
  requestedUserEmail?: string
  previousUpdatedAt?: string
  listQuery?: string
}

export const state: AcceptanceState = {}

let inMemoryUserRepository = new InMemoryUserRepository()

export const resetAcceptanceContext = (): void => {
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
}

export const ensureApp = (): ReturnType<typeof buildApp> => {
  if (state.app === undefined) {
    state.app = buildApp({
      userRepository: inMemoryUserRepository,
      logger: new PinoLoggerAdapter(),
    })
  }

  return state.app
}

export const createUser = async (name: string, email: string): Promise<string> => {
  const app = ensureApp()
  const response = await request(app).post('/api/v1/users').send({
    name,
    email,
    password: 'SecurePass123!',
  })

  return response.body.id as string
}
