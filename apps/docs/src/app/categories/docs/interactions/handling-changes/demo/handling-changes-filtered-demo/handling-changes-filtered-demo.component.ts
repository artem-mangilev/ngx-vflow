import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { NgDocNotifyService } from '@ng-doc/ui-kit';
import {
  Connection,
  Edge,
  EdgeSelectedChange,
  Node,
  NodePositionChange,
  NodeSelectedChange,
  Vflow,
  createNodes,
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
  imports: [DocsPresentations, Vflow],
})
export class HandlingChangesFilteredDemoComponent {
  private notifyService = inject(NgDocNotifyService);

  public toastTemplate = viewChild<TemplateRef<object>>('toast');

  public nodes: Node[] = createNodes([
    {
      id: '1',
      point: { x: 100, y: 100 },
      data: { text: `1` },
    },
    {
      id: '2',
      point: { x: 200, y: 200 },
      data: { text: `2` },
    },
  ]);

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
      title: '(nodesChanges.position)',
      json: JSON.stringify(change, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public handleNodeSelectChange(change: NodeSelectedChange[]) {
    this.toastData = {
      title: '(nodesChanges.select)',
      json: JSON.stringify(change, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }

  public handleEdgeSelectChange(changes: EdgeSelectedChange[]) {
    this.toastData = {
      title: '(edgesChanges.select)',
      json: JSON.stringify(changes, null, 2),
    };

    this.notifyService.notify(this.toastTemplate());
  }
}
