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
} from '../../controllers/user.controller'

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
