import { type ILogger } from '@Domain/common/logger.port'
import { logger } from '@Infrastructure/config/logger.config'

export class PinoLoggerAdapter implements ILogger {
  public debug(message: string, context?: Record<string, unknown>): void {
    logger.debug(context ?? {}, message)
  }

  public info(message: string, context?: Record<string, unknown>): void {
    logger.info(context ?? {}, message)
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    logger.warn(context ?? {}, message)
  }

  public error(message: string, context?: Record<string, unknown>): void {
    logger.error(context ?? {}, message)
  }
}
