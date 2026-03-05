import pinoHttp from 'pino-http'
import { type Request } from 'express'

import { logger } from '@Infrastructure/config/logger.config'

export const requestLoggerMiddleware = pinoHttp({
  logger,
  customProps: (req) => ({
    traceId: (req as Request & { traceId?: string }).traceId,
  }),
})
