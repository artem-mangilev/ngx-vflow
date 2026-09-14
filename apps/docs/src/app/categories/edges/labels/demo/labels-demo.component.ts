import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowUi } from '@vflow/ui';
import { Edge, Node, Vflow, createEdges, createNodes } from 'ngx-vflow';

interface LabelData {
  start?: string;
  center?: string;
  end?: string;
  deletable?: boolean;
}

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
    <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>

    <ng-template let-ctx edge>
      <svg:g docsEdge [ctx]="ctx" />

      @if (ctx.data().start; as text) {
        <span *edgeLabel="'start'" vflowEdgeLabel>{{ text }}</span>
      }
      @if (ctx.data().deletable) {
        <button *edgeLabel class="delete" type="button" (click)="deleteEdge(ctx.edge)">Delete</button>
      } @else if (ctx.data().center; as text) {
        <span *edgeLabel vflowEdgeLabel>{{ text }}</span>
      }
      @if (ctx.data().end; as text) {
        <span *edgeLabel="'end'" vflowEdgeLabel>{{ text }}</span>
      }
    </ng-template>
  </vflow>`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }

      .delete {
        width: 60px;
        height: 25px;
        border: none;
        border-radius: 5px;
        background-color: #122c26;
        color: white;
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VflowUi],
})
export class LabelsDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 50, y: 200 },
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 350, y: 100 },
      data: { text: '2' },
    },
    {
      id: '3',
      point: { x: 350, y: 300 },
      data: { text: '3' },
    },
  ]);

  public edges: Edge<LabelData>[] = createEdges<LabelData>([
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: 'smooth-step',
      data: { start: 'Start', deletable: true, end: 'End' },
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: 'smooth-step',
      data: { center: 'Center Only' },
    },
  ]);

  public deleteEdge(edge: Edge<LabelData>) {
    this.edges = this.edges.filter((e) => e !== edge);
  }
}
