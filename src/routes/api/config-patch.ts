/**
 * Config Patch API — handles provider/settings saves from the providers screen
 * and provider wizard. Delegates to the same nastech-config-route handler.
 */
import { createFileRoute } from '@tanstack/react-router'
import {
  handleNasTechConfigPatch,
} from '../../server/nastech-config-route'

export const Route = createFileRoute('/api/config-patch')({
  server: {
    handlers: {
      POST: handleNasTechConfigPatch,
    },
  },
})
