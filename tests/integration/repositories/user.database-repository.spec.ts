import { Email } from '@Domain/value-objects/email.value-object'
import { HashedPassword } from '@Domain/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/value-objects/user-id.value-object'
import { User } from '@Domain/entities/user.entity'

const hasDatabaseUrl = process.env.DATABASE_URL !== undefined

const describeIfDatabase = hasDatabaseUrl ? describe : describe.skip

describeIfDatabase('UserDatabaseRepository', () => {
  let appDataSource: {
    isInitialized: boolean
    initialize: () => Promise<unknown>
    destroy: () => Promise<unknown>
  }
  let repository: {
    create: (user: User) => Promise<User>
    findById: (id: UserId) => Promise<User | null>
  }

  beforeAll(async () => {
    const [{ AppDataSource }, { UserDatabaseRepository }] = await Promise.all([
      import('@Infrastructure/config/database.config'),
      import('@Infrastructure/secondary/repositories/user.database-repository'),
    ])

    appDataSource = AppDataSource
    repository = new UserDatabaseRepository()

    if (!appDataSource.isInitialized) {
      await appDataSource.initialize()
    }
  })

  afterAll(async () => {
    if (appDataSource.isInitialized) {
      await appDataSource.destroy()
    }
  })

  it('creates and reads a entities', async () => {
    const user = new User(
      new UserId(),
      'Integration User',
      new Email('integration.entities@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    const created = await repository.create(user)
    const found = await repository.findById(created.id)

    expect(found).not.toBeNull()
    expect(found?.email.toString()).toBe('integration.entities@example.com')
  })
})
