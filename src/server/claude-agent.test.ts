import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { afterEach, describe, expect, it } from 'vitest'

import { resolveClaudeAgentDir } from './claude-agent'

const tempDirs: string[] = []

function createAgentDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  mkdirSync(join(dir, 'webapi'))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('resolveClaudeAgentDir', () => {
  it('prefers NASTECH_AGENT_PATH when it points to a valid nastech-agent checkout', () => {
    const nastechAgentDir = createAgentDir('nastech-agent-')
    const legacyAgentDir = createAgentDir('claude-agent-')

    expect(
      resolveClaudeAgentDir({
        NASTECH_AGENT_PATH: nastechAgentDir,
        CLAUDE_AGENT_PATH: legacyAgentDir,
      }),
    ).toBe(nastechAgentDir)
  })

  it('falls back to legacy CLAUDE_AGENT_PATH for backward compatibility', () => {
    const legacyAgentDir = createAgentDir('claude-agent-')

    expect(
      resolveClaudeAgentDir({
        CLAUDE_AGENT_PATH: legacyAgentDir,
      }),
    ).toBe(legacyAgentDir)
  })
})