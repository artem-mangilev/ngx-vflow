import { AfterViewInit, ChangeDetectionStrategy, Component, Injector, OnInit, ViewChild, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Connection } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/connection.interface';
import { Edge } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/edge.interface';
import { ContainerStyleSheetFn, Node, RootStyleSheetFn, VDocModule, VflowComponent, VflowModule, hasClasses, uuid } from 'projects/ngx-vflow-lib/src/public-api';
import { tap } from 'rxjs';

@Component({
  templateUrl: './vflow-demo.component.html',
  styleUrls: ['./vflow-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule, VDocModule]
})
export class VflowDemoComponent implements OnInit {
  @ViewChild('vflow', { static: true })
  public vflow!: VflowComponent

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 10 },
      type: 'default',
      text: '1',
      draggable: false
    },
    {
      id: '2',
      point: { x: 100, y: 100 },
      type: 'default',
      text: '2'
    },
  ]

  public edges: Edge[] = [
    {
      id: uuid(),
      source: '1',
      target: '2',
      markers: {
        start: {
          type: 'arrow-closed',
        },
        end: {
          type: 'arrow'
        }
      }
    }
  ]

  public handleConnect(connection: Connection) {
    this.edges = [...this.edges, {
      id: uuid(),
      source: connection.source,
      target: connection.target,
      markers: {
        end: {
          type: 'arrow'
        }
      }
    }]
  }

  ngOnInit(): void {
    this.vflow.nodesChange$.pipe(
      tap((changes) => console.log(changes))
    ).subscribe()
  }

  public addNode() {
    this.nodes = [...this.nodes, {
      id: uuid(),
      point: { x: 200, y: 200 },
      type: 'default'
    }]
  }
}
