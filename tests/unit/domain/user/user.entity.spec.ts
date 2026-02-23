import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User } from '@Domain/user/user.entity'
import { InvalidUserStatusException } from '@Domain/user/user.exceptions'

describe('User', () => {
  it('creates an active user by default', () => {
    const user = new User(
      new UserId(),
      'John Doe',
      new Email('john.doe@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    expect(user.isActive()).toBe(true)
    expect(user.isDeleted()).toBe(false)
  })

  it('throws InvalidUserStatusException for invalid status', () => {
    expect(
      () =>
        new User(
          new UserId(),
          'John Doe',
          new Email('john.doe@example.com'),
          new HashedPassword('SecurePass123!'),
          'unknown' as never,
        ),
    ).toThrow(InvalidUserStatusException)
  })

  it('updates profile name and timestamp', async () => {
    const user = new User(
      new UserId(),
      'John Doe',
      new Email('john.doe@example.com'),
      new HashedPassword('SecurePass123!'),
    )
    const previousUpdatedAt = user.updatedAt.getTime()

    await new Promise((resolve) => setTimeout(resolve, 2))
    user.updateProfile('  Jane Doe  ')

    expect(user.name).toBe('Jane Doe')
    expect(user.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt)
  })

  it('updates email and status', () => {
    const user = new User(
      new UserId(),
      'John Doe',
      new Email('john.doe@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    user.updateEmail(new Email('jane.doe@example.com'))
    user.updateStatus('suspended')

    expect(user.email.toString()).toBe('jane.doe@example.com')
    expect(user.status).toBe('suspended')
    expect(user.isActive()).toBe(false)
  })

  it('throws on invalid status update', () => {
    const user = new User(
      new UserId(),
      'John Doe',
      new Email('john.doe@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    expect(() => user.updateStatus('bad-status' as never)).toThrow(InvalidUserStatusException)
  })

  it('soft deletes user', () => {
    const user = new User(
      new UserId(),
      'John Doe',
      new Email('john.doe@example.com'),
      new HashedPassword('SecurePass123!'),
    )

    user.delete()

    expect(user.isDeleted()).toBe(true)
    expect(user.deletedAt).not.toBeNull()
    expect(user.isActive()).toBe(false)
  })
})
