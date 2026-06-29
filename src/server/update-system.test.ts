import { describe, expect, it } from 'vitest'
import { remoteUrlMatches, updateAvailableFromDivergence } from './update-system'

describe('update-system helpers', () => {
  it('matches GitHub URL forms against expected repo aliases', () => {
    expect(
      remoteUrlMatches('https://github.com/nastech-ai/nastech-workspace.git', [
        'nastech-ai/nastech-workspace',
      ]),
    ).toBe(true)
    expect(
      remoteUrlMatches('git@github.com:nastech-ai/nastech-agent.git', [
        'nastech-agent',
      ]),
    ).toBe(true)
    expect(
      remoteUrlMatches('https://github.com/example/other.git', [
        'nastech-workspace',
      ]),
    ).toBe(false)
  })

  it('only reports update availability when the remote side is ahead', () => {
    expect(updateAvailableFromDivergence({ ahead: 2, behind: 0 }, true)).toBe(false)
    expect(updateAvailableFromDivergence({ ahead: 0, behind: 3 }, true)).toBe(true)
    expect(updateAvailableFromDivergence({ ahead: 2, behind: 3 }, true)).toBe(true)
    expect(updateAvailableFromDivergence({ ahead: 0, behind: 0 }, false)).toBe(false)
    expect(updateAvailableFromDivergence(null, true)).toBe(true)
  })
})
