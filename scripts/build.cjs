const { runCommand } = require('./run-command.cjs')

const IMAGE_TAG = process.argv[2] ?? process.env.E2E_PROJECT_IMAGE ?? 'learning-nodejs:e2e-test'
const DOCKERFILE_PATH = process.env.E2E_DOCKERFILE ?? 'Dockerfile'
const BUILD_CONTEXT = process.env.E2E_BUILD_CONTEXT ?? '.'

const main = () => {
  const status = runCommand('docker', ['build', '-f', DOCKERFILE_PATH, '-t', IMAGE_TAG, BUILD_CONTEXT])
  process.exit(status)
}

try {
  main()
} catch (error) {
  console.error(error)
  process.exit(1)
}