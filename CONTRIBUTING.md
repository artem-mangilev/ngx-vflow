# Contributing

Bugs and ideas go to [GitHub Issues](https://github.com/artem-mangilev/ngx-vflow/issues), questions to [Discord](https://discord.gg/RavS5ydTJV).

## Development

Use Node 24 (`nvm use`), pnpm (`corepack enable`) and `pnpm install`.

- `libs/ngx-vflow`: engine; `libs/routing`, `libs/auto-size`, `libs/layout`: extension packages.
- `libs/ui`: optional `@vflow/ui` design system (Tailwind CSS 4).
- `apps/docs`: NgDoc application; `apps/docs-e2e`: Playwright tests.

The workspace has two Angular versions and one lockfile. Every project declares what it needs in its own
`package.json`:

- `libs/<name>/package.json`: besides what the package publishes, its `devDependencies` are what it is built and
  tested with, the oldest supported Angular. The versions the libraries share are the `libs` catalog of
  [pnpm-workspace.yaml](pnpm-workspace.yaml). A library builds into `libs/<name>/dist`; the packages that extend
  the core get the built core from `node_modules`, like an application.
- `apps/docs/package.json`: the Angular version the latest NgDoc needs. The docs never import library sources:
  `docs:libs` builds the libraries the docs depend on and copies the packages to `apps/docs/libs` (see
  [apps/docs/scripts/libs.mjs](apps/docs/scripts/libs.mjs)).
- the root `package.json`: the tools of the repository only (Nx, ESLint, Prettier, the git hooks). No project
  imports from it.

Both Angular versions share one pnpm store, so a package must never find the Angular it did not ask for: the
settings in `pnpm-workspace.yaml` make an undeclared import or a missing peer dependency fail instead.

Everything runs through Nx, the docs included: `docs:build` and `docs:serve` are the NgDoc builders of
`apps/docs/node_modules`, a library builds with the ng-packagr builder of its own `node_modules`, and there is
no Angular CLI workspace.

- `pnpm start` (`nx serve docs`): the docs dev server. `nx watch` follows the libraries and runs `docs:libs` after
  every change, so saving a file of a library, of `@vflow/ui` or of the docs reloads the page. Arguments go to the
  dev server, e.g. `pnpm start --port 4300`. `nx watch` needs the Nx daemon: if it reports that the daemon is not
  running, `pnpm nx reset` clears a stale marker.
- `pnpm build:dev` / `pnpm build`: all libraries in development / production, and the docs.
- `pnpm lint`, `pnpm test`, `pnpm e2e`: Nx verification targets.

## Releasing

`ngx-vflow`, `@vflow/cli`, `@vflow/routing`, `@vflow/layout` and `@vflow/auto-size` form one Nx Release group (the
`release` project tag): they always share one version and one `v{version}` tag. Nx picks the bump from conventional
commits since the last tag (`feat!:` or `BREAKING CHANGE:` is major). `@vflow/ui` is never published.

- `pnpm release:dry-run` previews versions, manifests and the changelog locally.
- GitHub Actions → `release` on `main`: run with `dry_run=true`, check the packages, then again with
  `dry_run=false`. It needs the `NPM_TOKEN` secret with publish rights in the `@vflow` scope.
- `version=3.0.0-alpha` publishes a snapshot of any branch under the `alpha` dist-tag and pushes nothing.

npm has no atomic multi-package publish: if one package fails, publish the missing ones at the same version
instead of bumping again.
