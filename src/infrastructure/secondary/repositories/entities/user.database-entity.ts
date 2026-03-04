import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from '@Domain/user/user.entity'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { Email } from '@Domain/user/value-objects/email.value-object'
import { HashedPassword } from '@Domain/user/value-objects/hashed-password.value-object'

@Entity({ name: 'users' })
export class UserDatabaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Index('idx_users_email', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string

  @Column({
    type: 'varchar',
    length: 50,
    default: 'active',
  })
  status!: 'active' | 'suspended' | 'pending_verification'

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Index('idx_users_deleted_at')
  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null

  static fromDomain(user: User): UserDatabaseEntity {
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

  static toDomain(entity: UserDatabaseEntity): User {
    return new User(
      new UserId(entity.id),
      entity.name,
      new Email(entity.email),
      HashedPassword.fromHash(entity.passwordHash),
      entity.status,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
    )
  }
}
