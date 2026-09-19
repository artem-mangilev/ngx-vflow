import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import {
  Connection,
  ConnectionSettings,
  CurveFactory,
  Edge,
  Node,
  Vflow,
  createEdge,
  createNodes,
  getBezierPath,
  getFloatingEdgeParams,
  injectNode,
} from 'ngx-vflow';

/**
 * Edges and the connection preview leave and enter nodes through their borders instead of fixed handles. The
 * pointer of a connection in progress is a rectangle without size that the flow has already moved by the marker
 * inset, so only the start is inset again.
 */
const floatingCurve: CurveFactory = (params) => {
  if (params.targetNode) {
    return getBezierPath(getFloatingEdgeParams(params.sourceNode, params.targetNode, { inset: params.markerInset }));
  }

  const pointer = { ...params.targetPoint, width: 0, height: 0 };

  return getBezierPath(
    getFloatingEdgeParams(params.sourceNode, pointer, { inset: { start: params.markerInset.start } }),
  );
};

/** The whole node is the handle: the title drags the node, everywhere else starts a connection. */
@Component({
  selector: 'easy-connect-node',
  template: `
    <div
      class="easy-node"
      vflowHandle
      handleType="source"
      position="right"
      layout="manual"
      [id]="ctx.node.id"
      [ariaLabel]="ctx.data().title">
      <div class="easy-node__title" dragHandle>{{ ctx.data().title }}</div>
      <div class="easy-node__body">Drag from here to connect</div>
    </div>
  `,
  styles: [
    `
      .easy-node {
        display: block;
        width: 170px;
        box-sizing: border-box;
        border: 2px solid #1b262c;
        border-radius: 8px;
        background: #fff;
        color: #1b262c;
        font-size: 13px;
        user-select: none;
        transition: box-shadow 0.1s;
      }

      .easy-node__title {
        padding: 8px 12px;
        border-bottom: 1px solid #d5dbe2;
        font-weight: 600;
        cursor: grab;
      }

      .easy-node__body {
        padding: 12px;
        color: #6b7684;
        cursor: crosshair;
      }

      .easy-node[data-vflow-handle-state='connecting'] {
        box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.35);
      }

      .easy-node[data-vflow-handle-state='valid'] {
        border-color: #2e7d32;
        box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.3);
      }

      .easy-node[data-vflow-handle-state='invalid'] {
        border-color: #c62828;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
})
export class EasyConnectNodeComponent {
  protected readonly ctx = injectNode<{ title: string }>();
}

@Component({
  selector: 'app-easy-connect-demo',
  template: `
    <vflow view="auto" [nodes]="nodes" [edges]="edges()" [connection]="connection" (connect)="connect($event)">
      <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
    </vflow>
  `,
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
export class EasyConnectDemoComponent {
  /** Every node has one handle, so the loose mode lets any node connect to any other; ids make the pair unique. */
  public readonly connection: ConnectionSettings = {
    mode: 'loose',
    curve: floatingCurve,
    marker: { type: 'arrow-closed' },
  };

  public readonly nodes: Node[] = createNodes([
    { id: '1', point: { x: 40, y: 40 }, component: EasyConnectNodeComponent, data: { title: 'Idea' } },
    { id: '2', point: { x: 340, y: 160 }, component: EasyConnectNodeComponent, data: { title: 'Draft' } },
    { id: '3', point: { x: 80, y: 300 }, component: EasyConnectNodeComponent, data: { title: 'Review' } },
  ]);

  public readonly edges = signal<Edge[]>([
    this.createEdge({ source: '1', target: '2', sourceHandle: '1', targetHandle: '2' }),
  ]);

  public connect(connection: Connection) {
    this.edges.update((edges) => [...edges, this.createEdge(connection)]);
  }

  private createEdge(connection: Connection): Edge {
    return createEdge({
      id: `${connection.source} -> ${connection.target}`,
      ...connection,
      curve: floatingCurve,
      markers: { end: { type: 'arrow-closed' } },
    });
  }
}
