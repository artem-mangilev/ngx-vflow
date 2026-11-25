import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import {
  AnyComponentEdgeEvent,
  Vflow,
  createEdges,
  createNodes,
  injectEdge,
  isComponentEdgeEvent,
  provideVflow,
  withEdgeComponents,
} from 'ngx-vflow';

interface TransitionData {
  label: string;
  tone: 'success' | 'danger';
}

const TONES = {
  success: { line: 'stroke-vui-success', dot: 'bg-vui-success' },
  danger: { line: 'stroke-vui-danger', dot: 'bg-vui-danger' },
};

/**
 * A transition between two states, drawn by a component. The flow renders it on its own SVG group, which
 * holds the interaction stroke, so the host listener and the `group-hover` variant react to the whole clickable area.
 *
 * The label is declared next to the path and renders in the HTML label layer of the flow. Its clicks do not reach the
 * host, so the label emits the output itself.
 */
@Component({
  selector: 'g[docsTransitionEdge]',
  imports: [Vflow, Vui],
  host: { class: 'group', '(click)': 'picked.emit(edge.data().label)' },
  template: `
    <svg:path
      class="fill-none stroke-2 group-hover:stroke-3"
      [class]="edge.selected() ? 'stroke-vui-accent' : tone().line"
      [attr.d]="edge.path()"
      [attr.marker-end]="edge.markerEnd()" />
    <button
      *vEdgeLabel
      vuiEdgeLabel
      type="button"
      class="cursor-pointer border-solid font-[inherit]"
      (click)="picked.emit(edge.data().label)">
      <span class="size-2 rounded-full" [class]="tone().dot"></span>
      {{ edge.data().label }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransitionEdgeComponent {
  protected readonly edge = injectEdge<TransitionData>();
  protected readonly tone = computed(() => TONES[this.edge.data().tone]);

  readonly picked = output<string>();
}

@Component({
  template: `<docs-demo>
    <div docsDemoBar>
      <p aria-live="polite">{{ status() }}</p>
    </div>

    <vflow
      #flow
      [nodes]="nodes"
      [edges]="edges"
      (initialized)="flow.fitView({ maxZoom: 1 })"
      (componentEdgeEvent)="handleEdgeEvent($event)">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
    </vflow>
  </docs-demo>`,
  host: { class: 'block size-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow],
  // The edges name their component by key; the class is imported once, here.
  providers: [provideVflow(withEdgeComponents({ transition: TransitionEdgeComponent }))],
})
export class ComponentEdgesDemoComponent {
  protected readonly status = signal('Click an edge or its label: the flow reports the output of the edge component.');

  protected readonly nodes = createNodes([
    { id: 'review', point: { x: 0, y: 55 }, data: { text: 'Review' } },
    { id: 'published', point: { x: 280, y: 0 }, data: { text: 'Published' } },
    { id: 'rejected', point: { x: 280, y: 110 }, data: { text: 'Rejected' } },
  ]);

  protected readonly edges = createEdges<TransitionData>([
    {
      id: 'review-published',
      source: 'review',
      target: 'published',
      component: 'transition',
      data: { label: 'Approve', tone: 'success' },
      markers: { end: 'arrow-closed' },
    },
    {
      id: 'review-rejected',
      source: 'review',
      target: 'rejected',
      component: 'transition',
      data: { label: 'Reject', tone: 'danger' },
      markers: { end: 'arrow-closed' },
    },
  ]);

  // The guard narrows the event to the outputs of the edge component, so the payload is a string.
  protected handleEdgeEvent(event: AnyComponentEdgeEvent): void {
    if (isComponentEdgeEvent(event, TransitionEdgeComponent) && event.eventName === 'picked') {
      this.status.set(`"${event.eventPayload}" picked on the edge ${event.edgeId}.`);
    }
  }
}
