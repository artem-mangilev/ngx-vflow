import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ConnectionSettings } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/connection-settings.interface';
import { Connection } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/connection.interface';
import { Edge } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/edge.interface';
import { Node, VDocModule, VflowComponent, VflowModule, uuid } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-edges-demo.component.html',
  styleUrls: ['./vflow-edges-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule, VDocModule]
})
export class VflowEdgesDemoComponent implements AfterViewInit {
  public nodes: Node[] = [
    {
      id: uuid(),
      point: { x: 10, y: 10 },
      type: 'html-template',
    },
    {
      id: uuid(),
      point: { x: 100, y: 100 },
      type: 'html-template',
    },
    {
      id: uuid(),
      point: { x: 150, y: 150 },
      type: 'html-template',
    },
  ]

  public edges: Edge[] = [
    createEdge(this.nodes[0].id, this.nodes[1].id)
  ]

  public connectionSettings: ConnectionSettings = {
    validator: () => {
      return true
    }
  }

  @ViewChild('flow')
  public flow!: VflowComponent

  public ngAfterViewInit(): void { }

  public handleConnect(connection: Connection) {
    console.log(this.flow.getNode(connection.source))
    console.log(this.flow.getNode(connection.target))

    this.edges = [...this.edges, createEdge(connection.source, connection.target)]
  }

  public addNode() {
    this.nodes = [...this.nodes, {
      id: uuid(),
      point: { x: 200, y: 200 },
      type: 'html-template'
    }]
  }
}

function createEdge(source: string, target: string): Edge {
  return {
    id: uuid(),
    source,
    target,
    type: 'template',
    data: {
      title: 'edge title'
    },
    edgeLabels: {
      center: {
        type: 'html-template',
        data: {
          title: 'center label title'
        }
      },
    }
  }
}
