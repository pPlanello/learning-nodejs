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

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         status:
 *           type: string
 *           enum: [active, suspended, pending_verification]
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         status:
 *           type: string
 *           enum: [active, suspended, pending_verification]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           nullable: true
 *           format: date-time
 *     GetAllUsersResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserResponse'
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalPages:
 *           type: integer
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *         statusCode:
 *           type: integer
 *         timestamp:
 *           type: string
 *           format: date-time
 *         traceId:
 *           type: string
 */

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 */

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

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, pending_verification]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt, updatedAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: createdAtFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: createdAtTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAllUsersResponse'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       '200':
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 *       '409':
 *         description: Duplicate email
 */

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

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: Deleted
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: Not found
 */

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
