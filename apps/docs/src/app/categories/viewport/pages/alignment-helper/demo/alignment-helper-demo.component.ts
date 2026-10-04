import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [alignmentHelper]="true">
    <ng-template let-ctx vNode><docs-node [ctx]="ctx" /></ng-template>
    <ng-template let-ctx vEdge><svg:g docsEdge [ctx]="ctx" /></ng-template>
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
      point: { x: 40, y: 110 },
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
      point: { x: 450, y: 90 },
      data: { text: `4<br />drag me level with 2` },
    },
    {
      id: '5',
      point: { x: 10, y: 300 },
      data: { text: `5` },
    },
    {
      id: '6',
      point: { x: 300, y: 300 },
      data: { text: `6` },
    },
    {
      id: '7',
      point: { x: 450, y: 220 },
      data: { text: `7<br />between 5 and 6` },
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
  ];
}
