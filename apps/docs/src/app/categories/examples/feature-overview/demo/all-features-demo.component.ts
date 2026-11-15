import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoIconComponent, DocsButton, DocsPresentations, SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  AnyComponentNodeEvent,
  Connection,
  Vflow,
  addEdges,
  createEdge,
  isComponentNodeEvent,
  removeElements,
} from 'ngx-vflow';
import { TransformNodeComponent } from './components/transform-node.component';
import { EdgeData, FlowStoreService } from './services/flow-store.service';

@Component({
  template: `<vflow
    #flow
    [nodes]="store.nodes()"
    [edges]="store.edges()"
    [background]="background"
    [parentsBelowEdges]="true"
    [alignmentHelper]="true"
    (connect)="connect($event)"
    (nodesChanges.size)="store.applySizeChanges($event)"
    (componentNodeEvent)="handleComponentEvent($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <!-- The nodes with a component draw themselves; this template draws the group. -->
    <docs-node *vNode="let ctx" [ctx]="ctx" />

    <ng-template let-ctx vEdge [vEdgeOf]="store.edges()">
      @let data = ctx.data();

      <svg:g vEdgeInteractionArea>
        <svg:path
          vuiEdge
          [attr.d]="ctx.path()"
          [attr.marker-end]="ctx.markerEnd()"
          [attr.stroke-dasharray]="data.animated ? '8 4' : null">
          @if (data.animated) {
            <!-- The dashes move by one dash and one gap, so the loop has no seam. -->
            <svg:animate attributeName="stroke-dashoffset" values="0;-12" dur="1s" repeatCount="indefinite" />
          }
        </svg:path>
      </svg:g>

      @if (data.label; as label) {
        <span *vEdgeLabel vuiEdgeLabel>{{ label }}</span>
      }

      @if (data.deletable) {
        <span *vEdgeLabel vuiEdgeLabel class="px-0! py-0!">
          <button
            docsButton="plain"
            small
            icon
            type="button"
            aria-label="Delete the connection"
            (click)="deleteEdge(ctx.edge.id)">
            <app-demo-icon name="close" />
          </button>
        </span>
      }
    </ng-template>

    <v-minimap />
  </vflow>`,
  // The page that shows the demo draws the frame; the demo brings its height.
  host: { class: 'block h-120 w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, DocsButton, DemoIconComponent, Vflow, Vui],
  providers: [FlowStoreService],
})
export class AllFeaturesDemoComponent {
  protected readonly store = inject(FlowStoreService);
  protected readonly background = SCENE_BACKGROUND;

  protected connect(connection: Connection): void {
    const edge = createEdge<EdgeData>({
      ...connection,
      id: crypto.randomUUID(),
      markers: { end: { type: 'arrow-closed' } },
      data: { deletable: true },
    });

    this.store.edges.update((edges) => addEdges([edge], { nodes: this.store.nodes(), edges }));
  }

  protected deleteEdge(id: string): void {
    this.store.edges.update((edges) => edges.filter((edge) => edge.id !== id));
  }

  /** The Delete button of the node toolbar: the node goes together with its edges. */
  protected handleComponentEvent(event: AnyComponentNodeEvent): void {
    if (isComponentNodeEvent(event, TransformNodeComponent) && event.eventName === 'deleted') {
      const { nodes, edges } = removeElements(
        { nodeIds: [event.nodeId] },
        { nodes: this.store.nodes(), edges: this.store.edges() },
      );

      this.store.nodes.set(nodes);
      this.store.edges.set(edges);
    }
  }
}
