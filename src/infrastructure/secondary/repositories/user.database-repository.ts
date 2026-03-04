import {
  type FindAllUsersOptions,
  type FindAllUsersResult,
  type UserRepository,
} from '@Domain/repositories/user.repository'
import { Email } from '@Domain/value-objects/email.value-object'
import { UserId } from '@Domain/value-objects/user-id.value-object'
import { User } from '@Domain/entities/user.entity'
import { AppDataSource } from '@Infrastructure/config/database.config'
import { type Repository } from 'typeorm'

import { UserDatabaseEntity } from '@Infrastructure/secondary/repositories/entities/user.database-entity'

export class UserDatabaseRepository implements UserRepository {
  private readonly repository: Repository<UserDatabaseEntity>

  constructor() {
    this.repository = AppDataSource.getRepository(UserDatabaseEntity)
  }

  public async create(user: User): Promise<User> {
    const persistedEntity = await this.repository.save(UserDatabaseEntity.fromDomain(user))

    return UserDatabaseEntity.toDomain(persistedEntity)
  }

  public async findById(id: UserId): Promise<User | null> {
    const databaseEntity = await this.repository.findOne({ where: { id: id.toString() } })
    return databaseEntity === null ? null : UserDatabaseEntity.toDomain(databaseEntity)
  }

  public async findByEmail(email: Email): Promise<User | null> {
    const databaseEntity = await this.repository.findOne({ where: { email: email.toString() } })
    return databaseEntity === null ? null : UserDatabaseEntity.toDomain(databaseEntity)
  }

  public async findAll(options: FindAllUsersOptions): Promise<FindAllUsersResult> {
    const offset = (options.page - 1) * options.limit
    const sortByMap: Record<string, keyof UserDatabaseEntity> = {
      name: 'name',
      email: 'email',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }

    const queryBuilder = this.repository
      .createQueryBuilder('users')
      .where('users.deletedAt IS NULL')
      .skip(offset)
      .take(options.limit)
      .orderBy(
        `users.${sortByMap[options.sortBy ?? 'createdAt']}`,
        (options.sortOrder ?? 'desc').toUpperCase() as 'ASC' | 'DESC',
      )

    if (options.status !== undefined) {
      queryBuilder.andWhere('users.status = :status', { status: options.status })
    }

    if (options.createdAtFrom !== undefined) {
      queryBuilder.andWhere('users.createdAt >= :createdAtFrom', {
        createdAtFrom: options.createdAtFrom,
      })
    }

    if (options.createdAtTo !== undefined) {
      queryBuilder.andWhere('users.createdAt <= :createdAtTo', {
        createdAtTo: options.createdAtTo,
      })
    }

    const [rows, total] = await queryBuilder.getManyAndCount()

    return {
      data: rows.map((row) => UserDatabaseEntity.toDomain(row)),
      total,
    }
  }

  public async update(user: User): Promise<User> {
    await this.repository.save(UserDatabaseEntity.fromDomain(user))
    const refreshed = await this.findById(user.id)

    if (refreshed === null) {
      throw new Error('Unable to reload updated entities')
    }

    return refreshed
  }
}
