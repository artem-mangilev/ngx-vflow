import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Edge, Node, Vflow, Connection, createNodes } from 'ngx-vflow';
import { SquareHandleComponent } from './square-handle.component';

@Component({
  templateUrl: './custom-handles-demo.component.html',
  styleUrls: ['./custom-handles-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow, SquareHandleComponent],
})
export class CustomHandlesDemoComponent {
  public outputOneCanStart = signal(true);
  public inputOneCanAccept = signal(true);

  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 0, y: 150 },
      data: {
        type: 'output',
        output1: 'output1',
        output2: 'output2',
      },
    },
    {
      id: '2',
      point: { x: 250, y: 100 },
      data: {
        type: 'input',
        input1: 'input1',
        input2: 'input2',
      },
    },
  ]);

  public edges: Edge[] = [];

  public createEdge({ source, target, sourceHandle, targetHandle }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}${sourceHandle ?? ''}${targetHandle ?? ''}`,
        markers: signal({
          start: { type: 'arrow-closed' },
          end: { type: 'arrow-closed' },
        }),
        source,
        target,
        sourceHandle,
        targetHandle,
      },
    ];
  }

  public setOutputOneCanStart(enabled: boolean): void {
    this.outputOneCanStart.set(enabled);
  }

  public setInputOneCanAccept(enabled: boolean): void {
    this.inputOneCanAccept.set(enabled);
  }
}
