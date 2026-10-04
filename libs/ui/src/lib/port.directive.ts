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
    class:
      'vui-port vui:block vui:box-border vui:size-3.5 vui:rounded-full vui:border-2 vui:border-surface vui:bg-muted vui:data-[vui-connected=true]:bg-foreground vui:data-[vui-state=connecting]:bg-accent vui:data-[vui-state=valid]:bg-success vui:data-[vui-state=invalid]:bg-danger vui:data-[vui-state=invalid]:border-dashed vui:forced-colors:bg-[ButtonText] vui:forced-colors:border-[Canvas] vui:forced-colors:[forced-color-adjust:none]',
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
