/**
 * NasTech Config API — proxy route for nastech-config-route handlers.
 * Maps GET and PATCH/POST to the server-side config read/write logic.
 */
import { createFileRoute } from '@tanstack/react-router'
import {
  handleNasTechConfigGet,
  handleNasTechConfigPatch,
} from '../../server/nastech-config-route'

export const Route = createFileRoute('/api/nastech-config')({
  server: {
    handlers: {
      GET: handleNasTechConfigGet,
      PATCH: handleNasTechConfigPatch,
      POST: handleNasTechConfigPatch,
    },
  },
})
