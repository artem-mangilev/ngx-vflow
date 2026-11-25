import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { DemoIconComponent, DocsButton } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, injectEdge } from 'ngx-vflow';
import { EdgeData } from '../services/flow-store.service';

/**
 * An edge drawn by a component: a line with a label that holds a button, which removes the edge. The flow renders
 * the component on its own SVG group, which holds the interaction stroke, so hover and clicks near the line reach this
 * presentation.
 *
 * A label is HTML in the label layer of the flow, so it can hold a control.
 */
@Component({
  selector: 'g[docsRemovableEdge]',
  template: `
    @let label = edge.data().label;

    <svg:path vuiEdge />
    <span *vEdgeLabel vuiEdgeLabel class="py-0! pe-0!" [class]="label ? '' : 'ps-0!'">
      {{ label }}
      <button
        docsButton="plain"
        small
        icon
        type="button"
        vNoSelect
        aria-label="Remove the connection"
        (click)="removed.emit()">
        <app-demo-icon name="close" />
      </button>
    </span>
  `,
  imports: [Vflow, Vui, DocsButton, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemovableEdgeComponent {
  protected readonly edge = injectEdge<EdgeData>();

  /** Reaches the flow as a `componentEdgeEvent`, which carries the id of this edge. */
  readonly removed = output<void>();
}
