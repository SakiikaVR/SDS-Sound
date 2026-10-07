export interface DesktopConfig {
  freesoundClientId: string
  tokenWorkerUrl: string
  telemetryEnabled: boolean
}

function read(key: keyof ImportMetaEnv): string {
  return import.meta.env[key] ?? process.env[key] ?? ''
}

export function loadConfig(): DesktopConfig {
  const freesoundClientId = read('FREESOUND_CLIENT_ID')
  const tokenWorkerUrl = read('FREESOUND_TOKEN_WORKER_URL')
  if (!freesoundClientId || !tokenWorkerUrl) {
    console.warn(
      '[config] Freesound connection is not configured. Set FREESOUND_CLIENT_ID and ' +
        'FREESOUND_TOKEN_WORKER_URL in apps/desktop/.env before building. ' +
        'Never put FREESOUND_CLIENT_SECRET in the desktop app.',
    )
  }

  return {
    freesoundClientId,
    tokenWorkerUrl,
    telemetryEnabled: false,
  }
}
