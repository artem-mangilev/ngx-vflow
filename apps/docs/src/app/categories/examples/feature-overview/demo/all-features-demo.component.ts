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
import { Note, NoteComponent } from './components/note.component';
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

      <svg:g>
        <svg:path vuiEdge [attr.stroke-dasharray]="data.animated ? '8 4' : null">
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

    <!-- The notes are not nodes: a portal places each one at a point of the flow. -->
    @for (note of notes; track note.number) {
      <app-note *vPortal="note.point" [note]="note" />
    }

    <v-minimap vPanel="bottom-right" [pannable]="true" [zoomable]="true" />
    <vui-controls vPanel="bottom-left" />
  </vflow>`,
  // The page that shows the demo draws the frame; the demo brings its height: the scene at full size, with its lower
  // corners left free for the controls and the minimap.
  host: { class: 'block h-130 w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow, Vui, NoteComponent],
  providers: [FlowStoreService],
})
export class AllFeaturesDemoComponent {
  protected readonly store = inject(FlowStoreService);

  protected readonly background = SCENE_BACKGROUND;

  /** What to try, next to the parts it is about. */
  protected readonly notes: readonly Note[] = [
    {
      number: 1,
      text: 'A selected node shows its toolbar: copy the node or delete it.',
      point: { x: 0, y: 50 },
      arrow: { side: 'right', width: 156, height: 84, path: 'M4 12 C76 12 132 40 152 80' },
    },
    {
      number: 2,
      text: 'An edge carries a label and a control. Drag its end to another port.',
      point: { x: 0, y: 300 },
      arrow: { side: 'right', width: 64, height: 32, path: 'M4 12 L58 18' },
    },
    {
      number: 3,
      text: 'A group moves its children and keeps them inside. Select it to resize it.',
      point: { x: 750, y: 0 },
      arrow: { side: 'below', width: 24, height: 28, path: 'M12 2 L12 24' },
    },
    {
      number: 4,
      text: 'An input takes one edge: a second one is refused.',
      point: { x: 272, y: 364 },
      arrow: { side: 'left', width: 60, height: 50, path: 'M56 12 C32 14 12 26 6 46' },
    },
  ];

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
