<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/readme/cover-dark.png">
  <img alt="vflow: two color nodes and an angle node wired into a gradient node" src=".github/readme/cover-light.png">
</picture>

<div align="center">

[![npm version](https://img.shields.io/npm/v/ngx-vflow?color=3282b8)](https://www.npmjs.com/package/ngx-vflow)
[![npm downloads](https://img.shields.io/npm/dm/ngx-vflow?color=3282b8)](https://www.npmjs.com/package/ngx-vflow)
[![License](https://img.shields.io/npm/l/ngx-vflow?color=3282b8)](LICENSE)
[![Discord](https://img.shields.io/badge/discord-join-5865F2?logo=discord&logoColor=white)](https://discord.gg/RavS5ydTJV)

**ngx-vflow is an Angular library for building node-based editors and interactive diagrams.**

[Quickstart](https://www.ngx-vflow.org/docs/getting-started/quickstart) ·
[Docs](https://www.ngx-vflow.org/) ·
[Examples](https://www.ngx-vflow.org/examples/feature-overview) ·
[Discord](https://discord.gg/RavS5ydTJV)

</div>

## Features

- **Headless**: nodes, edges and handles are your own Angular templates and components
- **Connections**: drag from handle to handle, validate, reconnect
- **Editing**: drag, select, resize, snap, align, delete, keyboard shortcuts
- **Subflows**: nodes inside nodes
- **Viewport**: pan, zoom, fit, minimap, backgrounds, panels
- **Accessible**: nodes and edges are reachable from the keyboard and labeled for screen readers
- **Fast**: built on signals, with virtualization and lazy loading for large graphs

## Quickstart

```bash
npm i ngx-vflow

# optional design system
npx @vflow/cli ui
```

```ts
import { Component, signal } from '@angular/core';
import { Vui } from '@vflow/ui';
import { Connection, createNodes, Edge, Vflow } from 'ngx-vflow';

@Component({
  selector: 'app-flow',
  imports: [Vflow, Vui],
  template: `
    <vflow [nodes]="nodes" [edges]="edges()" (connect)="connect($event)">
      <div *vNode="let ctx" vuiNode>
        <span vuiPort handleType="target" position="left"></span>
        {{ ctx.data().label }}
        <span vuiPort handleType="source" position="right"></span>
      </div>

      <svg:g *vEdge>
        <svg:path vuiEdge />
      </svg:g>
    </vflow>
  `,
})
export class FlowComponent {
  nodes = createNodes([
    { id: 'fetch', point: { x: 40, y: 120 }, data: { label: 'Fetch orders' } },
    { id: 'remind', point: { x: 280, y: 120 }, data: { label: 'Send reminder' } },
  ]);

  edges = signal<Edge[]>([]);

  connect(connection: Connection) {
    this.edges.update((edges) => [...edges, { id: crypto.randomUUID(), ...connection }]);
  }
}
```

## Packages

| Package                                                            |                                                          |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| [`ngx-vflow`](https://www.ngx-vflow.org/)                          | The engine: canvas, nodes, edges, handles, interactions  |
| [`@vflow/ui`](https://www.ngx-vflow.org/packages/ui/overview)      | Styled parts copied into your app by `npx @vflow/cli ui` |
| [`@vflow/routing`](https://www.ngx-vflow.org/packages/routing)     | Edges that route around nodes                            |
| [`@vflow/layout`](https://www.ngx-vflow.org/packages/layout)       | Automatic layouts: dagre, ELK, d3-force                  |
| [`@vflow/auto-size`](https://www.ngx-vflow.org/packages/auto-size) | Parent nodes that grow around their children             |

## Compatibility

| ngx-vflow   | Angular   |
| ----------- | --------- |
| v3.x (next) | v20.0.0+  |
| v2.x        | v19.2.17+ |
| v1.x        | v17.3.12+ |
| v0.x        | v16.2.0+  |

## Community

Questions go to [Discord](https://discord.gg/RavS5ydTJV), bugs and ideas to
[GitHub Issues](https://github.com/artem-mangilev/ngx-vflow/issues). To work on the library itself, see
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © [Artem Mangilev](https://github.com/artem-mangilev)
