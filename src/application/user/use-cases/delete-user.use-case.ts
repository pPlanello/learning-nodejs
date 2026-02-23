import { type ILogger } from '@Domain/common/logger.port'
import { type IUserRepository } from '@Domain/user/ports/user.repository.port'
import { UserId } from '@Domain/user/value-objects/user-id.value-object'
import { UserNotFoundException } from '@Domain/user/user.exceptions'

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  public async execute(userId: string): Promise<void> {
    this.logger.debug('DeleteUserUseCase.execute:start', { userId })

    const user = await this.userRepository.findById(new UserId(userId))

    if (user === null || user.isDeleted()) {
      throw new UserNotFoundException(userId)
    }

    user.delete()
    await this.userRepository.update(user)
    this.logger.debug('DeleteUserUseCase.execute:end', { userId: user.id.toString() })
  }
}
