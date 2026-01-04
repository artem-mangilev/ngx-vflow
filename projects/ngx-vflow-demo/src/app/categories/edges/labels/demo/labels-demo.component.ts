import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx edgeLabelHtml>
      <div class="label" [style.background-color]="ctx.label.data.color" (click)="deleteEdge(ctx.edge)">Delete</div>
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
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
  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 50, y: 200 }),
      type: 'default',
      text: signal('1'),
    },
    {
      id: '2',
      point: signal({ x: 350, y: 100 }),
      type: 'default',
      text: signal('2'),
    },
    {
      id: '3',
      point: signal({ x: 350, y: 300 }),
      type: 'default',
      text: signal('3'),
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: signal('smooth-step'),
      edgeLabels: signal({
        start: {
          type: 'default',
          text: 'Start',
          style: {
            background: '#e3f2fd',
            color: '#1976d2',
            padding: '2px 6px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500',
          },
        },
        center: {
          type: 'html-template',
          data: { color: '#122c26' },
        },
        end: {
          type: 'default',
          text: 'End',
          style: {
            background: '#e8f5e8',
            color: '#2e7d32',
            padding: '2px 6px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500',
          },
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
          style: {
            color: 'black',
            background: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
          },
        },
      }),
    },
  ];

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter((e) => e !== edge);
  }
}
