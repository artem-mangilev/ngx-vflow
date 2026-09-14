import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { KeyboardShortcuts, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [keyboardShortcuts]="shortcuts">
    <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class KeyboardShortcutsDemoComponent {
  public shortcuts: KeyboardShortcuts = {
    selection: ['AltLeft', 'AltRight'],
    multiSelection: ['ShiftLeft', 'ShiftRight'],
  };

  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 10 },
      data: { text: `1` },
      parentId: '3',
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      data: { text: `<strong>2</strong>` },
    },
    {
      id: '3',
      point: { x: 10, y: 10 },
      data: { type: 'group' },
      width: 150,
      height: 150,
    },
  ]);
}
