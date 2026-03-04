import {
  DuplicateEmailException,
  InvalidUserIdException,
  UserNotFoundException,
} from '@Domain/exceptions/user.exceptions'
import { InvalidEmailFormatException } from '@Domain/value-objects/email.value-object'
import { WeakPasswordException } from '@Domain/value-objects/hashed-password.value-object'
import { BadRequestException } from '@Infrastructure/primary/exceptions/bad-request.exception'
import { errorHandlerMiddleware } from '@Infrastructure/primary/middleware/error-handler.middleware'

describe('errorHandlerMiddleware', () => {
  const createRes = () => {
    const json = jest.fn()
    const status = jest.fn(() => ({ json }))
    return { status, json }
  }

  it.each([
    [new InvalidEmailFormatException('bad'), 400],
    [new WeakPasswordException(), 400],
    [new InvalidUserIdException('bad-id'), 400],
    [new BadRequestException('bad request'), 400],
    [new UserNotFoundException('entities-id'), 404],
    [new DuplicateEmailException('email@example.com'), 409],
  ])('maps %s to status %i', (error, expectedStatus) => {
    const req = { traceId: 'trace-1' }
    const res = createRes()
    const next = jest.fn()

    errorHandlerMiddleware(error as Error, req as never, res as never, next)

    expect(res.status).toHaveBeenCalledWith(expectedStatus)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: (error as Error).name,
        statusCode: expectedStatus,
        traceId: 'trace-1',
      }),
    )
  })

  it('returns generic 500 message for unknown errors', () => {
    const req = { traceId: 'trace-2' }
    const res = createRes()

    errorHandlerMiddleware(new Error('internal details'), req as never, res as never, jest.fn())

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
        statusCode: 500,
        traceId: 'trace-2',
      }),
    )
  })
})
