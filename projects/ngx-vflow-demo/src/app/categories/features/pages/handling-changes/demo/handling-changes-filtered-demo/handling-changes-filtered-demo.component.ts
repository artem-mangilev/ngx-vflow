import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild, signal } from '@angular/core';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeAddChange,
  NodePositionChange,
  NodeSelectedChange,
  Vflow,
} from 'ngx-vflow';

@Component({
  templateUrl: './handling-changes-filtered-demo.component.html',
  styles: [
    `
      :host {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class HandlingChangesFilteredDemoComponent {
  private notifyService = inject(NgDocNotifyService);

  public toastTemplate = viewChild<TemplateRef<object>>('toast');

  public nodes: Node[] = [
    {
      id: '1',
      point: signal({ x: 100, y: 100 }),
      type: 'default',
      text: signal(`1`),
    },
    {
      id: '2',
      point: signal({ x: 200, y: 200 }),
      type: 'default',
      text: signal(`2`),
    },
  ];

  public edges: Edge[] = [];

  public toastData: any = {};

  public createEdge({ source, target }: Connection) {
    this.edges = [
      ...this.edges,
      {
        id: `${source} -> ${target}`,
        source,
        target,
      },
    ];
  }

  public handleNodePositionChange(change: NodePositionChange[]) {
    this.toastData = {
      title: '(onNodesChange.position)',
      json: JSON.stringify(change, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public handleNodeSelectChange(change: NodeSelectedChange[]) {
    this.toastData = {
      title: '(onNodesChange.select)',
      json: JSON.stringify(change, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public handleNodesAddChange(changes: NodeAddChange[]) {
    this.toastData = {
      title: '(onNodesChange.add)',
      json: JSON.stringify(changes, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public handleEdgesAddChange(changes: EdgeChange[]) {
    this.toastData = {
      title: '(onEdgesChange.add)',
      json: JSON.stringify(changes, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public addNodes() {
    this.nodes = [
      ...this.nodes,
      {
        id: crypto.randomUUID(),
        point: signal({ x: 0, y: 0 }),
        type: 'default',
        text: signal(`random`),
      },
      {
        id: crypto.randomUUID(),
        point: signal({ x: 300, y: 300 }),
        type: 'default',
        text: signal(`random`),
      },
    ];
  }
}
