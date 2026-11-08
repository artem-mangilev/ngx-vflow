import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { KeyboardShortcuts, Node, Vflow, createNodes, provideVflow, withShortcuts } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes">
    <docs-node *vNode="let ctx" [ctx]="ctx" />
    <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
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
  providers: [provideVflow(withShortcuts(() => inject(KeyboardShortcutsDemoComponent).shortcuts))],
})
export class KeyboardShortcutsDemoComponent {
  public shortcuts: KeyboardShortcuts = {
    modifiers: {
      selection: ['Alt'],
      multiSelection: ['Shift'],
    },
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
