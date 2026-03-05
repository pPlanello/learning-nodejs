describe('database.config', () => {
  const originalEnv = process.env.DATABASE_URL

  afterEach(() => {
    process.env.DATABASE_URL = originalEnv
    jest.resetModules()
  })

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL

    jest.isolateModules(() => {
      expect(() => {
        require('@Infrastructure/config/database.config')
      }).toThrow('DATABASE_URL environment variable is required')
    })
  })

  it('creates data source with expected configuration', () => {
    process.env.DATABASE_URL = 'postgresql://local:test@localhost:5432/testdb'

    jest.isolateModules(() => {
      const { AppDataSource } = require('@Infrastructure/config/database.config')

      expect(AppDataSource.options).toEqual(
        expect.objectContaining({
          type: 'postgres',
          url: process.env.DATABASE_URL,
          synchronize: true,
          logging: false,
          extra: { min: 2, max: 20 },
        }),
      )
    })
  })
})
