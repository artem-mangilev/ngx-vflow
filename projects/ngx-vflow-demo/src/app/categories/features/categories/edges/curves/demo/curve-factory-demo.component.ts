import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CurveFactory, Edge, Node, Vflow } from 'ngx-vflow';

@Component({
  template: `<vflow view="auto" [nodes]="nodes" [edges]="edges" />`,
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class CurveFactoryDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 30, y: 100 },
      type: 'default',
      text: '1',
    },
    {
      id: '2',
      point: { x: 220, y: 100 },
      type: 'default',
      text: '2',
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      curve: straightCurve,
    },
  ];
}

export const straightCurve: CurveFactory = ({ sourcePoint, targetPoint }) => {
  return {
    path: `M ${sourcePoint.x},${sourcePoint.y}L ${targetPoint.x},${targetPoint.y}`,
  };
};
