import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '../../../../../shared/flow-presentations';
import { KeyboardShortcuts, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [keyboardShortcuts]="shortcuts">
    <ng-template let-ctx nodeHtml><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx groupNode><docs-group [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edgeLabelHtml><docs-edge-label [ctx]="ctx" /></ng-template>
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
      type: 'html-template',
      data: { text: `1` },
      parentId: '3',
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: 'html-template',
      data: { text: `<strong>2</strong>` },
    },
    {
      id: '3',
      point: { x: 10, y: 10 },
      type: 'template-group',
      width: 150,
      height: 150,
    },
  ]);
}
