const net = require('node:net')
const { runCommand } = require('./run-command.cjs')

const COMPOSE_SERVICE = 'postgres'
const COMPOSE_FILE = 'tests/acceptance/docker-compose.acceptance-test.yml'
const BUILD_SCRIPT = 'scripts/build.cjs'
const PROJECT_IMAGE = process.env.E2E_PROJECT_IMAGE ?? 'learning-nodejs:e2e-test'
const DB_PORT = Number(process.env.E2E_DB_PORT ?? '5433')
const DB_HOST = process.env.E2E_DB_HOST ?? '127.0.0.1'
const READY_TIMEOUT_MS = Number(process.env.E2E_DB_READY_TIMEOUT_MS ?? '60000')
const READY_POLL_INTERVAL_MS = Number(process.env.E2E_DB_READY_INTERVAL_MS ?? '1000')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForPort = async (host, port, timeoutMs, intervalMs) => {
  const startedAt = Date.now()

  while (Date.now() - startedAt <= timeoutMs) {
    const isReady = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port })

      socket.once('connect', () => {
        socket.end()
        resolve(true)
      })

      socket.once('error', () => {
        socket.destroy()
        resolve(false)
      })
    })

    if (isReady) {
      return
    }

    await sleep(intervalMs)
  }

  throw new Error(`Timed out waiting for PostgreSQL on ${host}:${String(port)}`)
}

const main = async () => {
  try {
    const buildStatus = runCommand(process.execPath, [BUILD_SCRIPT, PROJECT_IMAGE])
    if (buildStatus !== 0) {
      process.exit(buildStatus)
    }

    const upStatus = runCommand('docker', [
      'compose',
      '-f',
      COMPOSE_FILE,
      'up',
      '-d',
      COMPOSE_SERVICE,
    ])

    if (upStatus !== 0) {
      process.exit(upStatus)
    }

    await waitForPort(DB_HOST, DB_PORT, READY_TIMEOUT_MS, READY_POLL_INTERVAL_MS)
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

void main()