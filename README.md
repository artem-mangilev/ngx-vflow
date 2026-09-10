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

Use Node 22 (`nvm use`) and `npm ci`.

- `apps/docs`: NgDoc application; `apps/docs-e2e`: Playwright tests.
- `libs/ngx-vflow`: engine and `ngx-vflow/testing` entry point.
- `libs/ui`: optional `@vflow/ui` design system with compiled/source CSS and a separate BPMN entry point. See [Design system](https://www.ngx-vflow.org/design-system/overview).
- `npm start`: docs dev server with source imports and live reload.
- `npm run build:dev` / `npm run build`: all libraries and docs in development / production.
- `npm run start:hybrid`: build both libraries, then serve docs using their distribution entry points.
- `npm run lint`, `npm test`, `npm run e2e`: Nx verification targets.

See [release instructions](docs/releasing.md) for shared package versions, dry-runs and adding packages.
