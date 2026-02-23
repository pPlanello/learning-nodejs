import 'reflect-metadata'

import express from 'express'

import { type ILogger } from '@Domain/common/logger.port'
import { type IUserRepository } from '@Domain/user/ports/user.repository.port'
import { AppDataSource } from '@Infrastructure/config/database.config'
import { PinoLoggerAdapter } from '@Infrastructure/adapters/pino-logger.adapter'
import { InMemoryUserRepository } from '@Infrastructure/secondary/repositories/in-memory-user.repository'

import { errorHandlerMiddleware } from './middleware/error-handler.middleware'
import { requestLoggerMiddleware } from './middleware/request-logger.middleware'
import { traceIdMiddleware } from './middleware/trace-id.middleware'
import { setupSwagger } from './openapi/swagger-config'
import { createUserRoutes } from './routes/user/user.routes'

interface BuildAppDependencies {
  userRepository?: IUserRepository
  logger?: ILogger
}

const buildApp = (dependencies: BuildAppDependencies = {}): express.Express => {
  const app = express()

  app.use(express.json())
  app.use(traceIdMiddleware)
  app.use(requestLoggerMiddleware)
  setupSwagger(app)
  app.use('/api/v1', createUserRoutes(dependencies))
  app.use(errorHandlerMiddleware)

  return app
}

const start = async (): Promise<void> => {
  const useInMemoryRepository = process.env.USE_IN_MEMORY_REPOSITORY === 'true'

  if (!useInMemoryRepository && !AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }

  const dependencies = useInMemoryRepository
    ? {
        userRepository: new InMemoryUserRepository(),
        logger: new PinoLoggerAdapter(),
      }
    : {}

  const app = buildApp(dependencies)
  const port = Number(process.env.PORT ?? 3000)

  app.listen(port)
}

if (require.main === module) {
  void start()
}

export { buildApp }
