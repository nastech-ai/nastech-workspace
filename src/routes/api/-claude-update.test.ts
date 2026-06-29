import { describe, expect, it } from 'vitest'
import { createRemoteStatus, remoteUrlMatchesExpectedRepo } from './claude-update'

describe('claude update repo gating', () => {
  it('matches Claude workspace repo aliases', () => {
    expect(remoteUrlMatchesExpectedRepo('https://github.com/example/nastech-workspace.git', ['nastech-workspace'])).toBe(true)
    expect(remoteUrlMatchesExpectedRepo('git@github.com:nastech-ai/nastech-workspace.git', ['nastech-ai/nastech-workspace'])).toBe(true)
  })

  it('blocks update availability for wrong remote repos even when heads differ', () => {
    const status = createRemoteStatus({
      name: 'origin',
      label: 'NasTech Workspace',
      expectedRepo: 'nastech-workspace',
      aliases: ['nastech-workspace'],
      url: 'https://github.com/example/not-workspace.git',
      currentHead: 'local',
      remoteHead: 'remote',
    })

    expect(status.repoMatches).toBe(false)
    expect(status.updateAvailable).toBe(false)
    expect(status.error).toContain('expected nastech-workspace')
  })

  it('allows update availability only for the expected repo with a newer remote head', () => {
    const status = createRemoteStatus({
      name: 'upstream',
      label: 'NasTech Agent',
      expectedRepo: 'nastech-agent',
      aliases: ['nastech-agent'],
      url: 'https://github.com/nastech-ai/nastech-agent.git',
      currentHead: 'local',
      remoteHead: 'remote',
    })

    expect(status.repoMatches).toBe(true)
    expect(status.updateAvailable).toBe(true)
    expect(status.error).toBeNull()
  })
})
