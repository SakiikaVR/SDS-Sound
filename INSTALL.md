# SDS-Sound のインストール

## Windows 10/11（x64）

[Releases](https://github.com/SakiikaVR/SDS-Sound/releases) から `SDS-Sound-Setup-0.1.1.exe` をダウンロードして実行します。インストール先は変更できます。インストーラーは現在コード署名されていないため、Windows SmartScreenの確認画面が出る場合があります。

ダウンロード後はリリースに添付した `SHA256SUMS.txt` とファイルのSHA-256を照合できます。

```powershell
Get-FileHash .\SDS-Sound-Setup-0.1.1.exe -Algorithm SHA256
```

起動後、ローカルライブラリはアカウントなしで使えます。Freesoundの検索とダウンロードにはログインが必要です。ログインを押すと既定のブラウザーでFreesoundの認証画面が開きます。初回起動時に自分のFreesound APIアプリのClient IDとSecretを設定してください。[SETUP.md](SETUP.md)を参照してください。

## アンインストール

Windowsの「インストールされているアプリ」からSDS-Soundを削除します。ライブラリなどのユーザーデータはアンインストール時に自動削除しません。
