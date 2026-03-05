import { compareSync, hashSync } from 'bcryptjs'

const getSaltRounds = (): number => {
  const parsedValue = Number.parseInt(process.env.HASH_SALT_ROUNDS ?? '4', 10)

  if (Number.isNaN(parsedValue) || parsedValue < 4) {
    return 4
  }

  return parsedValue
}

export class WeakPasswordException extends Error {
  constructor() {
    super(
      'Password must be at least 8 characters with uppercase, lowercase, digit, and special character',
    )
    this.name = 'WeakPasswordException'
  }
}

export class HashedPassword {
  readonly hash: string

  constructor(plaintext: string) {
    if (!HashedPassword.isStrong(plaintext)) {
      throw new WeakPasswordException()
    }

    this.hash = hashSync(plaintext, getSaltRounds())
  }

  public static fromHash(hash: string): HashedPassword {
    const instance = Object.create(HashedPassword.prototype) as HashedPassword
    Object.defineProperty(instance, 'hash', {
      value: hash,
      writable: false,
      enumerable: true,
      configurable: false,
    })

    return instance
  }

  public isCorrect(plaintext: string): boolean {
    return compareSync(plaintext, this.hash)
  }

  private static isStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasDigit = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*]/.test(password)

    return password.length >= 8 && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar
  }
}
