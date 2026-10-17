import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { HandleState, VflowHandleDirective } from 'ngx-vflow';

/**
 * A handle with the standard connection point look: applies the core `vHandle` directive to its host, so the
 * element is registered, positioned and gets the handle state. The handle inputs `handleType`, `position`, `handleId`,
 * `layout`, offsets, connectability and `domAttributes` are forwarded. `vuiPortState` overrides the handle feedback; `vuiPortConnected`
 * is application knowledge about existing edges.
 */
@Directive({
  selector: '[vuiPort]',
  hostDirectives: [
    {
      directive: VflowHandleDirective,
      inputs: [
        'handleType',
        'position',
        'handleId',
        'layout',
        'offsetX',
        'offsetY',
        'canStart',
        'canAccept',
        'domAttributes',
      ],
    },
  ],
  host: {
    class: `vui-port
      block box-border size-vui-4 rounded-full border-2 border-vui-surface
      bg-vui-muted data-[vui-connected=true]:bg-vui-foreground data-[vui-state=connecting]:bg-vui-selection
      data-[vui-state=valid]:bg-vui-success data-[vui-state=invalid]:bg-vui-danger data-[vui-state=invalid]:border-dashed
      forced-colors:bg-[ButtonText] forced-colors:border-[Canvas] forced-colors:[forced-color-adjust:none]`,
    '[attr.data-vui-state]': 'state()',
    '[attr.data-vui-connected]': 'vuiPortConnected()',
  },
})
export class VuiPort {
  private readonly handle = inject(VflowHandleDirective, { self: true });

  readonly vuiPortState = input<HandleState>();
  readonly vuiPortConnected = input(false, { transform: booleanAttribute });

  protected readonly state = computed(() => this.vuiPortState() ?? this.handle.state());
}
