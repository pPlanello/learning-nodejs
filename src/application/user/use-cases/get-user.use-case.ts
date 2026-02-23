import { type ILogger } from '@Domain/common/logger.port'
import { type IUserRepository } from '@Domain/user/ports/user.repository.port'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { type User } from '@Domain/user/user.entity'
import { UserNotFoundException } from '@Domain/user/user.exceptions'

export class GetUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
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
