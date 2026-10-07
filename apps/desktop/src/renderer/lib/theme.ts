import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'super-duper-theme'
const listeners = new Set<() => void>()
let current: Theme = 'dark'

export function initializeTheme(): void {
  try {
    current = window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    current = 'dark'
  }
  document.documentElement.dataset.sdTheme = current
}

export function setTheme(theme: Theme): void {
  current = theme
  document.documentElement.dataset.sdTheme = theme
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // The setting still applies to this session when storage is unavailable.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () => current, () => 'dark')
}
