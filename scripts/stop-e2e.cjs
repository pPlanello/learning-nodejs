const { spawnSync } = require('node:child_process')
const { runCommand } = require('./run-command.cjs')

const COMPOSE_FILE = 'tests/acceptance/docker-compose.acceptance-test.yml'
const PROJECT_IMAGE = process.env.E2E_PROJECT_IMAGE ?? 'learning-nodejs:e2e-test'

const removeImage = (imageTag) => {
  const result = spawnSync('docker', ['image', 'rm', '-f', imageTag], {
    encoding: 'utf8',
  })

  if (result.error) {
    throw result.error
  }

  if (result.stdout) {
    process.stdout.write(result.stdout)
  }

  if (result.stderr) {
    process.stderr.write(result.stderr)
  }

  if ((result.status ?? 1) === 0) {
    return 0
  }

  if ((result.stderr ?? '').includes('No such image')) {
    return 0
  }

  return result.status ?? 1
}

const main = () => {
  let exitCode = 0

  try {
    const downStatus = runCommand('docker', ['compose', '-f', COMPOSE_FILE, 'down'])
    if (downStatus !== 0) {
      exitCode = downStatus
    }

    const removeImageStatus = removeImage(PROJECT_IMAGE)
    if (exitCode === 0 && removeImageStatus !== 0) {
      exitCode = removeImageStatus
    }
  } catch (error) {
    console.error(error)
    exitCode = 1
  }

  process.exit(exitCode)
}

main()