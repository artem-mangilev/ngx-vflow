import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { ConnectionSettings, Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" [connection]="connectionSettings">
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
export class CurvesDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 30, y: 100 },
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 220, y: 0 },
      data: { text: '2' },
    },
    {
      id: '3',
      point: { x: 220, y: 200 },
      data: { text: '3' },
    },
    {
      id: '4',
      point: { x: 30, y: 300 },
      data: { text: '4' },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: signal('bezier'),
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: signal('straight'),
    },
    {
      id: '1 -> 4',
      source: '1',
      target: '4',
      curve: signal('smooth-step'),
    },
  ];

  public connectionSettings: ConnectionSettings = {
    curve: 'smooth-step',
  };
}
