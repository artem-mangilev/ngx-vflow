import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VflowComponent } from 'ngx-vflow';
import { VflowButton } from './button.directive';

/** Explicit flow reference keeps multiple editors independent. No graph-editing commands. */
@Component({
  selector: 'vflow-controls',
  imports: [VflowButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'vui-toolbar',
    role: 'group',
    '[attr.aria-label]': 'label()',
    '(pointerdown)': '$event.stopPropagation()',
    '(mousedown)': '$event.stopPropagation()',
    '(touchstart)': '$event.stopPropagation()',
    '(dblclick)': '$event.stopPropagation()',
  },
  template: `
    <button
      vflowButton
      type="button"
      [attr.aria-label]="zoomInLabel()"
      [disabled]="!flow().initialized() || flow().viewport().zoom >= flow().zoomRange().max"
      (click)="zoom(1.2)">
      +
    </button>
    <button
      vflowButton
      type="button"
      [attr.aria-label]="zoomOutLabel()"
      [disabled]="!flow().initialized() || flow().viewport().zoom <= flow().zoomRange().min"
      (click)="zoom(1 / 1.2)">
      −
    </button>
    <button vflowButton type="button" [disabled]="!flow().initialized()" (click)="flow().fitView()">
      {{ fitViewLabel() }}
    </button>
    <ng-content />
  `,
})
export class VflowControls {
  readonly flow = input.required<VflowComponent>();
  readonly label = input('Viewport controls');
  readonly zoomInLabel = input('Zoom in');
  readonly zoomOutLabel = input('Zoom out');
  readonly fitViewLabel = input('Fit view');

  protected zoom(factor: number) {
    const flow = this.flow();
    const { min, max } = flow.zoomRange();
    flow.zoomTo(Math.min(max, Math.max(min, flow.viewport().zoom * factor)));
  }
}
