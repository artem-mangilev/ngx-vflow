import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { VflowHandleDirective } from 'ngx-vflow';

/**
 * A component that is a handle itself: `vHandle` is applied through `hostDirectives`, the role is bound
 * where the component is used and the look follows the signals of the injected directive.
 */
@Component({
  selector: 'square-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['handleType', 'position', 'handleId', 'canAccept'] }],
  host: {
    class: 'block size-3 rounded-xs border border-solid border-vui-foreground',
    '[class]': 'fill()',
  },
  template: '',
})
export class SquareHandleComponent {
  protected readonly handle = inject(VflowHandleDirective);

  protected readonly fill = computed(() => {
    if (!this.handle.canAccept()) return 'bg-vui-surface opacity-40';

    switch (this.handle.state()) {
      case 'valid':
        return 'bg-vui-success';
      case 'invalid':
        return 'bg-vui-danger';
      default:
        return 'bg-vui-surface';
    }
  });
}
