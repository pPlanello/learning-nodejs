import { type ILogger } from '@Domain/common/logger.port'
import { type UserRepository } from '@Domain/repositories/user.repository'
import { type User } from '@Domain/entities/user.entity'

import { type GetAllUsersQuery } from '../dtos/get-all-users.dto'

export class GetAllUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: ILogger,
  ) {}

  public async execute(query: GetAllUsersQuery): Promise<{
    data: User[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const createdAtFrom =
      query.createdAtFrom !== undefined ? new Date(query.createdAtFrom) : undefined
    const createdAtTo = query.createdAtTo !== undefined ? new Date(query.createdAtTo) : undefined

    if (page < 1 || !Number.isInteger(page)) {
      throw new Error('Invalid page parameter. Page must be an integer >= 1')
    }

    if (limit < 1 || limit > 100 || !Number.isInteger(limit)) {
      throw new Error('Invalid limit parameter. Limit must be an integer between 1 and 100')
    }

    if (createdAtFrom !== undefined && Number.isNaN(createdAtFrom.getTime())) {
      throw new Error('Invalid createdAtFrom parameter. Must be a valid ISO date string')
    }

    if (createdAtTo !== undefined && Number.isNaN(createdAtTo.getTime())) {
      throw new Error('Invalid createdAtTo parameter. Must be a valid ISO date string')
    }

    if (
      createdAtFrom !== undefined &&
      createdAtTo !== undefined &&
      createdAtFrom.getTime() > createdAtTo.getTime()
    ) {
      throw new Error('Invalid createdAt range. createdAtFrom must be <= createdAtTo')
    }

    this.logger.debug('GetAllUsersUseCase.execute:start', { page, limit })

    const result = await this.userRepository.findAll({
      page,
      limit,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      createdAtFrom,
      createdAtTo,
    })

    this.logger.debug('GetAllUsersUseCase.execute:end', {
      page,
      limit,
      total: result.total,
      returned: result.data.length,
    })

    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    }
  }
}
