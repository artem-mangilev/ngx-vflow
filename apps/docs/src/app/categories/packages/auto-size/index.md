---
keyword: 'PackagesAutoSize'
---

`@vflow/auto-size` grows a parent node around its children while they are dragged or resized, through every level of nesting. Drag a developer out of the squad, or the squad out of the team: the parent grows to keep it, with a padding, and keeps its other children where they are.

{{ NgDocActions.demoPane("AutoSizeDemoComponent") }}

## Installation

```bash
npm i @vflow/auto-size
```

The package depends on `ngx-vflow` 3 and ships no styles.

## Usage

Put the `vxAutoSize` directive on the flow:

```html
<vflow vxAutoSize [vxAutoSizePadding]="16" [nodes]="nodes" />
```

```ts
import { VxAutoSize } from '@vflow/auto-size';
```

The directive reacts to the drag events and the size changes of the flow and writes the `point`, `width` and `height` signals of the parents, as the resizer does. The graph state stays with the application.

## Inputs

| Input                    | Default | Meaning                                                                                                   |
| ------------------------ | ------- | --------------------------------------------------------------------------------------------------------- |
| `vxAutoSizePadding`      | `24`    | Space kept between the children and the sides of the parent: a number, or `{ top, right, bottom, left }`. |
| `vxAutoSizeShouldResize` | all     | `(parent: Node) => boolean`: which parents grow, for example only the nodes marked as groups.             |
| `vxAutoSizeShrink`       | `false` | Whether a parent also shrinks to its children once a drag ends or a child is resized.                     |

## What a parent needs

- An explicit size on the axes that grow: a `width` signal for the horizontal axis, a `height` signal for the vertical one. An axis that follows the content is left alone.
- Children with `extent: null`. With `extent: 'parent'`, the default, the flow holds a dragged child inside its parent before the parent can grow.

Growth to the left or the top moves the origin of the parent and compensates every child, so nothing moves on screen; the flow keeps the dragged node under the pointer while its parent moves. A parent that is itself a child grows its own parent in turn, the deepest first.
