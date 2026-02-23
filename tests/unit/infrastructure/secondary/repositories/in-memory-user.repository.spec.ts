import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User } from '@Domain/user/user.entity'
import { InMemoryUserRepository } from '@Infrastructure/secondary/repositories/in-memory-user.repository'

const createUser = (index: number) =>
  new User(
    new UserId(),
    `User ${index}`,
    new Email(`user.${index}@example.com`),
    new HashedPassword('SecurePass123!'),
  )

describe('InMemoryUserRepository', () => {
  it('creates, updates, finds by id and email', async () => {
    const repository = new InMemoryUserRepository()
    const user = createUser(1)

    await repository.create(user)
    user.updateProfile('Updated User')
    await repository.update(user)

    const byId = await repository.findById(user.id)
    const byEmail = await repository.findByEmail(new Email('user.1@example.com'))

    expect(byId?.name).toBe('Updated User')
    expect(byEmail?.id.toString()).toBe(user.id.toString())
  })

  it('filters by status/date and sorts in findAll', async () => {
    const repository = new InMemoryUserRepository()
    const userA = createUser(2)
    const userB = createUser(3)

    userA.updateStatus('suspended')
    userA.createdAt.setTime(new Date('2026-01-01T00:00:00.000Z').getTime())
    userA.updatedAt = new Date('2026-01-02T00:00:00.000Z')

    userB.createdAt.setTime(new Date('2026-01-03T00:00:00.000Z').getTime())
    userB.updatedAt = new Date('2026-01-04T00:00:00.000Z')

    await repository.create(userA)
    await repository.create(userB)

    const filtered = await repository.findAll({
      page: 1,
      limit: 10,
      status: 'suspended',
      sortBy: 'name',
      sortOrder: 'asc',
      createdAtFrom: new Date('2025-12-31T00:00:00.000Z'),
      createdAtTo: new Date('2026-01-02T00:00:00.000Z'),
    })

    expect(filtered.total).toBe(1)
    expect(filtered.data[0].id.toString()).toBe(userA.id.toString())

    const sortedByUpdated = await repository.findAll({
      page: 1,
      limit: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    })

    expect(sortedByUpdated.data[0].id.toString()).toBe(userB.id.toString())
  })

  it('excludes deleted users and paginates', async () => {
    const repository = new InMemoryUserRepository()
    const user1 = createUser(4)
    const user2 = createUser(5)
    const user3 = createUser(6)
    user2.delete()

    await repository.create(user1)
    await repository.create(user2)
    await repository.create(user3)

    const result = await repository.findAll({
      page: 1,
      limit: 1,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    })

    expect(result.total).toBe(2)
    expect(result.data).toHaveLength(1)
  })
})
