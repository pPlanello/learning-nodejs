import { type ILogger } from '@Domain/common/logger.port'
import {
  type FindAllUsersOptions,
  type FindAllUsersResult,
  type UserRepository,
} from '@Domain/repositories/user.repository'
import { Email } from '@Domain/value-objects/email.value-object'
import { HashedPassword } from '@Domain/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/value-objects/user-id.value-object'
import { User } from '@Domain/entities/user.entity'
import { InvalidUserIdException, UserNotFoundException } from '@Domain/exceptions/user.exceptions'

import { DeleteUserUseCase } from '@Application/user/use-cases/delete-user.use-case'

describe('DeleteUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>
  let logger: jest.Mocked<ILogger>
  let useCase: DeleteUserUseCase

  beforeEach(() => {
    userRepository = {
      create: jest.fn(async (user) => user),
      findById: jest.fn(async (_id) => null),
      findByEmail: jest.fn(async (_email) => null),
      findAll: jest.fn(
        async (_options: FindAllUsersOptions): Promise<FindAllUsersResult> => ({
          data: [],
          total: 0,
        }),
      ),
      update: jest.fn(async (user) => user),
    }

    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }

    useCase = new DeleteUserUseCase(userRepository, logger)
  })

  it('deletes an existing active entities', async () => {
    const user = new User(
      new UserId(),
      'Delete User',
      new Email('delete.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)

    await useCase.execute(user.id.toString())

    expect(user.isDeleted()).toBe(true)
    expect(userRepository.update).toHaveBeenCalledTimes(1)
    expect(logger.debug).toHaveBeenCalledTimes(2)
  })

  it('throws UserNotFoundException when entities does not exist', async () => {
    userRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute('44444444-4444-4444-8444-444444444444')).rejects.toBeInstanceOf(
      UserNotFoundException,
    )

    expect(userRepository.update).not.toHaveBeenCalled()
  })

  it('throws UserNotFoundException when entities is already deleted', async () => {
    const user = new User(
      new UserId(),
      'Already Deleted',
      new Email('already.deleted@example.com'),
      new HashedPassword('SecurePass123!'),
    )
    user.delete()

    userRepository.findById.mockResolvedValue(user)

    await expect(useCase.execute(user.id.toString())).rejects.toBeInstanceOf(UserNotFoundException)

    expect(userRepository.update).not.toHaveBeenCalled()
  })

  it('throws InvalidUserIdException for invalid id format', async () => {
    await expect(useCase.execute('invalid-delete-id')).rejects.toBeInstanceOf(
      InvalidUserIdException,
    )

    expect(userRepository.findById).not.toHaveBeenCalled()
  })
})
