import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@Domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@Application/(.*)$': '<rootDir>/src/application/$1',
    '^@Infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
}

export default config
