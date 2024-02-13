import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Connection, PartialEdge } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/connection.interface';
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
    // {
    //   id: uuid(),
    //   source: this.nodes[0].id,
    //   target: this.nodes[1].id,
    //   type: 'template',
    //   data: {
    //     title: 'edge title'
    //   },
    //   edgeLabels: {
    //     center: {
    //       type: 'html-template',
    //       data: {
    //         title: 'center label title'
    //       }
    //     },
    //   }
    // },
    // {
    //   id: uuid(),
    //   source: this.nodes[0].id,
    //   target: this.nodes[2].id,
    // },
  ]

  @ViewChild('flow')
  public flow!: VflowComponent

  public ngAfterViewInit(): void { }

  public handleConnect(connection: Connection) {
    connection.toEdge(createEdge(connection.source.id, connection.target.id))
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
