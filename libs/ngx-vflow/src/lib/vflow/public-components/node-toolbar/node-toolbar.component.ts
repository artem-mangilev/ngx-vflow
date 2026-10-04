import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Position } from '../../types/position.type';
import { VflowNoDragDirective } from '../../directives/gesture-exclusions.directive';

/**
 * A toolbar attached to one side of the node presentation it sits in.
 *
 * The host is absolutely positioned against the nearest positioned ancestor, normally the node box itself,
 * so it moves, zooms, elevates and culls with the node without any bookkeeping. Put it directly inside the
 * presentation element and keep that element free of `overflow: hidden`. The gap to the node is
 * `--v-toolbar-offset` (10px by default). Pointer gestures inside the toolbar never drag the node.
 */
@Component({
  selector: 'v-node-toolbar',
  template: `<ng-content />`,
  styles: [
    `
      :host {
        position: absolute;
        width: max-content;
        pointer-events: all;
        --_gap: var(--v-toolbar-offset, 10px);
      }

      :host([data-position='top']) {
        bottom: calc(100% + var(--_gap));
        left: 50%;
        transform: translateX(-50%);
      }

      :host([data-position='bottom']) {
        top: calc(100% + var(--_gap));
        left: 50%;
        transform: translateX(-50%);
      }

      :host([data-position='left']) {
        right: calc(100% + var(--_gap));
        top: 50%;
        transform: translateY(-50%);
      }

      :host([data-position='right']) {
        left: calc(100% + var(--_gap));
        top: 50%;
        transform: translateY(-50%);
      }
    `,
  ],
  host: {
    '[attr.data-position]': 'position()',
  },
  hostDirectives: [VflowNoDragDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VflowNodeToolbarComponent {
  public position = input<Position>('top');
}
