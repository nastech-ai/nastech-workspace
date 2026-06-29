import { describe, expect, it } from 'vitest'
import { normalizeNasTechConfigState } from './nastech-config-migration'

const paths = {
  nastechHome: '/tmp/nastech',
  configPath: '/tmp/nastech/config.yaml',
  envPath: '/tmp/nastech/.env',
  authProfilesPath: '/tmp/nastech/auth-profiles.json',
}

describe('normalizeNasTechConfigState', () => {
  it('normalizes flat default provider and model config', () => {
    const state = normalizeNasTechConfigState({
      paths,
      config: { provider: 'openrouter', model: 'auto' },
      env: { OPENROUTER_API_KEY: 'sk-openrouter-123456' },
      authProfiles: {},
      localProviders: [],
      localModels: [],
    })

    expect(state.activeProvider).toBe('openrouter')
    expect(state.activeModel).toBe('auto')
    expect(state.defaultModel).toEqual({
      provider: 'openrouter',
      model: 'auto',
      source: 'flat',
    })
    const openrouter = state.providers.find((p) => p.id === 'openrouter')
    expect(openrouter?.configured).toBe(true)
    expect(openrouter?.authenticated).toBe(true)
    expect(openrouter?.isDefault).toBe(true)
    expect(openrouter?.authSource).toBe('env')
  })

  it('normalizes nested default provider and model config', () => {
    const state = normalizeNasTechConfigState({
      paths,
      config: { model: { provider: 'openai-codex', default: 'gpt-5.4' } },
      env: {},
      authProfiles: {},
      localProviders: [],
      localModels: [],
    })

    expect(state.activeProvider).toBe('openai-codex')
    expect(state.activeModel).toBe('gpt-5.4')
    expect(state.defaultModel).toEqual({
      provider: 'openai-codex',
      model: 'gpt-5.4',
      source: 'nested',
    })
  })

  it('falls back to nested model when only a partial flat field is set', () => {
    const state = normalizeNasTechConfigState({
      paths,
      config: {
        provider: 'openrouter',
        model: { provider: 'openrouter', default: 'auto' },
      },
      env: {},
      authProfiles: {},
      localProviders: [],
      localModels: [],
    })

    expect(state.defaultModel).toEqual({
      provider: 'openrouter',
      model: 'auto',
      source: 'nested',
    })
  })
})
