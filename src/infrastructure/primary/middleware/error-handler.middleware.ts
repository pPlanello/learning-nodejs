import { InvalidEmailFormatException } from '@Domain/user/value-objects/email.value-object'
import { WeakPasswordException } from '@Domain/user/value-objects/hashed-password.value-object'
import {
  DuplicateEmailException,
  InvalidUserIdException,
  InvalidUserStatusException,
  UserNotFoundException,
} from '@Domain/user/user.exceptions'
import { type NextFunction, type Request, type Response } from 'express'

import { BadRequestException } from '../exceptions/bad-request.exception'

const mapErrorToStatusCode = (error: Error): number => {
  if (
    error instanceof InvalidEmailFormatException ||
    error instanceof WeakPasswordException ||
    error instanceof InvalidUserIdException ||
    error instanceof InvalidUserStatusException ||
    error instanceof BadRequestException
  ) {
    return 400
  }

  if (error instanceof UserNotFoundException) {
    return 404
  }

  if (error instanceof DuplicateEmailException) {
    return 409
  }

  return 500
}

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  void next
  const statusCode = mapErrorToStatusCode(error)

  res.status(statusCode).json({
    error: error.name,
    message: statusCode === 500 ? 'Internal server error' : error.message,
    statusCode,
    timestamp: new Date().toISOString(),
    traceId: (req as Request & { traceId?: string }).traceId,
  })
}
