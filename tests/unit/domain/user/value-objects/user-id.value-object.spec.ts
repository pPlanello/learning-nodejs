import { InvalidUserIdException } from '@Domain/user/user.exceptions'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'

describe('UserId', () => {
  it('generates a valid uuid when no value is provided', () => {
    const userId = new UserId()

    expect(userId.toString()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('accepts a valid uuid value', () => {
    const value = '11111111-1111-4111-8111-111111111111'
    const userId = new UserId(value)

    expect(userId.toString()).toBe(value)
  })

  it('throws InvalidUserIdException for invalid value', () => {
    expect(() => new UserId('not-a-uuid')).toThrow(InvalidUserIdException)
  })

  it('compares equality by value', () => {
    const value = '22222222-2222-4222-8222-222222222222'
    const left = new UserId(value)
    const right = new UserId(value)

    expect(left.equals(right)).toBe(true)
  })
})
