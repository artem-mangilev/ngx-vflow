import { VflowCardNode } from '@vflow/ui';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Edge, Node, SelectionBoxMode, SelectionBoxSettings, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `
    <div class="controls">
      <button type="button" [class.active]="mode() === 'full'" (click)="setMode('full')">Mode: full</button>
      <button type="button" [class.active]="mode() === 'partial'" (click)="setMode('partial')">Mode: partial</button>
      <span class="hint">Hold Shift and drag on canvas</span>
    </div>

    <vflow view="auto" data-vui-theme="light" [nodes]="nodes" [edges]="edges" [selectionBox]="selectionBox()"
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
    >
  `,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 8px;
      }

      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      button {
        border: 1px solid #cfd8dc;
        background: #fff;
        color: #0f4c75;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
      }

      button.active {
        background: #0f4c75;
        color: #fff;
      }

      .hint {
        color: #4a6572;
        font-size: 12px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class SelectionBoxDemoComponent {
  public mode = signal<SelectionBoxMode>('full');

  public selectionBox = computed<SelectionBoxSettings>(() => ({
    mode: this.mode(),
    color: '#ff8a65',
  }));

  public setMode(mode: SelectionBoxMode) {
    this.mode.set(mode);
  }

  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 40, y: 120 },
      type: VflowCardNode,
      data: { text: 'Node 1' },
      ariaLabel: 'Node 1',
    },
    {
      id: '2',
      point: { x: 260, y: 150 },
      type: VflowCardNode,
      data: { text: 'Node 2' },
      ariaLabel: 'Node 2',
    },
    {
      id: '3',
      point: { x: 430, y: 95 },
      type: VflowCardNode,
      data: { text: 'Node 3' },
      ariaLabel: 'Node 3',
    },
    {
      id: '4',
      point: { x: 360, y: 300 },
      type: VflowCardNode,
      data: { text: 'Node 4' },
      ariaLabel: 'Node 4',
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '2 -> 3',
      source: '2',
      target: '3',
    },
    {
      id: '2 -> 4',
      source: '2',
      target: '4',
    },
  ];
}
