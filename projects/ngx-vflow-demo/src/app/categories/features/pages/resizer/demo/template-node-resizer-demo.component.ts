
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Edge, Node, VflowModule, Connection } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  template: `
    <vflow view="auto" [nodes]="nodes" [edges]="edges">
      <ng-template nodeHtml let-ctx>
        @if (ctx.node.data.type === 'output') {
          <div resizable class="custom-node">
            <div class="data-block">
              Output 1
              <handle position="right" type="source" [id]="ctx.node.data.output1"/>
            </div>
            <div class="data-block">
              Output 2
              <handle position="right" type="source" [id]="ctx.node.data.output2"/>
            </div>
          </div>
        }
    
        @if (ctx.node.data.type === 'input') {
          <div resizable class="custom-node">
            <div class="data-block">
              Input 1
              <handle position="left" type="target" [id]="ctx.node.data.input1"/>
            </div>
            <div class="data-block">
              Input 2
              <handle position="left" type="target" [id]="ctx.node.data.input2"/>
            </div>
          </div>
        }
      </ng-template>
    </vflow>
    `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }

    .custom-node {
      min-width: 150px;
      min-height: 100px;
      height: 100%;
      background-color: #0f4c75;
      border: 1px solid gray;
      border-radius: 5px;
      padding-left: 7px;
      padding-right: 7px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: stretch;
    }

    .data-block {
      background-color: #ffffff;
      color: #1b262c;
      border-radius: 5px;
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class TemplateNodeResizerDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 0, y: 150 },
      type: 'html-template',
      data: {
        type: 'output',
        output1: 'output1',
        output2: 'output2'
      }
    },
    {
      id: '2',
      point: { x: 250, y: 100 },
      type: 'html-template',
      data: {
        type: 'input',
        input1: 'input1',
        input2: 'input2'
      }
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2 one',
      source: '1',
      target: '2',
      sourceHandle: 'output1',
      targetHandle: 'input1',
    },
    {
      id: '1 -> 2 two',
      source: '1',
      target: '2',
      sourceHandle: 'output2',
      targetHandle: 'input2'
    },
  ]
}
