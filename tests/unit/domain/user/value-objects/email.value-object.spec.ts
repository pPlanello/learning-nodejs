import { Email, InvalidEmailFormatException } from '@Domain/user/value-objects/email.value-object'

describe('Email', () => {
  it('normalizes email to lowercase and trims whitespace', () => {
    const email = new Email('  TEST.USER@Example.com  ')

    expect(email.toString()).toBe('test.user@example.com')
  })

  it('compares equality by normalized value', () => {
    const left = new Email('user@example.com')
    const right = new Email('USER@example.com')

    expect(left.equals(right)).toBe(true)
  })

  it('throws InvalidEmailFormatException for invalid email', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidEmailFormatException)
  })
})
