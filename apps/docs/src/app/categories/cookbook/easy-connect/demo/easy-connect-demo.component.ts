import { ChangeDetectionStrategy, Component, Injectable, computed, inject, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import {
  Connection,
  ConnectionSettings,
  Curve,
  CurveFactory,
  Edge,
  HandlePosition,
  Node,
  Vflow,
  createEdge,
  createNodes,
  getBezierPath,
  getFloatingEdgeParams,
  injectNode,
} from 'ngx-vflow';

/** `auto` and `center` are handle positions; `crossing` keeps `auto` and replaces the endpoints in a custom curve. */
type Meeting = 'auto' | 'center' | 'crossing';

/**
 * Endpoints on the exact crossing of the line between the node centers with the node borders. Every curve factory
 * receives both node rectangles and the marker inset; the pointer of a connection in progress is a rectangle
 * without size that the flow has already moved by the inset, so only the start is inset again.
 */
const crossingCurve: CurveFactory = (params) => {
  if (params.targetNode) {
    return getBezierPath(getFloatingEdgeParams(params.sourceNode, params.targetNode, { inset: params.markerInset }));
  }

  const pointer = { ...params.targetPoint, width: 0, height: 0 };

  return getBezierPath(
    getFloatingEdgeParams(params.sourceNode, pointer, { inset: { start: params.markerInset.start } }),
  );
};

/** Shared by the demo controls and the nodes: where edges meet a node. */
@Injectable()
export class EasyConnectSettings {
  readonly meeting = signal<Meeting>('auto');
  readonly position = computed<HandlePosition>(() => (this.meeting() === 'center' ? 'center' : 'auto'));
  readonly curve = computed<Curve>(() => (this.meeting() === 'crossing' ? crossingCurve : 'bezier'));
}

/** The whole node is the handle: the title drags the node, everywhere else starts or accepts a connection. */
@Component({
  selector: 'easy-connect-node',
  template: `
    <div class="easy-node" vflowHandle handleType="any" [position]="settings.position()" [ariaLabel]="ctx.data().title">
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
  protected readonly settings = inject(EasyConnectSettings);
}

@Component({
  selector: 'app-easy-connect-demo',
  template: `
    <div class="demo">
      <label class="controls">
        Edges meet nodes at
        <select [value]="settings.meeting()" (change)="settings.meeting.set($any($event.target).value)">
          <option value="auto">the middle of the border facing the other node</option>
          <option value="center">the center</option>
          <option value="crossing">the exact crossing of the border (custom curve)</option>
        </select>
      </label>

      <vflow view="auto" [nodes]="nodes" [edges]="edges()" [connection]="connection()" (connect)="connect($event)">
        <ng-template let-ctx edge><svg:g docsEdge [ctx]="ctx" /></ng-template>
      </vflow>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .demo {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        width: 100%;
        height: 100%;
      }

      .controls {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background-color: #f5f5f5;
        color: #1b262c;
        font-size: 14px;
      }

      vflow {
        min-height: 0;
      }
    `,
  ],
  providers: [EasyConnectSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class EasyConnectDemoComponent {
  protected readonly settings = inject(EasyConnectSettings);

  public readonly connection = computed<ConnectionSettings>(() => ({
    marker: { type: 'arrow-closed' },
    curve: this.settings.curve(),
  }));

  public readonly nodes: Node[] = createNodes([
    // Nodes stay away from the pane edges, where a connection drag would auto-pan the viewport.
    { id: '1', point: { x: 60, y: 30 }, component: EasyConnectNodeComponent, data: { title: 'Idea' } },
    { id: '2', point: { x: 360, y: 110 }, component: EasyConnectNodeComponent, data: { title: 'Draft' } },
    { id: '3', point: { x: 100, y: 200 }, component: EasyConnectNodeComponent, data: { title: 'Review' } },
  ]);

  private readonly connections = signal<Connection[]>([{ source: '1', target: '2' }]);

  /** Edges follow the chosen curve; the application owns the list and rebuilds it when the setting changes. */
  public readonly edges = computed<Edge[]>(() =>
    this.connections().map((connection) =>
      createEdge({
        id: `${connection.source} -> ${connection.target}`,
        ...connection,
        curve: this.settings.curve(),
        markers: { end: { type: 'arrow-closed' } },
      }),
    ),
  );

  public connect(connection: Connection) {
    this.connections.update((connections) => [...connections, connection]);
  }
}
