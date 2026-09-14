import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { VflowUi } from '@vflow/ui';
import { ComponentEdgeEvent, Edge, EdgeInteractionDirective, Node, Vflow, createNodes, injectEdge } from 'ngx-vflow';

interface ColoredEdgeData {
  color: string;
  label: string;
}

/**
 * An edge drawn by a component. The flow renders it on its own SVG group; the host directive moves the interaction
 * stroke into that group, so host listeners and `:host(:hover)` react to the whole clickable area.
 *
 * The label is declared next to the path and renders in the HTML label layer of the flow. Its clicks do not reach the
 * host, so the label emits the output itself.
 */
@Component({
  selector: 'g[docsColoredEdge]',
  hostDirectives: [EdgeInteractionDirective],
  imports: [Vflow, VflowUi],
  host: { '(click)': 'picked.emit(ctx.edge.id)' },
  styles: `
    :host(:hover) .line {
      stroke-width: 5px;
    }

    .label {
      cursor: pointer;
    }
  `,
  template: `
    <svg:path
      class="line"
      fill="none"
      stroke-width="3"
      [attr.d]="ctx.path()"
      [attr.stroke]="ctx.selected() ? '#0f4c75' : ctx.data().color"
      [attr.marker-end]="ctx.markerEnd()" />
    <span
      *edgeLabel
      vflowEdgeLabel
      class="label"
      [style.border-color]="ctx.data().color"
      (click)="picked.emit(ctx.edge.id)">
      {{ ctx.data().label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColoredEdgeComponent {
  protected readonly ctx = injectEdge<ColoredEdgeData>();
  readonly picked = output<string>();
}

@Component({
  template: `
    <p class="picked">Last clicked edge: {{ picked() }}</p>
    <vflow view="auto" [nodes]="nodes" [edges]="edges" (componentEdgeEvent)="onEdgeEvent($event)">
      <ng-template let-ctx node><docs-node [ctx]="ctx" /></ng-template>
    </vflow>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      .picked {
        margin: 8px;
        font-size: 13px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsPresentations, Vflow],
})
export class ComponentEdgesDemoComponent {
  protected readonly picked = signal('none');

  public nodes: Node[] = createNodes([
    { id: '1', point: { x: 10, y: 200 }, data: { text: '1' } },
    { id: '2', point: { x: 250, y: 100 }, data: { text: '2' } },
    { id: '3', point: { x: 250, y: 300 }, data: { text: '3' } },
  ]);

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
      component: ColoredEdgeComponent,
      data: signal<ColoredEdgeData>({ color: '#e0a100', label: 'Amber' }),
      markers: signal({ end: { type: 'arrow-closed' } }),
    },
    {
      id: '1 -> 3',
      source: '1',
      target: '3',
      component: ColoredEdgeComponent,
      data: signal<ColoredEdgeData>({ color: '#ec586e', label: 'Rose' }),
    },
  ];

  protected onEdgeEvent(event: ComponentEdgeEvent<[ColoredEdgeComponent]>) {
    if (event.eventName === 'picked') {
      this.picked.set(event.eventPayload);
    }
  }
}
