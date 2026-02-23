import { Before } from '@cucumber/cucumber'

import { resetAcceptanceContext } from './context'

Before(() => {
  resetAcceptanceContext()
})
