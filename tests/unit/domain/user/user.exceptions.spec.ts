import {
  DuplicateEmailException,
  InvalidUserIdException,
  InvalidUserStatusException,
  UserNotFoundException,
} from '@Domain/user/user.exceptions'

describe('user exceptions', () => {
  it('builds UserNotFoundException', () => {
    const error = new UserNotFoundException('id-1')
    expect(error.name).toBe('UserNotFoundException')
    expect(error.message).toContain('id-1')
  })

  it('builds DuplicateEmailException', () => {
    const error = new DuplicateEmailException('test@example.com')
    expect(error.name).toBe('DuplicateEmailException')
    expect(error.message).toContain('test@example.com')
  })

  it('builds InvalidUserIdException', () => {
    const error = new InvalidUserIdException('bad')
    expect(error.name).toBe('InvalidUserIdException')
    expect(error.message).toContain('bad')
  })

  it('builds InvalidUserStatusException', () => {
    const error = new InvalidUserStatusException('bad-status')
    expect(error.name).toBe('InvalidUserStatusException')
    expect(error.message).toContain('bad-status')
  })
})
