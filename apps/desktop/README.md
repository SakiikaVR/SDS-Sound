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

The `@superduper/desktop` package name is an internal workspace identifier inherited from Super Duper Core. The installed application is named SDS-Sound. The installer contains no Freesound credentials. Each user registers an API application and enters their Client ID and Secret in the app. The Secret is encrypted with Electron safeStorage on the local machine.