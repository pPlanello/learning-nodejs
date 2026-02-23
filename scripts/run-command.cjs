const { spawnSync } = require('node:child_process')

const runCommand = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  return result.status ?? 1
}

module.exports = {
  runCommand,
}