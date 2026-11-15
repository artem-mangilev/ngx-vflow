<div align="center">

# ngx-vflow

[![NPM Version](https://img.shields.io/npm/v/ngx-vflow?color=blue)](https://www.npmjs.com/package/ngx-vflow)
[![License](https://img.shields.io/badge/license-MIT-007EC7.svg)](LICENSE)
[![Discord](https://img.shields.io/badge/discord-ngx--vflow-5865F2?logo=discord&logoColor=white)](https://discord.gg/RavS5ydTJV)

**A powerful Angular library for building node-based UIs**

[Documentation](https://www.ngx-vflow.org/) • [API Reference](https://www.ngx-vflow.org/api)

</div>

<img width="1305" alt="ngx-vflow showcase" src="https://github.com/artem-mangilev/ngx-vflow/assets/53087914/5cbd3669-10a5-4ecb-9a1f-c9ae4eb5fb5a">

---

- **Declarative API & Full Customization** - Custom nodes, edges, and handles with Angular components
- **Subflows** - Create nested flows with parent-child relationships
- **Interactive Connections** - Create, validate, and reconnect edges
- **Rich Interactions** - Dragging, selecting, zooming, panning, and keyboard shortcuts
- **Precise Control** - Snap to grid, alignment helpers, and custom backgrounds
- **Navigation** - Built-in minimap
- **Performance** - Virtualization and lazy loading for large graphs
- **Reactivity** - Uses Signals to keep internal and external states in sync
- **Layout Algorithms** - Integration with any layouts

## Installation

```bash
npm install ngx-vflow --save
```

## Version Compatibility

| ngx-vflow   | Angular   |
| ----------- | --------- |
| v0.x        | v16.2.0+  |
| v1.x        | v17.3.12+ |
| v2.x        | v19.2.17+ |
| v3.x (next) | v20.0.0+  |

## Community & Support

- Join our [Discord community](https://discord.gg/RavS5ydTJV) for help and discussions
- Report bugs and request features on [GitHub Issues](https://github.com/artem-mangilev/ngx-vflow/issues)
- Check out the [documentation](https://www.ngx-vflow.org/) for guides and examples

## License

MIT © [Artem Mangilev](https://github.com/artem-mangilev)

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

See [release instructions](docs/releasing.md) for shared package versions, dry-runs and adding packages.
