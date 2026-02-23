import { Router } from 'express'

import { CreateUserUseCase } from '@Application/user/use-cases/create-user.use-case'
import { DeleteUserUseCase } from '@Application/user/use-cases/delete-user.use-case'
import { GetAllUsersUseCase } from '@Application/user/use-cases/get-all-users.use-case'
import { GetUserUseCase } from '@Application/user/use-cases/get-user.use-case'
import { UpdateUserUseCase } from '@Application/user/use-cases/update-user.use-case'
import { type ILogger } from '@Domain/common/logger.port'
import { type IUserRepository } from '@Domain/user/ports/user.repository.port'
import { PinoLoggerAdapter } from '@Infrastructure/adapters/pino-logger.adapter'
import { TypeORMUserRepository } from '@Infrastructure/secondary/repositories/typeorm-user.repository'

import {
  CreateUserController,
  DeleteUserController,
  GetAllUsersController,
  GetUserController,
  UpdateUserController,
} from '../../controllers/user.controllers'

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

export interface UserRoutesDependencies {
  userRepository?: IUserRepository
  logger?: ILogger
}

export const createUserRoutes = (dependencies: UserRoutesDependencies = {}): Router => {
  const userRepository = dependencies.userRepository ?? new TypeORMUserRepository()
  const logger = dependencies.logger ?? new PinoLoggerAdapter()

  const createUserController = new CreateUserController(
    new CreateUserUseCase(userRepository, logger),
  )
  const getUserController = new GetUserController(new GetUserUseCase(userRepository, logger))
  const getAllUsersController = new GetAllUsersController(
    new GetAllUsersUseCase(userRepository, logger),
  )
  const updateUserController = new UpdateUserController(
    new UpdateUserUseCase(userRepository, logger),
  )
  const deleteUserController = new DeleteUserController(
    new DeleteUserUseCase(userRepository, logger),
  )

  const userRoutes = Router()

  userRoutes.post('/users', createUserController.handle)
  userRoutes.get('/users/:id', getUserController.handle)
  userRoutes.get('/users', getAllUsersController.handle)
  userRoutes.patch('/users/:id', updateUserController.handle)
  userRoutes.delete('/users/:id', deleteUserController.handle)

  return userRoutes
}
