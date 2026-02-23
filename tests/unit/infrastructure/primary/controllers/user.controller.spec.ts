import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User } from '@Domain/user/user.entity'
import {
  CreateUserController,
  DeleteUserController,
  GetAllUsersController,
  GetUserController,
  UpdateUserController,
} from '@Infrastructure/primary/controllers/user.controller'
import { BadRequestException } from '@Infrastructure/primary/exceptions/bad-request.exception'

const createUserEntity = () =>
  new User(
    new UserId(),
    'Infra Test User',
    new Email('infra.test@example.com'),
    new HashedPassword('SecurePass123!'),
  )

const createRes = () => {
  const json = jest.fn()
  const send = jest.fn()
  const status = jest.fn(() => ({ json, send }))
  return { status, json, send }
}

describe('Infrastructure User Controllers', () => {
  it('CreateUserController returns 201 for valid payload', async () => {
    const useCase = { execute: jest.fn(async () => createUserEntity()) }
    const controller = new CreateUserController(useCase as never)
    const req = {
      body: { name: 'John Doe', email: 'john.doe@example.com', password: 'SecurePass123!' },
    }
    const res = createRes()
    const next = jest.fn()

    await controller.handle(req as never, res as never, next)

    expect(useCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
    })
    expect(res.status).toHaveBeenCalledWith(201)
    expect(next).not.toHaveBeenCalled()
  })

  it('CreateUserController forwards BadRequestException for invalid payload', async () => {
    const useCase = { execute: jest.fn() }
    const controller = new CreateUserController(useCase as never)
    const req = { body: { email: 'john.doe@example.com' } }
    const res = createRes()
    const next = jest.fn()

    await controller.handle(req as never, res as never, next)

    expect(useCase.execute).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(expect.any(BadRequestException))
  })

  it('GetUserController returns 200', async () => {
    const useCase = { execute: jest.fn(async () => createUserEntity()) }
    const controller = new GetUserController(useCase as never)
    const req = { params: { id: '11111111-1111-4111-8111-111111111111' } }
    const res = createRes()

    await controller.handle(req as never, res as never, jest.fn())

    expect(useCase.execute).toHaveBeenCalledWith(req.params.id)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('GetAllUsersController maps query and returns 200', async () => {
    const user = createUserEntity()
    const useCase = {
      execute: jest.fn(async () => ({ data: [user], total: 1, page: 1, limit: 10, totalPages: 1 })),
    }
    const controller = new GetAllUsersController(useCase as never)
    const req = {
      query: { page: '1', limit: '10', status: 'active', sortBy: 'createdAt', sortOrder: 'desc' },
    }
    const res = createRes()

    await controller.handle(req as never, res as never, jest.fn())

    expect(useCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10, status: 'active' }),
    )
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('UpdateUserController returns 200', async () => {
    const user = createUserEntity()
    const useCase = { execute: jest.fn(async () => user) }
    const controller = new UpdateUserController(useCase as never)
    const req = { params: { id: user.id.toString() }, body: { name: 'Updated' } }
    const res = createRes()

    await controller.handle(req as never, res as never, jest.fn())

    expect(useCase.execute).toHaveBeenCalledWith(user.id.toString(), {
      name: 'Updated',
      email: undefined,
      status: undefined,
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('DeleteUserController returns 204', async () => {
    const useCase = { execute: jest.fn(async () => undefined) }
    const controller = new DeleteUserController(useCase as never)
    const req = { params: { id: '11111111-1111-4111-8111-111111111111' } }
    const res = createRes()

    await controller.handle(req as never, res as never, jest.fn())

    expect(useCase.execute).toHaveBeenCalledWith(req.params.id)
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
