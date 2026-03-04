import { randomUUID } from 'node:crypto'

import { InvalidUserIdException } from '../exceptions/user.exceptions'

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class UserId {
  readonly value: string

  constructor(value?: string) {
    if (value !== undefined && !UUID_V4_REGEX.test(value)) {
      throw new InvalidUserIdException(value)
    }

    this.value = value ?? randomUUID()
  }

  public equals(other: UserId): boolean {
    return this.value === other.value
  }

  public toString(): string {
    return this.value
  }
}
