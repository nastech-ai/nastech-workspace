import { homedir } from 'node:os'
import { dirname, join, normalize, sep } from 'node:path'

function isProfilesChild(pathValue: string): boolean {
  const parts = normalize(pathValue).split(sep).filter(Boolean)
  return parts.length >= 2 && parts.at(-2) === 'profiles'
}

function isProfileHome(pathValue: string): boolean {
  const parts = normalize(pathValue).split(sep).filter(Boolean)
  return parts.length >= 3 && parts.at(-3) === 'profiles' && parts.at(-1) === 'home'
}

function nastechRootFromProfile(pathValue: string): string | null {
  if (isProfilesChild(pathValue)) {
    return dirname(dirname(pathValue))
  }
  if (isProfileHome(pathValue)) {
    return dirname(dirname(dirname(pathValue)))
  }
  return null
}

export function getNasTechRoot(): string {
  const envHome = process.env.NASTECH_HOME || process.env.CLAUDE_HOME
  if (envHome) {
    const profileRoot = nastechRootFromProfile(envHome)
    if (profileRoot) return profileRoot
    return envHome
  }

  const osHome = homedir()
  const profileRoot = nastechRootFromProfile(osHome)
  if (profileRoot) return profileRoot
  return join(osHome, '.nastech')
}

export function getProfilesDir(): string {
  return join(getNasTechRoot(), 'profiles')
}

export function getWorkspaceNasTechHome(): string {
  return getNasTechRoot()
}

export function getProfileNasTechHome(profileId: string): string {
  return join(getProfilesDir(), profileId)
}

export function getUserHomeForNasTechRoot(): string {
  const root = getNasTechRoot()
  if (root.endsWith(`${sep}.nastech`)) return dirname(root)
  return homedir()
}

export function getLocalBinDir(): string {
  return join(getUserHomeForNasTechRoot(), '.local', 'bin')
}

// Legacy aliases for callers not yet renamed.
export const getClaudeRoot = getNasTechRoot
export const getWorkspaceClaudeHome = getWorkspaceNasTechHome
export const getProfileClaudeHome = getProfileNasTechHome
export const getUserHomeForClaudeRoot = getUserHomeForNasTechRoot
