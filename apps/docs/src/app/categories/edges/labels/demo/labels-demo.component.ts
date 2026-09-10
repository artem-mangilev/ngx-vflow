import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx edgeLabelHtml>
      @if (ctx.label.data.kind === 'delete') {
        <button class="label" (click)="deleteEdge(ctx.edge)">Delete</button>
      } @else {
        <span class="endpoint-label" [class.end]="ctx.label.data.kind === 'end'">{{ ctx.label.data.text }}</span>
      }
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
        --vflow-edge-label-color: black;
        --vflow-edge-label-background: #f5f5f5;
        --vflow-edge-label-padding: 4px 8px;
        --vflow-edge-label-radius: 4px;
        --vflow-edge-label-font-size: 12px;
      }

      .endpoint-label {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 6px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }
      .endpoint-label.end {
        background: #e8f5e8;
        color: #2e7d32;
      }
      .label {
        width: 60px;
        height: 25px;
        background-color: #122c26;
        border-radius: 5px;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class LabelsDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 50, y: 200 },
      type: 'default',
      text: '1',
    },
    {
      id: '2',
      point: { x: 350, y: 100 },
      type: 'default',
      text: '2',
    },
    {
      id: '3',
      point: { x: 350, y: 300 },
      type: 'default',
      text: '3',
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: signal('smooth-step'),
      edgeLabels: signal({
        start: {
          type: 'html-template',
          data: { kind: 'start', text: 'Start' },
        },
        center: {
          type: 'html-template',
          data: { kind: 'delete' },
        },
        end: {
          type: 'html-template',
          data: { kind: 'end', text: 'End' },
        },
      }),
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: signal('smooth-step'),
      edgeLabels: signal({
        center: {
          type: 'default',
          text: 'Center Only',
        },
      }),
    },
  ];

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter((e) => e !== edge);
  }
}
