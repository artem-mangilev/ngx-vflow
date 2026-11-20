import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { DemoIconComponent, DocsButton } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, VflowEdgeInteractionAreaDirective, injectEdge } from 'ngx-vflow';

/**
 * An edge drawn by a component: a line with a button in the middle that removes it. The flow renders the component
 * on its own SVG group; the host directive moves the interaction stroke into that group, so hover and clicks near
 * the line reach this presentation.
 *
 * A label is HTML in the label layer of the flow, so it can hold a control.
 */
@Component({
  selector: 'g[docsRemovableEdge]',
  hostDirectives: [VflowEdgeInteractionAreaDirective],
  template: `
    <svg:path vuiEdge [attr.d]="edge.path()" [attr.marker-end]="edge.markerEnd()" />
    <span *vEdgeLabel vuiEdgeLabel class="px-0! py-0!">
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
  protected readonly edge = injectEdge();

  /** Reaches the flow as a `componentEdgeEvent`, which carries the id of this edge. */
  readonly removed = output<void>();
}
