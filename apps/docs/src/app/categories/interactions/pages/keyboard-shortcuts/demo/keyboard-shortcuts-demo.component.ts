import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KeyboardShortcuts, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" data-vui-theme="light" [nodes]="nodes" [keyboardShortcuts]="shortcuts"
    ><ng-template let-ctx edge
      ><svg:g customTemplateEdge selectable>
        <svg:path
          class="vui-edge"
          [attr.d]="ctx.path()"
          [attr.marker-start]="ctx.markerStart()"
          [attr.marker-end]="ctx.markerEnd()"
          [attr.data-vui-selected]="ctx.selected() || ctx.preselected()" /></svg:g></ng-template
    ><ng-template let-ctx edgeLabelHtml
      ><span class="vui-edge-label">{{ ctx.label.data }}</span></ng-template
    ></vflow
  >`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
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
      type: VflowCardNode,
      data: { text: `1` },
      ariaLabel: `1`,
      parentId: '3',
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: VflowCardNode,
      data: { text: `2` },
      ariaLabel: `2`,
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
