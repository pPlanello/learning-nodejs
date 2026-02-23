import { type ILogger } from '@Domain/common/logger.port'
import {
  type FindAllUsersResult,
  type FindAllUsersOptions,
  type IUserRepository,
} from '@Domain/user/ports/user.repository.port'
import { Email, InvalidEmailFormatException } from '@Domain/user/value-objects/email.value-object'
import {
  HashedPassword,
  WeakPasswordException,
} from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User } from '@Domain/user/user.entity'
import { DuplicateEmailException } from '@Domain/user/user.exceptions'

import { CreateUserUseCase } from '@Application/user/use-cases/create-user.use-case'

describe('CreateUserUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>
  let logger: jest.Mocked<ILogger>
  let useCase: CreateUserUseCase

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

    useCase = new CreateUserUseCase(userRepository, logger)
  })

  it('creates a user when email is unique', async () => {
    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
    })

    expect(result).toBeInstanceOf(User)
    expect(result.email.toString()).toBe('john.doe@example.com')
    expect(userRepository.findByEmail).toHaveBeenCalledWith(new Email('john.doe@example.com'))
    expect(userRepository.create).toHaveBeenCalledTimes(1)
    expect(logger.debug).toHaveBeenCalledTimes(2)
    expect(logger.info).toHaveBeenCalledTimes(1)
  })

  it('throws DuplicateEmailException when an active user with same email exists', async () => {
    userRepository.findByEmail.mockResolvedValue(
      new User(
        new UserId(),
        'Existing User',
        new Email('existing@example.com'),
        new HashedPassword('SecurePass123!'),
      ),
    )

    await expect(
      useCase.execute({
        name: 'Another User',
        email: 'existing@example.com',
        password: 'SecurePass123!',
      }),
    ).rejects.toBeInstanceOf(DuplicateEmailException)

    expect(userRepository.create).not.toHaveBeenCalled()
  })

  it('allows creating a user when the existing user with same email is deleted', async () => {
    const deletedUser = new User(
      new UserId(),
      'Deleted User',
      new Email('deleted@example.com'),
      new HashedPassword('SecurePass123!'),
    )
    deletedUser.delete()

    userRepository.findByEmail.mockResolvedValue(deletedUser)

    const result = await useCase.execute({
      name: 'Recovered User',
      email: 'deleted@example.com',
      password: 'SecurePass123!',
    })

    expect(result.email.toString()).toBe('deleted@example.com')
    expect(userRepository.create).toHaveBeenCalledTimes(1)
  })

  it('throws InvalidEmailFormatException for invalid email', async () => {
    await expect(
      useCase.execute({
        name: 'Bad Email',
        email: 'not-an-email',
        password: 'SecurePass123!',
      }),
    ).rejects.toBeInstanceOf(InvalidEmailFormatException)

    expect(userRepository.findByEmail).not.toHaveBeenCalled()
    expect(userRepository.create).not.toHaveBeenCalled()
  })

  it('throws WeakPasswordException for weak passwords', async () => {
    await expect(
      useCase.execute({
        name: 'Weak Password',
        email: 'weak.password@example.com',
        password: '123',
      }),
    ).rejects.toBeInstanceOf(WeakPasswordException)

    expect(userRepository.create).not.toHaveBeenCalled()
  })
})
