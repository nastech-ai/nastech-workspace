/**
 * Legacy config route shim.
 *
 * The frontend still calls /api/claude-config in a few places, but the real
 * implementation now lives in the shared NasTech config handlers.
 */
import { createFileRoute } from '@tanstack/react-router'
import {
  handleNasTechConfigGet,
  handleNasTechConfigPatch,
} from '../../server/nastech-config-route'

export const Route = createFileRoute('/api/claude-config')({
  server: {
    handlers: {
      GET: handleNasTechConfigGet,
      PATCH: handleNasTechConfigPatch,
      POST: handleNasTechConfigPatch,
    },
  },
})
