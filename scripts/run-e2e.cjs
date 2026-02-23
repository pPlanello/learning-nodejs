const { runCommand } = require('./run-command.cjs')

const START_SCRIPT = 'scripts/start-e2e.cjs'
const EXECUTE_SCRIPT = 'scripts/execute-e2e.cjs'
const STOP_SCRIPT = 'scripts/stop-e2e.cjs'

const main = () => {
  let exitCode = 1
  let shouldStop = false

  try {
    const startStatus = runCommand(process.execPath, [START_SCRIPT])
    shouldStop = true
    if (startStatus !== 0) {
      exitCode = startStatus
      return
    }

    exitCode = runCommand(process.execPath, [EXECUTE_SCRIPT])
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    if (shouldStop) {
      const stopStatus = runCommand(process.execPath, [STOP_SCRIPT])
      if (exitCode === 0 && stopStatus !== 0) {
        exitCode = stopStatus
      }
    }
  }

  process.exit(exitCode)
}

main()
