/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SHORTCUTS, shouldToggleKeyboardHelp } from './keyboard-shortcuts-overlay'
import { DEFAULT_NASTECHWORLD_SETTINGS, loadNasTechWorldSettings, saveNasTechWorldSettings } from './nastechworld-settings'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.style.removeProperty('--nastechworld-ui-scale')
  document.documentElement.style.removeProperty('--nastechworld-hud-opacity')
  document.documentElement.style.removeProperty('--hw-flash-rate')
  document.documentElement.className = ''
})

describe('NasTechWorld keyboard shortcut handling', () => {
  it('maps help, jump, crouch, and settings shortcuts', () => {
    const entries = new Map(SHORTCUTS)
    expect(entries.get('?')).toBe('help')
    expect(entries.get('Space')).toBe('jump')
    expect(entries.get('Ctrl')).toBe('crouch')
    expect(entries.get('Esc')).toBe('settings')
  })

  it('toggles help on ? but ignores form fields', () => {
    expect(shouldToggleKeyboardHelp({ key: '?', shiftKey: false, target: window })).toBe(true)
    const input = document.createElement('input')
    expect(shouldToggleKeyboardHelp({ key: '?', shiftKey: false, target: input })).toBe(false)
  })
})

describe('NasTechWorld settings persistence', () => {
  it('persists settings to localStorage and applies runtime variables', () => {
    saveNasTechWorldSettings({
      ...DEFAULT_NASTECHWORLD_SETTINGS,
      performance: { ...DEFAULT_NASTECHWORLD_SETTINGS.performance, fpsCounter: true },
      display: { ...DEFAULT_NASTECHWORLD_SETTINGS.display, uiScale: 125, hudOpacity: 72 },
      accessibility: { photosensitiveMode: true },
    })

    const stored = JSON.parse(window.localStorage.getItem('nastechworld:settings') || '{}')
    expect(stored.display.uiScale).toBe(125)
    expect(stored.display.hudOpacity).toBe(72)
    expect(stored.performance.fpsCounter).toBe(true)
    expect(stored.accessibility.photosensitiveMode).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--nastechworld-ui-scale')).toBe('1.25')
    expect(document.documentElement.style.getPropertyValue('--nastechworld-hud-opacity')).toBe('0.72')
    expect(document.documentElement.style.getPropertyValue('--hw-flash-rate')).toBe('0s')
    expect(document.documentElement.classList.contains('nastechworld-photosensitive')).toBe(true)
  })

  it('defaults photosensitive mode and reduced motion from prefers-reduced-motion on first load', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    })

    const settings = loadNasTechWorldSettings()
    expect(settings.performance.reducedMotion).toBe(true)
    expect(settings.accessibility.photosensitiveMode).toBe(true)
  })
})
