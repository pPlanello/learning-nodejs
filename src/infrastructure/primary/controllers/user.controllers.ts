import { CreateUserRequestDTO } from '@Application/user/dtos/create-user.request.dto'
import { mapUserToDTO } from '@Application/user/dtos/user.response.dto'
import { type CreateUserUseCase } from '@Application/user/use-cases/create-user.use-case'
import { type DeleteUserUseCase } from '@Application/user/use-cases/delete-user.use-case'
import { type GetAllUsersUseCase } from '@Application/user/use-cases/get-all-users.use-case'
import { type GetUserUseCase } from '@Application/user/use-cases/get-user.use-case'
import { type UpdateUserUseCase } from '@Application/user/use-cases/update-user.use-case'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { type NextFunction, type Request, type Response } from 'express'

import { BadRequestException } from '../exceptions/bad-request.exception'

export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  /**
   * POST /users
   * Creates a new user.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = plainToInstance(CreateUserRequestDTO, req.body)
      const validationErrors = await validate(input)

      if (validationErrors.length > 0) {
        throw new BadRequestException('Invalid create user payload')
      }

      const createdUser = await this.createUserUseCase.execute({
        name: input.name,
        email: input.email,
        password: input.password,
      })

      res.status(201).json(mapUserToDTO(createdUser))
    } catch (error) {
      next(error)
    }
  }
}

export class GetUserController {
  constructor(private readonly getUserUseCase: GetUserUseCase) {}

  /**
   * GET /users/:id
   * Retrieves a user by id.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getUserUseCase.execute(req.params.id)
      res.status(200).json(mapUserToDTO(user))
    } catch (error) {
      next(error)
    }
  }
}

export class GetAllUsersController {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {}

  /**
   * GET /users
   * Lists users with pagination.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page !== undefined ? Number(req.query.page) : undefined
      const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined

      const result = await this.getAllUsersUseCase.execute({
        page,
        limit,
        status: req.query.status as 'active' | 'suspended' | 'pending_verification' | undefined,
        sortBy: req.query.sortBy as 'name' | 'email' | 'createdAt' | 'updatedAt' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        createdAtFrom: req.query.createdAtFrom as string | undefined,
        createdAtTo: req.query.createdAtTo as string | undefined,
      })

      res.status(200).json({
        data: result.data.map(mapUserToDTO),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      })
    } catch (error) {
      next(error)
    }
  }
}

export class UpdateUserController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {}

  /**
   * PATCH /users/:id
   * Updates a user partially.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.updateUserUseCase.execute(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        status: req.body.status,
      })

      res.status(200).json(mapUserToDTO(user))
    } catch (error) {
      next(error)
    }
  }
}

export class DeleteUserController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  /**
   * DELETE /users/:id
   * Soft-deletes a user.
   */
  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteUserUseCase.execute(req.params.id)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}
