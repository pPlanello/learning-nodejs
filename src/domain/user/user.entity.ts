import { type Email } from './value-objects/email.value-object'
import { type HashedPassword } from './value-objects/hashed-password.value-object'
import { type UserId } from './value-objects/user-id.value-object'
import { InvalidUserStatusException } from './user.exceptions'

export type UserStatus = 'active' | 'suspended' | 'pending_verification'

const VALID_STATUSES: UserStatus[] = ['active', 'suspended', 'pending_verification']

export class User {
  constructor(
    public readonly id: UserId,
    public name: string,
    public email: Email,
    public password: HashedPassword,
    public status: UserStatus = 'active',
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt: Date | null = null,
  ) {
    if (!VALID_STATUSES.includes(status)) {
      throw new InvalidUserStatusException(status)
    }
  }

  public isActive(): boolean {
    return this.deletedAt === null && this.status === 'active'
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null
  }

  public updateProfile(name: string): void {
    this.name = name.trim()
    this.updatedAt = new Date()
  }

  public updateEmail(email: Email): void {
    this.email = email
    this.updatedAt = new Date()
  }

  public updateStatus(status: UserStatus): void {
    if (!VALID_STATUSES.includes(status)) {
      throw new InvalidUserStatusException(status)
    }

    this.status = status
    this.updatedAt = new Date()
  }

  public delete(): void {
    this.deletedAt = new Date()
    this.updatedAt = new Date()
  }
}
