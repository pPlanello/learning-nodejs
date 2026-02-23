import { AfterAll, Before } from '@cucumber/cucumber'

import {
  clearAcceptanceDatabase,
  closeAcceptanceDatabase,
  initializeAcceptanceDatabase,
  resetAcceptanceContext,
} from './context'

Before(async () => {
  await initializeAcceptanceDatabase()
  await clearAcceptanceDatabase()
  resetAcceptanceContext()
})

AfterAll(async () => {
  await closeAcceptanceDatabase()
})
