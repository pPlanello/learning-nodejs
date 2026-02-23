import request, { type Response } from 'supertest'

import { PinoLoggerAdapter } from '@Infrastructure/adapters/pino-logger.adapter'
import { AppDataSource } from '@Infrastructure/config/database.config'
import { buildApp } from '@Infrastructure/primary/server'

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

export const initializeAcceptanceDatabase = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }
}

export const clearAcceptanceDatabase = async (): Promise<void> => {
  await AppDataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE')
}

export const closeAcceptanceDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
  }
}

export const resetAcceptanceContext = (): void => {
  state.app = buildApp({
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
