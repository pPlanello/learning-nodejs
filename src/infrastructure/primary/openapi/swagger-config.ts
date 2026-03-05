import { type Express } from 'express'
import path from 'node:path'

import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'User CRUD API',
    version: '1.0.0',
    description: 'REST API for User CRUD operations following hexagonal architecture.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current API version',
    },
  ],
}

const swaggerOptions: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../routes/**/*.ts'),
    path.join(__dirname, '../routes/**/*.js'),
    path.join(__dirname, '../controllers/**/*.ts'),
    path.join(__dirname, '../controllers/**/*.js'),
  ],
}

const openApiSpec = swaggerJsdoc(swaggerOptions)

export const setupSwagger = (app: Express): void => {
  app.get('/api-docs/openapi.json', (_req, res) => {
    res.json(openApiSpec)
  })

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
}

export { openApiSpec }
