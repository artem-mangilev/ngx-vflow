import { ChangeDetectionStrategy, Component, Injectable, computed, inject, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  Connection,
  ConnectionSettings,
  Curve,
  CurveFactory,
  HandlePosition,
  Vflow,
  createEdges,
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

/**
 * The whole card is the handle: the header drags the node, everywhere else starts or accepts a connection. The card
 * shows the state of the connection itself, as a port would: a ring while a connection starts from it, the success
 * color as a valid candidate.
 */
@Component({
  template: `
    <article
      vuiNode
      vHandle
      handleType="any"
      data-testid="easy-node"
      class="w-48 select-none text-[13px] transition-shadow
        data-[v-handle-state=connecting]:ring-3 data-[v-handle-state=connecting]:ring-vui-accent/35
        data-[v-handle-state=valid]:border-vui-success data-[v-handle-state=valid]:ring-3
        data-[v-handle-state=valid]:ring-vui-success/30 data-[v-handle-state=invalid]:border-vui-danger"
      [position]="settings.position()">
      <header vuiNodeHeader vDragHandle data-testid="easy-node-title" class="cursor-grab">
        <span vuiTitle>{{ node.data().title }}</span>
      </header>
      <div data-testid="easy-node-body" class="p-vui-3 text-vui-muted cursor-crosshair">Drag from here to connect</div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, Vui],
})
export class EasyConnectNodeComponent {
  protected readonly node = injectNode<{ title: string }>();
  protected readonly settings = inject(EasyConnectSettings);
}

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <label>
        Edges meet nodes at
        <select docsSelect [value]="settings.meeting()" (change)="settings.meeting.set($any($event.target).value)">
          <option value="auto">the middle of the side facing the other node</option>
          <option value="center">the center</option>
          <option value="crossing">the exact crossing of the border (custom curve)</option>
        </select>
      </label>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges()"
      [connection]="connection()"
      (initialized)="flow.fitView({ maxZoom: 1 })"
      (connect)="connect($event)">
      <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  providers: [EasyConnectSettings],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
})
export class EasyConnectDemoComponent {
  protected readonly settings = inject(EasyConnectSettings);

  /** The preview line of a connection in progress is drawn like the edges. */
  protected readonly connection = computed<ConnectionSettings>(() => ({
    markerEnd: { type: 'arrow-closed' },
    curve: this.settings.curve(),
  }));

  protected readonly nodes = createNodes([
    { id: 'idea', point: { x: 0, y: 0 }, component: EasyConnectNodeComponent, data: { title: 'Idea' } },
    { id: 'draft', point: { x: 320, y: 80 }, component: EasyConnectNodeComponent, data: { title: 'Draft' } },
    { id: 'review', point: { x: 40, y: 170 }, component: EasyConnectNodeComponent, data: { title: 'Review' } },
  ]);

  private readonly connections = signal<Connection[]>([{ source: 'idea', target: 'draft' }]);

  /** Edges follow the chosen curve; the application owns the list and rebuilds it when the setting changes. */
  protected readonly edges = computed(() =>
    createEdges(
      this.connections().map((connection) => ({
        id: `${connection.source}-${connection.target}`,
        ...connection,
        curve: this.settings.curve(),
        markers: { end: { type: 'arrow-closed' as const } },
      })),
    ),
  );

  protected connect(connection: Connection): void {
    this.connections.update((connections) => [...connections, connection]);
  }
}
