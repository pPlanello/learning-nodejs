import {
  type FindAllUsersOptions,
  type FindAllUsersResult,
  type IUserRepository,
} from '@Domain/user/ports/user.repository.port'
import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { User, type UserStatus } from '@Domain/user/user.entity'
import { AppDataSource } from '@Infrastructure/config/database.config'
import { type Repository } from 'typeorm'

import { UserDatabaseEntity } from '../../persistence/entities/user.database-entity'

export class TypeORMUserRepository implements IUserRepository {
  private readonly repository: Repository<UserDatabaseEntity>

  constructor() {
    this.repository = AppDataSource.getRepository(UserDatabaseEntity)
  }

  public async create(user: User): Promise<User> {
    const persistedEntity = await this.repository.save(this.toDatabaseEntity(user))

    return this.toDomainEntity(persistedEntity)
  }

  public async findById(id: UserId): Promise<User | null> {
    const databaseEntity = await this.repository.findOne({ where: { id: id.toString() } })
    return databaseEntity === null ? null : this.toDomainEntity(databaseEntity)
  }

  public async findByEmail(email: Email): Promise<User | null> {
    const databaseEntity = await this.repository.findOne({ where: { email: email.toString() } })
    return databaseEntity === null ? null : this.toDomainEntity(databaseEntity)
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
      data: rows.map((row) => this.toDomainEntity(row)),
      total,
    }
  }

  public async update(user: User): Promise<User> {
    await this.repository.save(this.toDatabaseEntity(user))
    const refreshed = await this.findById(user.id)

    if (refreshed === null) {
      throw new Error('Unable to reload updated user')
    }

    return refreshed
  }

  private toDatabaseEntity(user: User): UserDatabaseEntity {
    const entity = new UserDatabaseEntity()
    entity.id = user.id.toString()
    entity.name = user.name
    entity.email = user.email.toString()
    entity.passwordHash = user.password.hash
    entity.status = user.status
    entity.createdAt = user.createdAt
    entity.updatedAt = user.updatedAt
    entity.deletedAt = user.deletedAt

    return entity
  }

  private toDomainEntity(entity: UserDatabaseEntity): User {
    return new User(
      new UserId(entity.id),
      entity.name,
      new Email(entity.email),
      HashedPassword.fromHash(entity.passwordHash),
      entity.status as UserStatus,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    )
  }
}
