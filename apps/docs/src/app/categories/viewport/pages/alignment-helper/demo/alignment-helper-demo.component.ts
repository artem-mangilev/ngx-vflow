import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [alignmentHelper]="true">
    <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
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
export class AlignmentHelperDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 10 },
      data: { text: `1` },
    },
    {
      id: '2',
      point: { x: 90, y: 80 },
      // it's possible to pass html in this field
      data: { text: `<strong>2</strong>` },
      parentId: '3',
    },
    {
      id: '3',
      point: { x: 150, y: 10 },
      data: { type: 'group' },
      width: 250,
      height: 250,
    },
    {
      id: '4',
      point: { x: 450, y: 70 },
      data: { text: `4` },
    },
  ]);

  public edges: Edge[] = [
    {
      source: '1',
      target: '2',
      id: '1 -> 2',
    },
    {
      source: '2',
      target: '4',
      id: '2 -> 4',
    },
    {
      source: '5',
      target: '4',
      id: '5 -> 4',
    },
  ];
}
