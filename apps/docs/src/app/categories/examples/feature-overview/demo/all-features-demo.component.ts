import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  AnyComponentEdgeEvent,
  AnyComponentNodeEvent,
  Background,
  ConnectionSettings,
  Vflow,
  isComponentEdgeEvent,
  isComponentNodeEvent,
} from 'ngx-vflow';
import { InspectorNodeComponent } from './components/inspector-node.component';
import { RemovableEdgeComponent } from './components/removable-edge.component';
import { ResizableNodeComponent } from './components/resizable-node.component';
import { BackgroundPattern, FlowStoreService, GRID } from './services/flow-store.service';

@Component({
  template: `<vflow
    #flow
    [nodes]="store.nodes()"
    [edges]="store.edges()"
    [background]="backgrounds[store.background()]"
    [snapGrid]="store.snapToGrid() ? grid : undefined"
    [alignmentHelper]="store.alignmentGuides()"
    [connection]="connection()"
    [parentsBelowEdges]="true"
    (connect)="store.connect($event)"
    (reconnect)="store.reconnect($event)"
    (deleteRequest)="store.remove($event)"
    (nodesChanges.size)="store.applySizeChanges($event)"
    (componentNodeEvent)="handleNodeEvent($event)"
    (componentEdgeEvent)="handleEdgeEvent($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <!-- Every node and the edges with a button are components; this template draws the other edges. -->
    <ng-template let-ctx vEdge [vEdgeOf]="store.edges()">
      @let data = ctx.data();

      <svg:g vEdgeInteractionArea>
        <svg:path vuiEdge [attr.d]="ctx.path()" [attr.stroke-dasharray]="data.animated ? '8 4' : null">
          @if (data.animated) {
            <!-- The dashes move by one dash and one gap, so the loop has no seam. -->
            <svg:animate attributeName="stroke-dashoffset" values="0;-12" dur="1s" repeatCount="indefinite" />
          }
        </svg:path>
      </svg:g>

      @if (data.label; as label) {
        <span *vEdgeLabel vuiEdgeLabel>{{ label }}</span>
      }
    </ng-template>

    <v-minimap [pannable]="true" [zoomable]="true" />
    <vui-controls class="absolute bottom-2.5 left-2.5" />
  </vflow>`,
  // The page that shows the demo draws the frame; the demo brings its height: the scene at full size, with its lower
  // corners left free for the controls and the minimap.
  host: { class: 'block h-130 w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, Vui],
  providers: [FlowStoreService],
})
export class AllFeaturesDemoComponent {
  protected readonly store = inject(FlowStoreService);

  protected readonly grid: [number, number] = [GRID, GRID];
  protected readonly backgrounds: Record<BackgroundPattern, Background | null> = {
    dots: SCENE_BACKGROUND,
    grid: { type: 'grid', gap: GRID },
    none: null,
  };

  /**
   * The line that follows the pointer looks like the edge the connection becomes. An inspector reads one node, so
   * its port accepts a connection only while no edge ends there. The edge whose end is being dragged does not count:
   * the connection replaces it.
   */
  protected readonly connection = computed<ConnectionSettings>(() => ({
    curve: this.store.curve(),
    markerEnd: 'arrow-closed',
    validator: ({ target, reconnectedEdge }) =>
      target.node.component !== InspectorNodeComponent ||
      !this.store.edges().some((edge) => edge.target === target.node.id && edge.id !== reconnectedEdge?.id),
  }));

  // The outputs of a component node reach the flow as one event; the guard narrows it to the outputs of a class.
  protected handleNodeEvent(event: AnyComponentNodeEvent): void {
    if (!isComponentNodeEvent(event, ResizableNodeComponent)) return;

    if (event.eventName === 'duplicated') this.store.duplicate(event.nodeId);
    if (event.eventName === 'deleted') this.store.remove({ nodeIds: [event.nodeId] });
  }

  protected handleEdgeEvent(event: AnyComponentEdgeEvent): void {
    if (isComponentEdgeEvent(event, RemovableEdgeComponent) && event.eventName === 'removed') {
      this.store.remove({ edgeIds: [event.edgeId] });
    }
  }
}
