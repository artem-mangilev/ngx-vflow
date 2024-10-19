import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template edgeLabelHtml let-ctx>
      <div
        class="label"
        [style.background-color]="ctx.label.data.color"
        (click)="deleteEdge(ctx.edge)">Delete</div>
    </ng-template>
  </vflow>`,
  styles: [`
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class LabelsDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'default',
      text: '1'
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: 'default',
      text: '2'
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'default',
      text: '3'
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      edgeLabels: {
        center: {
          type: 'html-template',
          data: { color: '#122c26' }
        }
      }
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      edgeLabels: {
        center: {
          type: 'html-template',
          data: { color: '#8b599a' }
        }
      }
    },
  ]

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter(e => e !== edge)
  }
}

