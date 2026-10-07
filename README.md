<p align="center"><img src="apps/desktop/resources/icon.svg" width="120" alt="SDS-Sound ロゴ"></p>

# SDS-Sound

日本語で使える、Freesound対応の無料デスクトップサンプルブラウザー。Windows向けインストーラーを配布し、コードを公開しています。[Super Duper Core](https://github.com/Super-Duper-Software/super-duper-core)（MIT）を基に開発した非公式フォークです。

<p>
  <a href="https://github.com/SakiikaVR/SDS-Sound/releases/latest"><img src="https://img.shields.io/badge/Windows-ダウンロード-00A6B5?style=for-the-badge" alt="Windows版をダウンロード"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-111111?style=for-the-badge" alt="MITライセンス"></a>
</p>

[導入方法](INSTALL.md) · [接続設定](SETUP.md) · [ライセンス](THIRD_PARTY_NOTICES.md)

## ログイン方法

以下はSDS-Soundを実際に起動して撮影した画面です。認証情報を入力せずに撮影しています。

### 1. FreesoundのAPIアプリを登録

初回起動時に出る「Freesound 接続設定」で登録ページのリンクを開き、**自分のFreesoundアカウント**でAPIアプリを登録します。登録ページには次の値を入れます。

| 登録ページの欄 | 入力する値 |
| --- | --- |
| Name | `SDS-Sound` |
| URL | `https://github.com/SakiikaVR/SDS-Sound` |
| Callback URL | `http://localhost:8910/callback` |
| Description（必須） | `I use SDS-Sound to search, preview and download Freesound sounds for my personal sample library. I will follow each sound's license and attribution requirements.` |

「Description」はAPIを何に使うかを書く必須欄です。上の英文は入力例なので、自分の使い方に合わせて書き換えてください。Client Secretやパスワードは書きません。

![初回起動時のFreesound接続設定。登録リンク、登録する値、Client IDとClient Secretの入力欄が表示される](docs/screenshots/dark.png)

### 2. 発行された値をアプリに入力

Freesoundが発行した **Client ID** を画面上の「Client ID」欄、**Client Secret** をその下の「Client Secret」欄に入れ、「保存して再起動」を押します。Freesoundのログインパスワードは入力しません。Secretは端末内で暗号化保存されます。

### 3. ログインボタンを押す

再起動後、画面右上の「ログイン」または中央の「Freesoundでログイン」を押します。既定のブラウザーでFreesoundの認証ページが開いたら、ログインしてアクセスを許可します。完了するとアプリに戻り、検索・試聴・ダウンロードを使えます。

![設定後の検索画面。右上と中央にFreesoundログインボタンが表示される](docs/screenshots/light.png)

設定を変更する場合は右上の「その他」→「Freesound 接続設定」を開きます。Client Secretを公開リポジトリやスクリーンショットに載せないでください。詳しくは[接続設定](SETUP.md)を参照してください。

## 主な機能

| 機能 | 内容 |
| --- | --- |
| Freesound検索 | キーワード、タグ、ライセンス、長さなどで検索。ログインボタンからシステムブラウザーで認証します。 |
| BPM・キー | Freesoundの自動解析値で検索・絞り込み。値のない音源もあります。 |
| 類似音 | 選んだ音源を基に似た音を検索。 |
| 試聴・波形 | アプリ内で試聴。ダーク・ライト両モードの波形と文字選択は水色系です。 |
| ライブラリ | ダウンロードした音とローカル音声を管理。WAV、AIFF、FLAC、MP3、OGG、M4Aの取り込みに対応。 |
| コレクション | 音を整理して再利用。音声の編集、書き出し、DAWへのドラッグにも対応。 |
| 日本語 | アプリ画面とWindowsメニューを日本語化。設定から英語に切り替え可能。 |
| プライバシー | 広告・寄付ボタン・テレメトリーなし。複数端末同期なし。 |

## 動作環境と導入

Windows 10/11 x64。リリースページの `SDS-Sound-Setup-0.1.1.exe` をダウンロードして実行します。現時点でコード署名はありません。詳細は[INSTALL.md](INSTALL.md)を参照してください。macOS向けソースコードも含みますが、このリリースで配布・検証するのはWindows版です。

Freesound検索には各利用者のFreesoundアカウントとAPIアプリ登録が必要です。接続設定はアプリ内で行い、Cloudflareなどの外部サーバーは不要です。ローカルライブラリはログインなしで使えます。詳しくは[接続設定](SETUP.md)を参照してください。

## ソースからビルド

Node.js 24 と pnpm を用意します。ビルド時に認証情報は必要ありません。各利用者が初回起動時に自分のClient IDとSecretを設定します。

```powershell
pnpm install --frozen-lockfile
pnpm --filter @superduper/desktop typecheck
pnpm --filter @superduper/desktop test
pnpm --filter @superduper/desktop pack:win
```

生成物は `apps/desktop/dist/` にできます。

## ライセンスと出典

アプリのソースコードは[MIT](LICENSE)です。元のSuper Duper Softwareの著作権表示を保持しています。Splicerrのコードは含めていません。フォント、Electron、同梱するFFmpegなどの第三者コンポーネントは個別のライセンスに従います。[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)を参照してください。Freesoundの各音声には個別のCreative Commonsライセンスがあり、ダウンロードした音源の利用条件を確認してください。

## 現在の制限

BPM・キーはFreesoundの自動解析値で、すべての音源に付いているわけではありません。Windowsインストーラーは未署名です。実アカウントでのOAuth、検索、ダウンロードはまだ未検証です。詳しくは[GAPS.ja.md](GAPS.ja.md)を参照してください。
