import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
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
    {
      id: uuid(),
      source: this.nodes[0].id,
      target: this.nodes[1].id,
      type: 'template',
      data: {
        title: 'edge title'
      },
      edgeLabels: {
        // start: {
        //   type: 'html-template'
        // },
        center: {
          type: 'html-template',
          data: {
            title: 'center label title'
          }
        },
        // end: {
        //   type: 'html-template'
        // },
      }
    },
    {
      id: uuid(),
      source: this.nodes[0].id,
      target: this.nodes[2].id,
    },
  ]

  @ViewChild('flow')
  public flow!: VflowComponent

  public ngAfterViewInit(): void {
    // this.flow.viewportChanges$.subscribe((changes) => {
    //   console.log(changes)
    // })

    // this.flow.viewportTo({
    //   zoom: 0.4,
    //   x: 0,
    //   y: 0
    // })

    // this.flow.panTo({ x: 50, y: 50 })
  }

  public handleConnect(connection: Connection) {
    console.log(connection)
  }
}
