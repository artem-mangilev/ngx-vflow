import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VflowComponent } from 'ngx-vflow';
import { VflowButton } from './button.directive';

/** Viewport actions for an explicit flow instance; projected buttons belong to the application. */
@Component({
  selector: 'vflow-controls',
  imports: [VflowButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'vui-controls', role: 'group', 'aria-label': 'Viewport controls' },
  template: `
    <button
      vflowButton
      type="button"
      aria-label="Zoom in"
      [disabled]="flow().viewport().zoom >= flow().maxZoom"
      (click)="flow().zoomTo(Math.min(flow().maxZoom, flow().viewport().zoom * 1.25))">
      +
    </button>
    <button
      vflowButton
      type="button"
      aria-label="Zoom out"
      [disabled]="flow().viewport().zoom <= flow().minZoom"
      (click)="flow().zoomTo(Math.max(flow().minZoom, flow().viewport().zoom / 1.25))">
      −
    </button>
    <button vflowButton type="button" aria-label="Fit view" (click)="flow().fitView()">Fit</button>
    <output aria-label="Zoom level">{{ Math.round(flow().viewport().zoom * 100) }}%</output>
    <ng-content />
  `,
})
export class VflowControls {
  readonly flow = input.required<VflowComponent>();
  protected readonly Math = Math;
}
