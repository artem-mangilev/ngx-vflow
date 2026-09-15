import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowPort } from '@vflow/ui';
import { Edge, Node, Vflow, createNodes } from 'ngx-vflow';

@Component({
  templateUrl: './selecting-demo.component.html',
  styleUrls: ['./selecting-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, VflowPort],
})
export class SelectingDemoComponent {
  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 10, y: 150 },
    },
    {
      id: '2',
      point: { x: 290, y: 50 },
      data: { text: 'Selectable' },
    },
    {
      id: '3',
      point: { x: 290, y: 300 },
      data: { text: 'Selectable' },
    },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
    },
  ];
}
