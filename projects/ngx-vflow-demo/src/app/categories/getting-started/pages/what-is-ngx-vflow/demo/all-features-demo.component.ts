import { publishFacade } from "@angular/compiler"
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from "@angular/core"
import { VflowModule, Node, Edge, CustomNodeComponent, Connection, ComponentNode, SharedNode, DefaultNode, ConnectionSettings } from "projects/ngx-vflow-lib/src/public-api"

@Component({
  template: `<vflow
    [nodes]="nodes"
    [edges]="edges"
    [connection]="connection"
    [background]="{ type: 'dots' }"
    view="auto"
    (onConnect)="handleConnect($event)"
  >
    <ng-template edge let-ctx>
      <svg:path
        [attr.d]="ctx.path()"
        [attr.stroke-width]="4"
        [attr.stroke]="ctx.edge.data.color"
        [attr.marker-end]="ctx.markerEnd()"
        fill="none"
      />
    </ng-template>

    <ng-template edgeLabelHtml let-ctx>
      <div
        class="label"
        [style.background-color]="ctx.label.data.color"
        (click)="deleteEdge(ctx.edge)">Delete</div>
    </ng-template>
  </vflow>`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }

    .label {
      width: 60px;
      height: 25px;
      background-color: #122c26;
      border-radius: 5px;
      text-align: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class AllFeaturesDemoComponent {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 200 },
      type: 'default',
      text: 'Default'
    },
    {
      id: '2',
      point: { x: 200, y: 10 },
      type: 'default',
      text: `Resized`,
      width: 100,
      height: 100
    },
    {
      id: '3',
      point: { x: 200, y: 270 },
      type: SimpleCustomNodeComponent,
      draggable: false
    },
    {
      id: '4',
      point: { x: 600, y: 150 },
      type: ComplexCustomNodeComponent,
      data: {
        id: {
          one: signal(''),
          two: signal(''),
          three: signal(''),
        },
      }
    },
  ]

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      markers: { end: { type: 'arrow-closed' } }
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      curve: 'straight',
      markers: { end: { type: 'arrow' } }
    },
    {
      id: '3 -> 4-three',
      source: '3',
      target: '4',
      targetHandle: 'three',
    },
  ]

  public connection: ConnectionSettings = {
    validator(connection) {
      if (connection.source === '3') {
        return false
      }

      return true
    }
  }

  handleConnect(connection: Connection) {
    if (connection.target === '4') {
      const data = this.nodes
        .filter(isComponentNode)
        .find(n => n.id === '4')
        ?.data as ComplexCustomNodeData

      const sourceNode = this.nodes
        .filter(isDefaultNode)
        .find(n => n.id === connection.source)

      if (sourceNode) {
        if (connection.targetHandle === 'one') {
          data.id.one.set(sourceNode.text ?? '')
        }
        if (connection.targetHandle === 'two') {
          data.id.two.set(sourceNode.text ?? '')
        }
        if (connection.targetHandle === 'three') {
          data.id.three.set(sourceNode.text ?? '')
        }
      }

    }

    const color = randomHex()
    this.edges = [...this.edges, {
      id: crypto.randomUUID(),
      type: 'template',
      data: {
        color
      },
      markers: {
        end: {
          type: 'arrow-closed',
          width: 30,
          height: 30,
          color
        }
      },
      edgeLabels: {
        center: {
          type: 'html-template',
          data: { color }
        }
      },
      ...connection
    }]
  }

  public deleteEdge(edge: Edge) {
    this.edges = this.edges.filter(e => e !== edge)
  }
}

function isComponentNode<T>(n: Node<T>): n is SharedNode & ComponentNode<T> {
  return CustomNodeComponent.isPrototypeOf(n.type)
}

function isDefaultNode(n: Node): n is SharedNode & DefaultNode {
  return n.type === 'default'
}

function randomHex() {
  const hexValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length)
    hex += hexValues[index];
  }

  return hex
}

@Component({
  template: `<div class="node">
    Custom node!

    <handle type="target" position="top" />
    <handle type="source" position="bottom" />
  </div>`,
  styles: [`
    .node {
      width: 150px;
      height: 100px;
      background: #bbe1fa;
      border: 1px solid gray;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: black;
    }
  `],
  standalone: true,
  imports: [VflowModule]
})
export class SimpleCustomNodeComponent extends CustomNodeComponent { }

interface ComplexCustomNodeData {
  id: {
    one: WritableSignal<string>,
    two: WritableSignal<string>,
    three: WritableSignal<string>,
  }
}

@Component({
  template: `<div class="node">
    <div class="control-wrapper">
      <input class="input" [value]="node.data?.id?.one()">

      <handle type="target" position="left" id="one" [template]="squareHandleTemplate" />
    </div>

    <div class="control-wrapper">
      <input class="input" [value]="node.data?.id?.two()">

      <handle type="target" position="left" id="two" [template]="squareHandleTemplate"  />
    </div>

    <div class="control-wrapper control-wrapper_last">
      <input class="input"  [value]="node.data?.id?.three()">

      <handle type="target" position="left" id="three" [template]="squareHandleTemplate" />
    </div>
  </div>

  <ng-template #squareHandleTemplate let-ctx>
    <svg:rect
      width="10"
      height="10"
      stroke-width="1"
      stroke="black"
      rx="1"
      ry="1"
      [attr.x]="ctx.point().x - 5"
      [attr.y]="ctx.point().y - 5"
      [class.handle_idle]="ctx.state() === 'idle'"
      [class.handle_valid]="ctx.state() === 'valid'"
      [class.handle_invalid]="ctx.state() === 'invalid'"
    />
  </ng-template>

  `,
  styles: [`
    .node {
      width: 150px;
      background: #bbe1fa;
      border: 1px solid gray;
      border-radius: 5px;
      color: black;
      padding: 10px;
    }

    .input {
      width: 130px;
    }

    .control-wrapper {
      margin-bottom: 20px;
    }

    .control-wrapper_last {
      margin-bottom: 0px;
    }

    .handle {
      &_idle {
        fill: #fff;
      }

      &_valid {
        fill: green;
      }

      &_invalid {
        fill: red;
      }
    }
  `],
  standalone: true,
  imports: [VflowModule]
})
export class ComplexCustomNodeComponent extends CustomNodeComponent<ComplexCustomNodeData> { }
