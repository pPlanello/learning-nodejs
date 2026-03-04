import { hashSync } from 'bcryptjs'

import {
  HashedPassword,
  WeakPasswordException,
} from '@Domain/value-objects/hashed-password.value-object'

describe('HashedPassword', () => {
  const originalSaltRounds = process.env.HASH_SALT_ROUNDS

  afterEach(() => {
    if (originalSaltRounds === undefined) {
      delete process.env.HASH_SALT_ROUNDS
      return
    }

    process.env.HASH_SALT_ROUNDS = originalSaltRounds
  })

  it('hashes a strong password and verifies it', () => {
    const password = new HashedPassword('SecurePass123!')

    expect(password.hash).not.toBe('SecurePass123!')
    expect(password.isCorrect('SecurePass123!')).toBe(true)
    expect(password.isCorrect('WrongPass123!')).toBe(false)
  })

  it('throws WeakPasswordException for weak password', () => {
    expect(() => new HashedPassword('weak')).toThrow(WeakPasswordException)
  })

  it('creates from existing hash', () => {
    const existingHash = hashSync('SecurePass123!', 10)
    const password = HashedPassword.fromHash(existingHash)

    expect(password.hash).toBe(existingHash)
    expect(password.isCorrect('SecurePass123!')).toBe(true)
  })

  it('uses fallback salt rounds when env value is invalid', () => {
    process.env.HASH_SALT_ROUNDS = 'invalid'

    const password = new HashedPassword('SecurePass123!')

    expect(password.isCorrect('SecurePass123!')).toBe(true)
  })

  it('uses fallback salt rounds when env value is below minimum', () => {
    process.env.HASH_SALT_ROUNDS = '1'

    const password = new HashedPassword('SecurePass123!')

    expect(password.isCorrect('SecurePass123!')).toBe(true)
  })
})
