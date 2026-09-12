import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>

    <ng-template let-ctx nodeHtml><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx groupNode><docs-group [ctx]="ctx" /></ng-template>

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
  imports: [DocsPresentations, Vflow],
})
export class LabelsDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 50, y: 200 },
      type: 'html-template',
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 350, y: 100 },
      type: 'html-template',
      data: { text: '2' },
    },
    {
      id: '3',
      point: { x: 350, y: 300 },
      type: 'html-template',
      data: { text: '3' },
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
          data: 'Start',
        },
        center: {
          type: 'html-template',
          data: { color: '#122c26' },
        },
        end: {
          type: 'html-template',
          data: 'End',
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
          type: 'html-template',
          data: 'Center Only',
        },
      }),
    },
  ];

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter((e) => e !== edge);
  }
}
