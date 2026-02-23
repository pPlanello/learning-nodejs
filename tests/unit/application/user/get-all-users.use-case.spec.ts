import { type ILogger } from '@Domain/common/logger.port'
import {
  type FindAllUsersOptions,
  type FindAllUsersResult,
  type IUserRepository,
} from '@Domain/user/ports/user.repository.port'
import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User } from '@Domain/user/user.entity'

import { GetAllUsersUseCase } from '@Application/user/use-cases/get-all-users.use-case'

describe('GetAllUsersUseCase', () => {
  let userRepository: jest.Mocked<IUserRepository>
  let logger: jest.Mocked<ILogger>
  let useCase: GetAllUsersUseCase

  beforeEach(() => {
    userRepository = {
      create: jest.fn(async (user) => user),
      findById: jest.fn(async (_id) => null),
      findByEmail: jest.fn(async (_email) => null),
      findAll: jest.fn(
        async (_options: FindAllUsersOptions): Promise<FindAllUsersResult> => ({
          data: [
            new User(
              new UserId(),
              'Listed User',
              new Email('listed.user@example.com'),
              new HashedPassword('SecurePass123!'),
            ),
          ],
          total: 1,
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

    useCase = new GetAllUsersUseCase(userRepository, logger)
  })

  it('returns paginated users using defaults', async () => {
    const result = await useCase.execute({})

    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(1)
    expect(result.totalPages).toBe(1)
    expect(result.data).toHaveLength(1)
    expect(userRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      createdAtFrom: undefined,
      createdAtTo: undefined,
    })
    expect(logger.debug).toHaveBeenCalledTimes(2)
  })

  it('forwards explicit pagination and filters', async () => {
    await useCase.execute({
      page: 2,
      limit: 20,
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'asc',
      createdAtFrom: '2025-01-01T00:00:00.000Z',
      createdAtTo: '2025-12-31T23:59:59.999Z',
    })

    expect(userRepository.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 20,
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'asc',
      createdAtFrom: new Date('2025-01-01T00:00:00.000Z'),
      createdAtTo: new Date('2025-12-31T23:59:59.999Z'),
    })
  })

  it('throws for invalid page', async () => {
    await expect(useCase.execute({ page: 0 })).rejects.toThrow(
      'Invalid page parameter. Page must be an integer >= 1',
    )
  })

  it('throws for invalid limit', async () => {
    await expect(useCase.execute({ limit: 101 })).rejects.toThrow(
      'Invalid limit parameter. Limit must be an integer between 1 and 100',
    )
  })

  it('throws for invalid createdAtFrom', async () => {
    await expect(useCase.execute({ createdAtFrom: 'invalid-date' })).rejects.toThrow(
      'Invalid createdAtFrom parameter. Must be a valid ISO date string',
    )
  })

  it('throws for invalid createdAtTo', async () => {
    await expect(useCase.execute({ createdAtTo: 'invalid-date' })).rejects.toThrow(
      'Invalid createdAtTo parameter. Must be a valid ISO date string',
    )
  })

  it('throws when createdAtFrom is after createdAtTo', async () => {
    await expect(
      useCase.execute({
        createdAtFrom: '2025-12-31T23:59:59.999Z',
        createdAtTo: '2025-01-01T00:00:00.000Z',
      }),
    ).rejects.toThrow('Invalid createdAt range. createdAtFrom must be <= createdAtTo')
  })
})
