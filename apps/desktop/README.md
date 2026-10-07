# SDS-Sound desktop app

The Electron desktop client. See the repository [README](../../README.md) for features, real screenshots, licensing and downloads. See [SETUP](../../SETUP.md) for Freesound OAuth configuration.

From the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm --filter @superduper/desktop typecheck
pnpm --filter @superduper/desktop test
pnpm --filter @superduper/desktop dev
pnpm --filter @superduper/desktop pack:win
```

The `@superduper/desktop` package name is an internal workspace identifier inherited from Super Duper Core. The installed application is named SDS-Sound. Release installers require SDS-Sound's own `FREESOUND_CLIENT_ID` and `FREESOUND_TOKEN_WORKER_URL` at build time. Never put `FREESOUND_CLIENT_SECRET` in the desktop app.