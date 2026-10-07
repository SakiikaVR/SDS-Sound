import { useState } from 'react'
import { t } from '../lib/locale'

export function FreesoundCredentialsDialog({
  onClose,
  existingClientId,
}: { onClose: () => void; existingClientId: string }) {
  const [clientId, setClientId] = useState(existingClientId)
  const [clientSecret, setClientSecret] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await window.core.saveCredentials(clientId, clientSecret)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="credentials-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded border border-line bg-bg p-6 text-ink shadow-xl">
        <h2 id="credentials-title" className="text-lg font-semibold">{t('Connect Freesound', 'Freesound 接続設定')}</h2>
        <p className="mt-2 text-sm text-ink-muted">{t('Each user registers their own Freesound API application. Your secret stays encrypted on this computer and is never included in the installer.', '利用者ごとにFreesoundのAPIアプリを登録します。Secretはこの端末内で暗号化して保存し、インストーラーには含めません。')}</p>

        <div className="mt-5 space-y-4 text-sm">
          <section>
            <h3 className="font-semibold">{t('1. Register an API application', '1. FreesoundでAPIアプリを登録')}</h3>
            <button type="button" onClick={() => void window.core.openFreesoundRegistration()} className="mt-1 text-accent-2-text underline">https://freesound.org/apiv2/apply/</button>
            <p className="mt-1 text-ink-muted">{t('Enter the following values on that page:', '登録ページの各欄には次を入力してください。')}</p>
            <dl className="mt-2 grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 rounded border border-line p-3 font-mono text-xs">
              <dt>Name</dt><dd>SDS-Sound</dd>
              <dt>URL</dt><dd className="break-all">https://github.com/SakiikaVR/SDS-Sound</dd>
              <dt>Callback URL</dt><dd className="break-all">http://localhost:8910/callback</dd>
            </dl>
            <p className="mt-2 text-xs text-ink-muted">{t('Description is required. Describe your own API use. Example:', 'Descriptionは必須です。APIの利用目的を自分の使い方に合わせて書いてください。入力例：')}</p>
            <p lang="en" className="mt-1 rounded border border-line p-2 text-xs text-ink-muted">I use SDS-Sound to search, preview and download Freesound sounds for my personal sample library. I will follow each sound&apos;s license and attribution requirements.</p>
            <p className="mt-1 text-xs text-ink-muted">{t('Never enter your Client Secret or password in Description.', 'DescriptionにClient Secretやパスワードは入力しません。')}</p>
          </section>
          <section>
            <h3 className="font-semibold">{t('2. Copy the issued values into this app', '2. 発行された値をこのアプリに入力')}</h3>
            <p className="mt-1 text-xs text-ink-muted">{t('Copy Client ID to the first field and Client Secret to the second field. Do not paste your Freesound password here.', 'Freesoundの発行画面からClient IDを上の欄、Client Secretを下の欄にコピーします。Freesoundのパスワードは入力しません。')}</p>
            <label className="mt-2 block text-xs font-medium" htmlFor="freesound-client-id">Client ID</label>
            <input id="freesound-client-id" value={clientId} onChange={(event) => setClientId(event.target.value)} autoComplete="off" spellCheck={false} className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 font-mono text-sm text-ink" />
            <label className="mt-3 block text-xs font-medium" htmlFor="freesound-client-secret">Client Secret</label>
            <input id="freesound-client-secret" type="password" value={clientSecret} onChange={(event) => setClientSecret(event.target.value)} autoComplete="off" spellCheck={false} className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 font-mono text-sm text-ink" />
          </section>
          <section>
            <h3 className="font-semibold">{t('3. Save, then sign in', '3. 保存後にログイン')}</h3>
            <p className="mt-1 text-xs text-ink-muted">{t('The app restarts after saving. Press Sign in to open Freesound in your browser.', '保存するとアプリが再起動します。その後「ログイン」を押すとブラウザーでFreesoundが開きます。')}</p>
          </section>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-error">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border border-line px-3 py-1.5 text-sm">{t('Close', '閉じる')}</button>
          <button type="button" onClick={() => void save()} disabled={busy || !clientId.trim() || !clientSecret.trim()} className="rounded border border-accent-2 px-3 py-1.5 text-sm text-accent-2-text disabled:opacity-50">{busy ? t('Saving…', '保存中…') : t('Save and restart', '保存して再起動')}</button>
        </div>
      </div>
    </div>
  )
}
