import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import { createEdges, createNodes, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges">
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
export class DefaultEdgesDemoComponent {
  public nodes = createNodes([
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'html-template',
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 200, y: 100 },
      type: 'html-template',
      data: { text: '2' },
    },
    {
      id: '3',
      point: { x: 200, y: 300 },
      type: 'html-template',
      data: { text: '3' },
    },
  ]);

  public edges = createEdges([
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      selected: true,
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      selected: true,
    },
  ]);
}
