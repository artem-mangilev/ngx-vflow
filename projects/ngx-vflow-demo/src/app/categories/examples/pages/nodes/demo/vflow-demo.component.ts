import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, NgZone, OnInit, Signal, ViewChild, WritableSignal, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Connection, Edge, EdgeChange, Node, NodeChange, VflowComponent, VflowModule } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './vflow-demo.component.html',
  styleUrls: ['./vflow-demo.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule]
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

  public edges: WritableSignal<Edge[]> = signal([
    {
      id: '1',
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
  ])

  protected cd = inject(ChangeDetectorRef)

  public handleConnect(connection: Connection) {
    this.edges.update((edges) => {
      return [...edges, {
        id: crypto.randomUUID(),
        source: connection.source,
        target: connection.target,
        markers: {
          end: {
            type: 'arrow'
          }
        }
      }]
    })
  }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.nodes = [
    //     {
    //       id: '1',
    //       point: { x: 10, y: 10 },
    //       type: 'default',
    //       text: '1',
    //       draggable: false
    //     },
    //     {
    //       id: '2',
    //       point: { x: 100, y: 100 },
    //       type: 'default',
    //       text: '2'
    //     },
    //   ]

    //   this.cd.markForCheck()
    // }, 5000);

    // this.nodes = [
    //   {
    //     id: '1',
    //     point: { x: 10, y: 10 },
    //     type: 'default',
    //     text: '1',
    //     draggable: false
    //   },
    //   {
    //     id: '2',
    //     point: { x: 100, y: 100 },
    //     type: 'default',
    //     text: '2'
    //   },
    // ]

    // this.vflow.nodesChange$.pipe(
    //   tap((changes) => console.log(changes))
    // ).subscribe()

    // this.vflow.edgesChange$
    //   .pipe(
    //     filter((changes) => changes.every(change => change.type === 'detached')),
    //     map((changes) => changes.map(change => change.id)),
    //     tap((changesIds) => {
    //       console.log('detached changes');
    //       console.log(changesIds)

    //       this.edges.update(edges => {
    //         return edges.filter(e => !changesIds.includes(e.id))
    //       })
    //     })
    //   ).subscribe()

    // this.vflow.edgesChange$
    //   .pipe(
    //     filter((changes) => changes.every(change => change.type === 'remove')),
    //     tap((changes) => {
    //       console.log('removed changes');
    //       console.log(changes)
    //     })
    //   ).subscribe()
  }

  public addNode() {
    this.nodes = [...this.nodes, {
      id: crypto.randomUUID(),
      point: { x: 200, y: 200 },
      type: 'default'

    }]
  }

  public removeNode() {
    this.nodes = this.nodes.filter(n => n.id !== '1')
  }

  public removeEdge() {
    this.edges.update(edges => edges.filter(e => e.id !== '1'))
  }

  public handleEdgesChange(changes: EdgeChange[]) {
    // if (changes.every(change => change.type === 'detached')) {
    //   const changesIds = changes.map(c => c.id)

    //   this.edges.update(edges => {
    //     return edges.filter(e => !changesIds.includes(e.id))
    //   })

    //   console.log('remove detached');
    // }

    // if (changes.every(change => change.type === 'remove')) {
    //   console.log('removed');
    // }

    console.log(changes)
  }

  public handleNodesChange(changes: NodeChange[]) {
    console.log(changes)
  }
}
