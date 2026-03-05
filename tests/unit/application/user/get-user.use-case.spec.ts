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

import { GetUserUseCase } from '@Application/user/use-cases/get-user.use-case'

describe('GetUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>
  let logger: jest.Mocked<ILogger>
  let useCase: GetUserUseCase

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

    useCase = new GetUserUseCase(userRepository, logger)
  })

  it('returns entities when found and active', async () => {
    const user = new User(
      new UserId(),
      'Existing User',
      new Email('existing.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)

    const result = await useCase.execute(user.id.toString())

    expect(result).toBe(user)
    expect(userRepository.findById).toHaveBeenCalledTimes(1)
    expect(logger.debug).toHaveBeenCalledTimes(2)
  })

  it('throws UserNotFoundException when entities does not exist', async () => {
    userRepository.findById.mockResolvedValue(null)

    await expect(useCase.execute('11111111-1111-4111-8111-111111111111')).rejects.toBeInstanceOf(
      UserNotFoundException,
    )
  })

  it('throws UserNotFoundException when entities is deleted', async () => {
    const deletedUser = new User(
      new UserId(),
      'Deleted User',
      new Email('deleted.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )
    deletedUser.delete()

    userRepository.findById.mockResolvedValue(deletedUser)

    await expect(useCase.execute(deletedUser.id.toString())).rejects.toBeInstanceOf(
      UserNotFoundException,
    )
  })

  it('throws InvalidUserIdException for invalid entities id format', async () => {
    await expect(useCase.execute('invalid-entities-id')).rejects.toBeInstanceOf(
      InvalidUserIdException,
    )
    expect(userRepository.findById).not.toHaveBeenCalled()
  })
})
