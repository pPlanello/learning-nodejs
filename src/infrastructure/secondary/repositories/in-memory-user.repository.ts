import {
  type FindAllUsersOptions,
  type FindAllUsersResult,
  type IUserRepository,
} from '@Domain/user/ports/user.repository.port'
import { type Email } from '@Domain/user/value-objects/email.value-object'
import { type UserId } from '@Domain/user/value-objects/user-id.value-object'
import { type User } from '@Domain/user/user.entity'

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>()

  public async create(user: User): Promise<User> {
    this.users.set(user.id.toString(), user)
    return user
  }

  public async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.toString()) ?? null
  }

  public async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.equals(email)) {
        return user
      }
    }

    return null
  }

  public async findAll(options: FindAllUsersOptions): Promise<FindAllUsersResult> {
    const activeUsers = Array.from(this.users.values()).filter((user) => !user.isDeleted())

    const statusFiltered =
      options.status !== undefined
        ? activeUsers.filter((user) => user.status === options.status)
        : activeUsers

    const createdAtFiltered = statusFiltered.filter((user) => {
      if (
        options.createdAtFrom !== undefined &&
        user.createdAt.getTime() < options.createdAtFrom.getTime()
      ) {
        return false
      }

      if (
        options.createdAtTo !== undefined &&
        user.createdAt.getTime() > options.createdAtTo.getTime()
      ) {
        return false
      }

      return true
    })

    const sorted = [...createdAtFiltered].sort((left, right) => {
      const sortBy = options.sortBy ?? 'createdAt'
      const direction = options.sortOrder === 'asc' ? 1 : -1

      if (sortBy === 'name' || sortBy === 'email') {
        const leftValue = sortBy === 'name' ? left.name : left.email.toString()
        const rightValue = sortBy === 'name' ? right.name : right.email.toString()
        return leftValue.localeCompare(rightValue) * direction
      }

      const leftDate = sortBy === 'createdAt' ? left.createdAt : left.updatedAt
      const rightDate = sortBy === 'createdAt' ? right.createdAt : right.updatedAt
      return (leftDate.getTime() - rightDate.getTime()) * direction
    })

    const offset = (options.page - 1) * options.limit

    return {
      data: sorted.slice(offset, offset + options.limit),
      total: sorted.length,
    }
  }

  public async update(user: User): Promise<User> {
    this.users.set(user.id.toString(), user)
    return user
  }
}
