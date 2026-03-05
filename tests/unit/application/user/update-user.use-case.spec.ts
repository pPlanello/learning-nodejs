import { type ILogger } from '@Domain/common/logger.port'
import {
  type FindAllUsersOptions,
  type FindAllUsersResult,
  type UserRepository,
} from '@Domain/repositories/user.repository'
import { Email, InvalidEmailFormatException } from '@Domain/value-objects/email.value-object'
import { HashedPassword } from '@Domain/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/value-objects/user-id.value-object'
import { User } from '@Domain/entities/user.entity'
import {
  DuplicateEmailException,
  InvalidUserIdException,
  UserNotFoundException,
} from '@Domain/exceptions/user.exceptions'

import { UpdateUserUseCase } from '@Application/user/use-cases/update-user.use-case'

describe('UpdateUserUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>
  let logger: jest.Mocked<ILogger>
  let useCase: UpdateUserUseCase

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

    useCase = new UpdateUserUseCase(userRepository, logger)
  })

  it('updates name successfully', async () => {
    const user = new User(
      new UserId(),
      'Before Name',
      new Email('before.name@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)

    const result = await useCase.execute(user.id.toString(), { name: 'After Name' })

    expect(result.name).toBe('After Name')
    expect(userRepository.update).toHaveBeenCalledTimes(1)
    expect(logger.debug).toHaveBeenCalledTimes(2)
  })

  it('updates status with partial payload', async () => {
    const user = new User(
      new UserId(),
      'Status Name',
      new Email('status.name@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)

    const result = await useCase.execute(user.id.toString(), { status: 'suspended' })

    expect(result.status).toBe('suspended')
    expect(result.email.toString()).toBe('status.name@example.com')
  })

  it('updates email when unique', async () => {
    const user = new User(
      new UserId(),
      'Email Name',
      new Email('old.email@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)
    userRepository.findByEmail.mockResolvedValue(null)

    const result = await useCase.execute(user.id.toString(), { email: 'new.email@example.com' })

    expect(result.email.toString()).toBe('new.email@example.com')
    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1)
  })

  it('allows email update when found entities with same id', async () => {
    const user = new User(
      new UserId(),
      'Same Id Name',
      new Email('same.id.old@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    const sameIdUser = new User(
      new UserId(user.id.toString()),
      'Same Id Existing',
      new Email('same.id.new@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)
    userRepository.findByEmail.mockResolvedValue(sameIdUser)

    const result = await useCase.execute(user.id.toString(), { email: 'same.id.new@example.com' })

    expect(result.email.toString()).toBe('same.id.new@example.com')
  })

  it('allows email update when duplicate is soft-deleted', async () => {
    const user = new User(
      new UserId(),
      'Target User',
      new Email('target.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    const deletedDuplicate = new User(
      new UserId(),
      'Deleted Duplicate',
      new Email('deleted.duplicate@example.com'),
      new HashedPassword('SecurePass123!'),
    )
    deletedDuplicate.delete()

    userRepository.findById.mockResolvedValue(user)
    userRepository.findByEmail.mockResolvedValue(deletedDuplicate)

    const result = await useCase.execute(user.id.toString(), {
      email: 'deleted.duplicate@example.com',
    })

    expect(result.email.toString()).toBe('deleted.duplicate@example.com')
  })

  it('throws DuplicateEmailException when another active entities has requested email', async () => {
    const user = new User(
      new UserId(),
      'Target User',
      new Email('target.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    const duplicate = new User(
      new UserId(),
      'Duplicate User',
      new Email('duplicate.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)
    userRepository.findByEmail.mockResolvedValue(duplicate)

    await expect(
      useCase.execute(user.id.toString(), { email: 'duplicate.entities@example.com' }),
    ).rejects.toBeInstanceOf(DuplicateEmailException)

    expect(userRepository.update).not.toHaveBeenCalled()
  })

  it('throws UserNotFoundException when entities does not exist', async () => {
    userRepository.findById.mockResolvedValue(null)

    await expect(
      useCase.execute('33333333-3333-4333-8333-333333333333', { name: 'No User' }),
    ).rejects.toBeInstanceOf(UserNotFoundException)
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

    await expect(
      useCase.execute(deletedUser.id.toString(), { name: 'Nope' }),
    ).rejects.toBeInstanceOf(UserNotFoundException)
  })

  it('throws InvalidEmailFormatException for invalid email', async () => {
    const user = new User(
      new UserId(),
      'Invalid Email User',
      new Email('invalid.email.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    userRepository.findById.mockResolvedValue(user)

    await expect(
      useCase.execute(user.id.toString(), { email: 'not-an-email' }),
    ).rejects.toBeInstanceOf(InvalidEmailFormatException)

    expect(userRepository.update).not.toHaveBeenCalled()
  })

  it('throws InvalidUserIdException for invalid entities id format', async () => {
    await expect(
      useCase.execute('invalid-entities-id', { name: 'Invalid Id' }),
    ).rejects.toBeInstanceOf(InvalidUserIdException)

    expect(userRepository.findById).not.toHaveBeenCalled()
  })
})
