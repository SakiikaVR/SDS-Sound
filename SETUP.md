# SDS-Sound のFreesound接続設定

Freesoundにログインするため、SDS-Sound専用のAPIアプリとOAuthトークン交換用Workerが必要です。Client Secretはデスクトップアプリに入れません。

## 1. FreesoundでAPIアプリを登録

[Freesound API申請ページ](https://freesound.org/apiv2/apply/)にFreesoundアカウントでログインし、SDS-Sound用アプリを作成します。Redirect URIは `http://localhost:8910/callback` にします。発行されたClient IDとClient Secretを控えます。Client IDは公開可能な識別子、Client Secretは秘密情報です。ログイン操作とAPIアプリの発行はアカウント所有者が行います。

Freesoundの[API利用規約](https://freesound.org/help/tos_api/)はアプリごとのアクセスキーを求めています。元アプリの認証情報をSDS-Soundの公開ビルドに流用しません。

## 2. OAuth Workerをデプロイ

Cloudflareアカウントにログインして、リポジトリの `worker/` をデプロイします。`worker/wrangler.toml` の公開Client IDをSDS-Sound用に設定し、Client SecretはCloudflareのSecretとして登録します。

```powershell
pnpm install --frozen-lockfile
pnpm --filter @superduper/token-worker exec wrangler secret put FREESOUND_CLIENT_SECRET
pnpm --filter @superduper/token-worker exec wrangler deploy
```

必要なCloudflare設定は[worker/README.md](worker/README.md)と[worker/SECURITY.md](worker/SECURITY.md)を参照してください。デプロイ後にWorker URLを控えます。

## 3. ビルド

`apps/desktop/.env.example` を `apps/desktop/.env` にコピーします。次の2項目にSDS-Sound用の値を入れます。`.env` はGit管理対象外です。

```dotenv
FREESOUND_CLIENT_ID=YOUR_SDS_SOUND_CLIENT_ID
FREESOUND_TOKEN_WORKER_URL=https://YOUR_WORKER.workers.dev
```

```powershell
pnpm --filter @superduper/desktop pack:win
```

ビルドしたアプリの「Freesoundでログイン」を押すと、システムブラウザーが開きます。Freesoundのアカウント認証情報やClient Secretをこのリポジトリ、GitHub Actionsの公開変数、デスクトップアプリに入力しないでください。

## 公開版

公開リリースでは、専用Client IDとWorker URLをGitHub Actionsのリポジトリ変数に登録します。WorkerのClient SecretはCloudflareのSecretにだけ登録します。公開ビルドのClient IDとWorker URLは解析可能な値として扱ってください。
