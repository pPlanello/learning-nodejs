const { spawnSync } = require('node:child_process')

const DB_PORT = Number(process.env.E2E_DB_PORT ?? '5433')
const DATABASE_URL =
  process.env.DATABASE_URL ?? `postgresql://local:test@localhost:${String(DB_PORT)}/testdb`

const main = () => {
  const result = spawnSync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['exec', 'cucumber-js', '--config', 'tests/acceptance/cucumber.js'],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL,
        LOG_LEVEL: process.env.LOG_LEVEL ?? 'error',
      },
    },
  )

  if (result.error) {
    throw result.error
  }

  process.exit(result.status ?? 1)
}

try {
  main()
} catch (error) {
  console.error(error)
  process.exit(1)
}