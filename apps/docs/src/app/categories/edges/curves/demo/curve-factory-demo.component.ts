import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '../../../../shared/flow-presentations';
import { CurveFactory, Edge, Node, Vflow, createNodes } from 'ngx-vflow';

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
export class CurveFactoryDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 30, y: 100 },
      type: 'html-template',
      data: { text: '1' },
    },
    {
      id: '2',
      point: { x: 220, y: 100 },
      type: 'html-template',
      data: { text: '2' },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: signal(straightCurve),
    },
  ];
}

export const straightCurve: CurveFactory = ({ sourcePoint, targetPoint }) => {
  return {
    path: `M ${sourcePoint.x},${sourcePoint.y}L ${targetPoint.x},${targetPoint.y}`,
  };
};
