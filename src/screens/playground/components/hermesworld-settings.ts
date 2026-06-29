import { useEffect, useMemo, useState } from 'react'

export const NASTECHWORLD_SETTINGS_KEY = 'nastechworld:settings'

export type NasTechWorldSettings = {
  graphics: {
    renderDistance: 'low' | 'med' | 'high' | 'ultra'
    shadowQuality: 'low' | 'med' | 'high' | 'ultra'
    textureQuality: 'low' | 'med' | 'high' | 'ultra'
    antiAliasing: boolean
  }
  performance: {
    fpsCounter: boolean
    targetFps: '30' | '60' | '120' | 'uncapped'
    reducedMotion: boolean
  }
  controls: {
    mouseSensitivity: number
    invertY: boolean
    bindings: Record<string, string>
  }
  audio: {
    master: number
    music: number
    sfx: number
    ambient: number
  }
  display: {
    uiScale: number
    hudOpacity: number
    fullscreen: boolean
  }
  accessibility: {
    photosensitiveMode: boolean
  }
}

export const DEFAULT_NASTECHWORLD_SETTINGS: NasTechWorldSettings = {
  graphics: {
    renderDistance: 'high',
    shadowQuality: 'high',
    textureQuality: 'high',
    antiAliasing: true,
  },
  performance: {
    fpsCounter: false,
    targetFps: '60',
    reducedMotion: false,
  },
  controls: {
    mouseSensitivity: 50,
    invertY: false,
    bindings: {
      Move: 'WASD / arrows',
      Run: 'Shift',
      Jump: 'Space',
      Crouch: 'Ctrl',
      Interact: 'E',
      Party: 'Tab',
      Inventory: 'I',
      Map: 'M',
      Skills: 'K',
      Quests: 'N',
      Character: 'C',
      Settings: 'Esc',
      Chat: 'Enter',
      Commands: '/',
      Help: '?',
    },
  },
  audio: {
    master: 100,
    music: 75,
    sfx: 80,
    ambient: 65,
  },
  display: {
    uiScale: 100,
    hudOpacity: 88,
    fullscreen: false,
  },
  accessibility: {
    photosensitiveMode: false,
  },
}

function mergeSettings(value: Partial<NasTechWorldSettings> | null): NasTechWorldSettings {
  return {
    ...DEFAULT_NASTECHWORLD_SETTINGS,
    ...value,
    graphics: { ...DEFAULT_NASTECHWORLD_SETTINGS.graphics, ...value?.graphics },
    performance: { ...DEFAULT_NASTECHWORLD_SETTINGS.performance, ...value?.performance },
    controls: {
      ...DEFAULT_NASTECHWORLD_SETTINGS.controls,
      ...value?.controls,
      bindings: { ...DEFAULT_NASTECHWORLD_SETTINGS.controls.bindings, ...value?.controls?.bindings },
    },
    audio: { ...DEFAULT_NASTECHWORLD_SETTINGS.audio, ...value?.audio },
    display: { ...DEFAULT_NASTECHWORLD_SETTINGS.display, ...value?.display },
    accessibility: { ...DEFAULT_NASTECHWORLD_SETTINGS.accessibility, ...value?.accessibility },
  }
}

function prefersReducedMotion() {
  try { return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

function withReducedMotionDefaults(settings: NasTechWorldSettings, hasStoredSettings: boolean): NasTechWorldSettings {
  if (!prefersReducedMotion()) return settings
  if (hasStoredSettings) return settings
  return {
    ...settings,
    performance: { ...settings.performance, reducedMotion: true },
    accessibility: { ...settings.accessibility, photosensitiveMode: true },
  }
}

export function loadNasTechWorldSettings(): NasTechWorldSettings {
  if (typeof window === 'undefined') return DEFAULT_NASTECHWORLD_SETTINGS
  try {
    const raw = window.localStorage.getItem(NASTECHWORLD_SETTINGS_KEY)
    return withReducedMotionDefaults(mergeSettings(raw ? JSON.parse(raw) : null), !!raw)
  } catch {
    return withReducedMotionDefaults(DEFAULT_NASTECHWORLD_SETTINGS, false)
  }
}

export function applyNasTechWorldSettings(settings: NasTechWorldSettings) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--nastechworld-ui-scale', String(settings.display.uiScale / 100))
  document.documentElement.style.setProperty('--nastechworld-hud-opacity', String(settings.display.hudOpacity / 100))
  document.documentElement.style.setProperty('--nastechworld-master-volume', String(settings.audio.master / 100))
  document.documentElement.style.setProperty('--hw-flash-rate', settings.accessibility.photosensitiveMode ? '0s' : '1.5s')
  document.documentElement.classList.toggle('nastechworld-photosensitive', settings.accessibility.photosensitiveMode)
  document.documentElement.classList.toggle('nastechworld-reduced-motion', settings.performance.reducedMotion)
}

export function saveNasTechWorldSettings(settings: NasTechWorldSettings) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(NASTECHWORLD_SETTINGS_KEY, JSON.stringify(settings))
  applyNasTechWorldSettings(settings)
  window.dispatchEvent(new CustomEvent('nastechworld-settings-changed', { detail: settings }))
}

export function useNasTechWorldSettings() {
  const [settings, setSettings] = useState<NasTechWorldSettings>(() => loadNasTechWorldSettings())

  useEffect(() => {
    applyNasTechWorldSettings(settings)
    const onStorage = () => setSettings(loadNasTechWorldSettings())
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<NasTechWorldSettings>).detail
      if (detail) setSettings(detail)
    }
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const onMedia = () => {
      if (!media?.matches) return
      update((current) => ({
        ...current,
        performance: { ...current.performance, reducedMotion: true },
        accessibility: { ...current.accessibility, photosensitiveMode: true },
      }))
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('nastechworld-settings-changed', onChange)
    media?.addEventListener?.('change', onMedia)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('nastechworld-settings-changed', onChange)
      media?.removeEventListener?.('change', onMedia)
    }
  }, [settings])

  const update = useMemo(
    () => (patch: (current: NasTechWorldSettings) => NasTechWorldSettings) => {
      setSettings((current) => {
        const next = patch(current)
        saveNasTechWorldSettings(next)
        return next
      })
    },
    [],
  )

  return [settings, update] as const
}
