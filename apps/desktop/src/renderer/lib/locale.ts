export type Locale = 'en' | 'ja'

const STORAGE_KEY = 'super-duper-locale'

export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'ja') return saved
  } catch {
    // Storage may be unavailable in private or restricted environments.
  }
  return window.navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

export function setLocale(locale: Locale): void {
  window.localStorage.setItem(STORAGE_KEY, locale)
  window.location.reload()
}

export function t(english: string, japanese: string): string {
  return getLocale() === 'ja' ? japanese : english
}
