import { type ILogger } from '@Domain/common/logger.port'
import { type IUserRepository } from '@Domain/user/ports/user.repository.port'
import { Email } from '@Domain/user/value-objects/email.value-object'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { type User } from '@Domain/user/user.entity'
import { DuplicateEmailException, UserNotFoundException } from '@Domain/user/user.exceptions'

import { type UpdateUserRequest } from '../dtos/update-user.dto'

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  public async execute(userId: string, request: UpdateUserRequest): Promise<User> {
    this.logger.debug('UpdateUserUseCase.execute:start', { userId })

    const user = await this.userRepository.findById(new UserId(userId))

    if (user === null || user.isDeleted()) {
      throw new UserNotFoundException(userId)
    }

    if (request.name !== undefined) {
      user.updateProfile(request.name)
    }

    if (request.email !== undefined) {
      const nextEmail = new Email(request.email)
      const existingUser = await this.userRepository.findByEmail(nextEmail)

      if (
        existingUser !== null &&
        existingUser.id.toString() !== user.id.toString() &&
        !existingUser.isDeleted()
      ) {
        throw new DuplicateEmailException(nextEmail.toString())
      }

      user.updateEmail(nextEmail)
    }

    if (request.status !== undefined) {
      user.updateStatus(request.status)
    }

    const updatedUser = await this.userRepository.update(user)
    this.logger.debug('UpdateUserUseCase.execute:end', { userId: updatedUser.id.toString() })

    return updatedUser
  }
}
