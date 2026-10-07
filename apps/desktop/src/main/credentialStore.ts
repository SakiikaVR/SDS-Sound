import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { safeStorage } from 'electron'

export interface OAuthCredentials {
  clientId: string
  clientSecret: string
}

const fileName = 'freesound-credentials.json'

export function loadOAuthCredentials(dataDir: string): OAuthCredentials | null {
  const path = join(dataDir, fileName)
  if (!existsSync(path) || !safeStorage.isEncryptionAvailable()) return null
  try {
    const saved = JSON.parse(readFileSync(path, 'utf8')) as {
      clientId?: string
      encryptedSecret?: string
    }
    if (!saved.clientId || !saved.encryptedSecret) return null
    const clientSecret = safeStorage.decryptString(Buffer.from(saved.encryptedSecret, 'base64'))
    return clientSecret ? { clientId: saved.clientId, clientSecret } : null
  } catch {
    return null
  }
}

export function saveOAuthCredentials(dataDir: string, clientId: string, clientSecret: string): void {
  const id = clientId.trim()
  const secret = clientSecret.trim()
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(id) || secret.length < 8 || secret.length > 512 || /\s/.test(secret)) {
    throw new Error('Client ID と Client Secret を確認してください。')
  }
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('この端末では認証情報を暗号化できません。')
  }
  const path = join(dataDir, fileName)
  const temporaryPath = `${path}.tmp`
  const encryptedSecret = safeStorage.encryptString(secret).toString('base64')
  writeFileSync(temporaryPath, JSON.stringify({ clientId: id, encryptedSecret }), { mode: 0o600 })
  renameSync(temporaryPath, path)
}
