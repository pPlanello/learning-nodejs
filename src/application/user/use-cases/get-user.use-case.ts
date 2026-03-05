import { type ILogger } from '@Domain/common/logger.port'
import { type UserRepository } from '@Domain/repositories/user.repository'
import { UserId } from '@Domain/value-objects/user-id.value-object'
import { type User } from '@Domain/entities/user.entity'
import { UserNotFoundException } from '@Domain/exceptions/user.exceptions'

export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: ILogger,
  ) {}

  public async execute(userId: string): Promise<User> {
    this.logger.debug('GetUserUseCase.execute:start', { userId })

    const user = await this.userRepository.findById(new UserId(userId))

    if (user === null || user.isDeleted()) {
      throw new UserNotFoundException(userId)
    }

    this.logger.debug('GetUserUseCase.execute:end', { userId: user.id.toString() })

    return user
  }
}
