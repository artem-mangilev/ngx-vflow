<img width="1305" alt="image" src="https://github.com/artem-mangilev/ngx-vflow/assets/53087914/3520a5a4-9a8f-40d6-9c3f-50d16fabc48f">

---

`ngx-vflow` is an Angular library for creating node-based applications. It aims to assist you in building anything from a static diagram to a visual editor. You can utilize the default design or apply your own by customizing everything using familiar technologies.

## Installation

```
npm i ngx-vflow --save
```

## Version Compatibility

| ngx-vlow | Angular   |
| -------- | --------- |
| v0.x     | v16.2.0+  |
| v1.x     | v17.3.12+ |

## Basic Example

The following code describes 3 nodes and creates 2 edges between them.

```ts
@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class DefaultEdgesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'default',
      text: '1',
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: 'default',
      text: '2',
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'default',
      text: '3',
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
    },
  ];
}
```

The code above renders to this:

<img width="398" alt="image" src="https://github.com/artem-mangilev/ngx-vflow/assets/53087914/2a1b778a-2bfa-4176-9d50-065fdb1f1dec">

For more complex example you may see the documentation: https://www.ngx-vflow.org/

## API

`vflow` component API is described here: https://www.ngx-vflow.org/api/ngx-vflow/classes/VflowComponent

Host directives for `vflow` that you may find helpful:

- https://www.ngx-vflow.org/api/ngx-vflow/classes/ConnectionControllerDirective
- https://www.ngx-vflow.org/api/ngx-vflow/classes/ChangesControllerDirective

## License

MIT
