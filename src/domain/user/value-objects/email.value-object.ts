const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class InvalidEmailFormatException extends Error {
  constructor(email: string) {
    super(`Email format invalid: ${email}`)
    this.name = 'InvalidEmailFormatException'
  }
}

export class Email {
  readonly value: string

  constructor(value: string) {
    const normalized = value.trim().toLowerCase()

    if (normalized.length < 5 || normalized.length > 254 || !EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailFormatException(value)
    }

    this.value = normalized
  }

  public equals(other: Email): boolean {
    return this.value === other.value
  }

  public toString(): string {
    return this.value
  }
}
