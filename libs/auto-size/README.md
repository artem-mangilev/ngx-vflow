# @vflow/auto-size

Parent nodes that grow around their children for [ngx-vflow](https://www.ngx-vflow.org/): drag or resize a child past the side of its parent and the parent grows to keep it, through every level of nesting.

```bash
npm i @vflow/auto-size
```

```html
<vflow vxAutoSize [vxAutoSizePadding]="16" [nodes]="nodes" />
```

```ts
import { VxAutoSize } from '@vflow/auto-size';
```

A parent grows on the axes it sizes with its `width` and `height` signals; children that may leave it need `extent: null`. See the [Auto size](https://www.ngx-vflow.org/packages/auto-size) page for the inputs. Requires `ngx-vflow` 3 and Angular 20, 21 or 22. Versions and releases are shared with `ngx-vflow`.
