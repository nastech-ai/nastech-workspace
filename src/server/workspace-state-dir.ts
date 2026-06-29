import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

/**
 * Resolve the NasTech workspace state directory.
 *
 * Priority:
 * 1. `NASTECH_WORKSPACE_STATE_DIR` env var (explicit override)
 * 2. `join(NASTECH_HOME, 'workspace')` where NASTECH_HOME respects
 *    `NASTECH_HOME` → `CLAUDE_HOME` → `~/.nastech` (standard chain)
 *
 * The returned path is absolute and resolved. Callers should create the
 * directory at startup if it doesn't exist.
 */
export function getStateDir(): string {
  const explicit = process.env.NASTECH_WORKSPACE_STATE_DIR?.trim()
  if (explicit) return resolve(explicit)

  const nastechHome =
    process.env.NASTECH_HOME?.trim() ??
    process.env.CLAUDE_HOME?.trim() ??
    join(homedir(), '.nastech')

  return resolve(join(nastechHome, 'workspace'))
}
