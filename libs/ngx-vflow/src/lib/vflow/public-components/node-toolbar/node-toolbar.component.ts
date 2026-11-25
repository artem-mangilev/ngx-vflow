import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Position } from '../../types/position.type';
import { VflowNoDragDirective } from '../../public-directives/gesture-exclusions.directive';

/**
 * A toolbar attached to one side of the node presentation it sits in.
 *
 * The host is absolutely positioned against the nearest positioned ancestor, normally the node box itself,
 * so it moves, zooms, elevates and culls with the node without any bookkeeping. Put it directly inside the
 * presentation element and keep that element free of `overflow: hidden`. The gap to the node is a `margin` of 10px on
 * the side facing it; the rules have no specificity, so any CSS of the application changes it. Pointer gestures inside
 * the toolbar never drag the node.
 */
@Component({
  selector: 'v-node-toolbar',
  template: `<ng-content />`,
  // Without specificity, so the CSS of the application always wins, the margin included.
  styles: `
    :where(:host) {
      position: absolute;
      width: max-content;
      pointer-events: all;
    }

    :where(:host([data-v-node-toolbar='top'])) {
      bottom: 100%;
      left: 50%;
      margin-bottom: 10px;
      translate: -50% 0;
    }

    :where(:host([data-v-node-toolbar='bottom'])) {
      top: 100%;
      left: 50%;
      margin-top: 10px;
      translate: -50% 0;
    }

    :where(:host([data-v-node-toolbar='left'])) {
      right: 100%;
      top: 50%;
      margin-right: 10px;
      translate: 0 -50%;
    }

    :where(:host([data-v-node-toolbar='right'])) {
      left: 100%;
      top: 50%;
      margin-left: 10px;
      translate: 0 -50%;
    }
  `,
  host: {
    '[attr.data-v-node-toolbar]': 'position()',
  },
  hostDirectives: [VflowNoDragDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VflowNodeToolbarComponent {
  public position = input<Position>('top');
}
