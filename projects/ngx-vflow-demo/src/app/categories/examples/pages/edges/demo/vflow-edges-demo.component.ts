import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Connection, ConnectionSettings, Edge, Node, VflowComponent, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-edges-demo.component.html',
  styleUrls: ['./vflow-edges-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
})
export class VflowEdgesDemoComponent implements AfterViewInit {
  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'html-template',
    },
    {
      id: '2',
      point: { x: 100, y: 100 },
      type: 'html-template',
    },
    {
      id: '3',
      point: { x: 150, y: 150 },
      type: 'html-template',
    },
  ]

  public edges: Edge[] = [
    // createEdge(this.nodes[0].id, this.nodes[1].id)
  ]

  public connectionSettings: ConnectionSettings = {
    type: 'template',
    validator: (connection: Connection) => {
      if (connection.source === '1' && connection.target === '2') {
        return true
      }

      if (connection.source === '1' && connection.target === '3') {
        return false
      }

      return true
    },
    marker: {
      width: 20,
      height: 20,
      color: '#00FF00',
    },
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
      id: crypto.randomUUID(),
      point: { x: 200, y: 200 },
      type: 'html-template'
    }]
  }
}

function createEdge(source: string, target: string): Edge {
  return {
    id: crypto.randomUUID(),
    source,
    target,
    type: 'default',
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
    },
    markers: {
      start: {
        width: 20,
        height: 20,
        color: '#00FF00',
      },
      end: {
        type: 'arrow',
        width: 30,
        height: 30,
        color: '#00FF00'
      }
    }
  }
}
