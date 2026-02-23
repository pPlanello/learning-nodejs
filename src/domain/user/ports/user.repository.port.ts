import { type User } from '../user.entity'
import { type Email } from '../value-objects/email.value-object'
import { type UserId } from '../value-objects/user-id.value-object'

export interface FindAllUsersOptions {
  page: number
  limit: number
  status?: 'active' | 'suspended' | 'pending_verification'
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  createdAtFrom?: Date
  createdAtTo?: Date
}

export interface FindAllUsersResult {
  data: User[]
  total: number
}

export interface IUserRepository {
  create: (user: User) => Promise<User>
  findById: (id: UserId) => Promise<User | null>
  findByEmail: (email: Email) => Promise<User | null>
  findAll: (options: FindAllUsersOptions) => Promise<FindAllUsersResult>
  update: (user: User) => Promise<User>
}
