import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SCENE_BACKGROUND } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  AnyComponentEdgeEvent,
  AnyComponentNodeEvent,
  ConnectionSettings,
  Vflow,
  isComponentEdgeEvent,
  isComponentNodeEvent,
} from 'ngx-vflow';
import { RemovableEdgeComponent } from './components/removable-edge.component';
import { StepNodeComponent } from './components/step-node.component';
import { FlowStoreService } from './services/flow-store.service';

@Component({
  template: `<vflow
    #flow
    [nodes]="store.nodes()"
    [edges]="store.edges()"
    [background]="background"
    [alignmentHelper]="true"
    [connection]="connection"
    [parentsBelowEdges]="true"
    (connect)="store.connect($event)"
    (reconnect)="store.reconnect($event)"
    (deleteRequest)="store.remove($event)"
    (componentNodeEvent)="handleNodeEvent($event)"
    (componentEdgeEvent)="handleEdgeEvent($event)"
    (initialized)="flow.fitView({ maxZoom: 1 })">
    <!-- Every node is a component, and so is the edge with a button; this template draws the other edges. -->
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

  protected readonly background = SCENE_BACKGROUND;

  /**
   * An input takes one edge, so a port accepts a connection only while no edge ends there. The edge whose end is
   * being dragged does not count: the connection replaces it.
   */
  protected readonly connection: ConnectionSettings = {
    markerEnd: 'arrow-closed',
    validator: ({ target, reconnectedEdge }) =>
      !this.store
        .edges()
        .some(
          (edge) =>
            edge.target === target.node.id && edge.targetHandle === target.handle.id && edge.id !== reconnectedEdge?.id,
        ),
  };

  // The outputs of a component node reach the flow as one event; the guard narrows it to the outputs of a class.
  protected handleNodeEvent(event: AnyComponentNodeEvent): void {
    if (!isComponentNodeEvent(event, StepNodeComponent)) return;

    if (event.eventName === 'duplicated') this.store.duplicate(event.nodeId);
    if (event.eventName === 'deleted') this.store.remove({ nodeIds: [event.nodeId] });
  }

  protected handleEdgeEvent(event: AnyComponentEdgeEvent): void {
    if (isComponentEdgeEvent(event, RemovableEdgeComponent) && event.eventName === 'removed') {
      this.store.remove({ edgeIds: [event.edgeId] });
    }
  }
}
