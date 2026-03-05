import { type ILogger } from '@Domain/common/logger.port'
import { type UserRepository } from '@Domain/repositories/user.repository'
import { Email } from '@Domain/value-objects/email.value-object'
import { HashedPassword } from '@Domain/value-objects/hashed-password.value-object'
import { User } from '@Domain/entities/user.entity'
import { DuplicateEmailException } from '@Domain/exceptions/user.exceptions'
import { UserId } from '@Domain/value-objects/user-id.value-object'

import { type CreateUserRequest } from '../dtos/create-user.dto'

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: ILogger,
  ) {}

  public async execute(request: CreateUserRequest): Promise<User> {
    this.logger.debug('CreateUserUseCase.execute:start', { email: request.email })

    const email = new Email(request.email)
    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser !== null && !existingUser.isDeleted()) {
      throw new DuplicateEmailException(email.toString())
    }

    const user = new User(
      new UserId(),
      request.name.trim(),
      email,
      new HashedPassword(request.password),
    )

    const createdUser = await this.userRepository.create(user)
    this.logger.debug('CreateUserUseCase.execute:end', { userId: createdUser.id.toString() })
    this.logger.info('CreateUserUseCase.execute:success', { userId: createdUser.id.toString() })

    return createdUser
  }
}
