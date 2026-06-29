import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getStateDir } from './workspace-state-dir'

describe('getStateDir', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Clear workspace-specific override for clean tests
    delete process.env.NASTECH_WORKSPACE_STATE_DIR
    // Clear nastech home chain too
    delete process.env.NASTECH_HOME
    delete process.env.CLAUDE_HOME
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns NASTECH_WORKSPACE_STATE_DIR when set', () => {
    process.env.NASTECH_WORKSPACE_STATE_DIR = '/custom/state/dir'
    const result = getStateDir()
    expect(result).toBe('/custom/state/dir')
  })

  it('uses NASTECH_HOME/workspace when NASTECH_WORKSPACE_STATE_DIR is not set', () => {
    process.env.NASTECH_HOME = '/custom/nastech'
    const result = getStateDir()
    expect(result).toBe('/custom/nastech/workspace')
  })

  it('falls back to CLAUDE_HOME/workspace when only CLAUDE_HOME is set', () => {
    process.env.CLAUDE_HOME = '/claude/home'
    const result = getStateDir()
    expect(result).toBe('/claude/home/workspace')
  })

  it('prefers NASTECH_HOME over CLAUDE_HOME', () => {
    process.env.NASTECH_HOME = '/nastech/home'
    process.env.CLAUDE_HOME = '/claude/home'
    const result = getStateDir()
    expect(result).toBe('/nastech/home/workspace')
  })

  it('prefers NASTECH_WORKSPACE_STATE_DIR over everything', () => {
    process.env.NASTECH_WORKSPACE_STATE_DIR = '/explicit/workspace'
    process.env.NASTECH_HOME = '/nastech/home'
    const result = getStateDir()
    expect(result).toBe('/explicit/workspace')
  })

  it('trims whitespace from env values', () => {
    process.env.NASTECH_WORKSPACE_STATE_DIR = '  /trimmed/path  '
    const result = getStateDir()
    expect(result).toBe('/trimmed/path')
  })
})
