# Freesoundの接続設定（外部サーバー不要）

SDS-Soundの公開インストーラーにはClient IDもClient Secretも入っていません。利用者が自分のFreesound APIアプリを登録し、初回起動時にアプリ内で設定します。設定後、ログインボタンから既定ブラウザーでFreesoundにログインします。

## 1. APIアプリを登録

[Freesound API申請ページ](https://freesound.org/apiv2/apply/)に自分のFreesoundアカウントでログインし、次のように入力します。

| Freesoundの欄 | 入力する値 |
| --- | --- |
| Name | `SDS-Sound` |
| URL | `https://github.com/SakiikaVR/SDS-Sound` |
| Callback URL | `http://localhost:8910/callback` |
| Description（必須） | `I use SDS-Sound to search, preview and download Freesound sounds for my personal sample library. I will follow each sound's license and attribution requirements.` |

DescriptionにはAPIの利用目的を自分の言葉で書きます。表の英文は例です。Client Secretやパスワードは書かないでください。登録後、発行されたClient IDとClient Secretを控えます。Freesoundのログインパスワードとは別の値です。

## 2. SDS-Soundに入力

SDS-Soundを起動すると接続設定画面が出ます。発行画面のClient IDを同名の欄、Client Secretを同名の欄に貼り付けて「保存して再起動」を押します。SecretはWindowsの暗号化機能を使って端末内に保存します。公開リポジトリ、チャット、スクリーンショットには載せないでください。設定の変更はアプリ右上の「その他」→「Freesound 接続設定」から行えます。

## 3. ログイン

再起動後、「ログイン」または「Freesoundでログイン」を押すと既定ブラウザーが開きます。Freesoundで許可するとアプリに戻り、検索とダウンロードを使えます。

認証コードとリフレッシュトークンの交換は端末からFreesoundへ直接送ります。各利用者が自分のAPI認証情報を使うため、Cloudflareなどの外部Workerは不要です。FreesoundのAPI利用規約と各音声のライセンスを守ってください。SDS-Soundをアンインストールしてもライブラリと接続設定は自動削除しません。
