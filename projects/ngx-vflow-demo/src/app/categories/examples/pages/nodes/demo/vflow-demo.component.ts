import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, NgZone, OnInit, Signal, ViewChild, WritableSignal, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Connection } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/connection.interface';
import { Edge } from 'projects/ngx-vflow-lib/src/lib/vflow/interfaces/edge.interface';
import { EdgeChange } from 'projects/ngx-vflow-lib/src/lib/vflow/services/edge-changes.service';
import { ContainerStyleSheetFn, Node, RootStyleSheetFn, VDocModule, VflowComponent, VflowModule, nodesOperation, hasClasses, uuid, edgesOperation } from 'projects/ngx-vflow-lib/src/public-api';
import { filter, map, tap, timer } from 'rxjs';

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

  public handleConnect(connection: Connection) {
    this.edges.update((edges) => {
      return [...edges, {
        id: '1',
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
    // this.vflow.nodesChange$.pipe(
    //   tap((changes) => console.log(changes))
    // ).subscribe()

    this.vflow.edgesChange$
      .pipe(
        filter((changes) => changes.every(change => change.type === 'detached')),
        map((changes) => changes.map(change => change.id)),
        tap((changesIds) => {
          console.log('detached changes');
          console.log(changesIds)

          this.edges.update(edges => {
            return edges.filter(e => !changesIds.includes(e.id))
          })
        })
      ).subscribe()

    this.vflow.edgesChange$
      .pipe(
        filter((changes) => changes.every(change => change.type === 'remove')),
        tap((changes) => {
          console.log('removed changes');
          console.log(changes)
        })
      ).subscribe()
  }

  public addNode() {
    this.nodes = nodesOperation(this.nodes).add({
      id: uuid(),
      point: { x: 200, y: 200 },
      type: 'default'
    })
  }

  public removeNode() {
    this.nodes = nodesOperation(this.nodes).remove('1')
  }

  public removeEdge() {
    this.edges.update(edges => edges.filter(e => e.id !== '1'))
  }
}
