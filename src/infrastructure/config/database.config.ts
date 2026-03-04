import 'reflect-metadata'

import { DataSource } from 'typeorm'

import { UserDatabaseEntity } from '@Infrastructure/secondary/repositories/entities/user.database-entity'

const databaseUrl = process.env.DATABASE_URL

if (databaseUrl === undefined || databaseUrl.length === 0) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  synchronize: true,
  logging: false,
  extra: {
    min: 2,
    max: 20,
  },
  entities: [UserDatabaseEntity],
})
