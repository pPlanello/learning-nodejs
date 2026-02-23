const { spawnSync } = require('node:child_process')

const rawArgs = process.argv.slice(2)
const normalizedArgs = rawArgs[0] === '--' ? rawArgs.slice(1) : rawArgs

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const result = spawnSync(command, ['exec', 'jest', ...normalizedArgs], {
  stdio: 'inherit',
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
