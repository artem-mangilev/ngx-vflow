import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  viewChild,
} from '@angular/core';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  VflowModule,
} from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './handling-changes-demo.component.html',
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
  imports: [VflowModule],
})
export class HandlingChangesDemoComponent {
  private notifyService = inject(NgDocNotifyService);

  public toastTemplate = viewChild<TemplateRef<{}>>('toast');

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 100, y: 100 },
      type: 'default',
      text: `1`,
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      type: 'default',
      text: `2`,
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

  public handleNodeChanges(changes: NodeChange[]) {
    this.toastData = {
      title: '(onNodesChange)',
      json: JSON.stringify(changes, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public handleEdgeChanges(changes: EdgeChange[]) {
    this.toastData = {
      title: '(onEdgesChange)',
      json: JSON.stringify(changes, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }
}
