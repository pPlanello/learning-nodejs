import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User } from '@Domain/user/user.entity'

jest.mock('@Infrastructure/config/database.config', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}))

import { AppDataSource } from '@Infrastructure/config/database.config'
import { UserDatabaseRepository } from '@Infrastructure/secondary/repositories/user.database-repository'

const createDomainUser = () =>
  new User(
    new UserId(),
    'Repo User',
    new Email('repo.user@example.com'),
    new HashedPassword('SecurePass123!'),
  )

describe('UserDatabaseRepository', () => {
  const save = jest.fn()
  const findOne = jest.fn()
  const andWhere = jest.fn()
  const where = jest.fn()
  const skip = jest.fn()
  const take = jest.fn()
  const orderBy = jest.fn()
  const getManyAndCount = jest.fn()

  const createQueryBuilder = jest.fn(() => ({
    where,
    andWhere,
    skip,
    take,
    orderBy,
    getManyAndCount,
  }))

  beforeEach(() => {
    where.mockReturnValue({ andWhere, skip, take, orderBy, getManyAndCount })
    andWhere.mockReturnValue({ andWhere, skip, take, orderBy, getManyAndCount })
    skip.mockReturnValue({ andWhere, skip, take, orderBy, getManyAndCount })
    take.mockReturnValue({ andWhere, skip, take, orderBy, getManyAndCount })
    orderBy.mockReturnValue({ andWhere, skip, take, orderBy, getManyAndCount })
    ;(AppDataSource.getRepository as jest.Mock).mockReturnValue({
      save,
      findOne,
      createQueryBuilder,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates and finds users', async () => {
    const repository = new UserDatabaseRepository()
    const user = createDomainUser()

    save.mockResolvedValue({
      id: user.id.toString(),
      name: user.name,
      email: user.email.toString(),
      passwordHash: user.password.hash,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    })
    findOne.mockResolvedValue({
      id: user.id.toString(),
      name: user.name,
      email: user.email.toString(),
      passwordHash: user.password.hash,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    })

    await repository.create(user)

    const byId = await repository.findById(user.id)
    const byEmail = await repository.findByEmail(user.email)

    expect(save).toHaveBeenCalled()
    expect(byId?.id.toString()).toBe(user.id.toString())
    expect(byEmail?.email.toString()).toBe(user.email.toString())
  })

  it('findAll applies filters and pagination', async () => {
    const repository = new UserDatabaseRepository()
    const user = createDomainUser()

    getManyAndCount.mockResolvedValue([
      [
        {
          id: user.id.toString(),
          name: user.name,
          email: user.email.toString(),
          passwordHash: user.password.hash,
          status: 'active',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: null,
        },
      ],
      1,
    ])

    const result = await repository.findAll({
      page: 2,
      limit: 10,
      status: 'active',
      createdAtFrom: new Date('2026-01-01T00:00:00.000Z'),
      createdAtTo: new Date('2026-02-01T00:00:00.000Z'),
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    })

    expect(createQueryBuilder).toHaveBeenCalledWith('users')
    expect(andWhere).toHaveBeenCalledWith('users.status = :status', { status: 'active' })
    expect(andWhere).toHaveBeenCalledWith('users.createdAt >= :createdAtFrom', {
      createdAtFrom: new Date('2026-01-01T00:00:00.000Z'),
    })
    expect(andWhere).toHaveBeenCalledWith('users.createdAt <= :createdAtTo', {
      createdAtTo: new Date('2026-02-01T00:00:00.000Z'),
    })
    expect(skip).toHaveBeenCalledWith(10)
    expect(take).toHaveBeenCalledWith(10)
    expect(orderBy).toHaveBeenCalledWith('users.updatedAt', 'DESC')
    expect(result.total).toBe(1)
    expect(result.data).toHaveLength(1)
  })

  it('updates user and throws if user does not exist', async () => {
    const repository = new UserDatabaseRepository()
    const user = createDomainUser()

    save.mockResolvedValue(undefined)
    findOne
      .mockResolvedValueOnce({
        id: user.id.toString(),
        name: user.name,
        email: user.email.toString(),
        passwordHash: user.password.hash,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      })
      .mockResolvedValueOnce(null)

    const updated = await repository.update(user)
    expect(updated.id.toString()).toBe(user.id.toString())

    await expect(repository.update(user)).rejects.toThrow('Unable to reload updated user')
  })
})
