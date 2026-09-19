import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { HandleState, VflowHandleDirective } from 'ngx-vflow';

/**
 * A handle with the standard connection point look: applies the core `vflowHandle` directive to its host, so the
 * element is registered, positioned and gets the handle state. The handle inputs `handleType`, `position`, `id`,
 * `layout`, offsets, connectability and accessibility are forwarded. `vflowPortState` overrides the handle feedback; `vflowPortConnected`
 * is application knowledge about existing edges.
 */
@Directive({
  selector: '[vflowPort]',
  hostDirectives: [
    {
      directive: VflowHandleDirective,
      inputs: [
        'handleType',
        'position',
        'id',
        'layout',
        'offsetX',
        'offsetY',
        'canStart',
        'canAccept',
        'ariaLabel',
        'ariaDescription',
        'domAttributes',
      ],
    },
  ],
  host: {
    class:
      'vui-port vui:block vui:box-border vui:size-3.5 vui:rounded-full vui:border-2 vui:border-surface vui:bg-muted vui:data-[connected=true]:bg-foreground vui:data-[state=connecting]:bg-accent vui:data-[state=valid]:bg-success vui:data-[state=invalid]:bg-danger vui:data-[state=invalid]:border-dashed vui:forced-colors:bg-[ButtonText] vui:forced-colors:border-[Canvas] vui:forced-colors:[forced-color-adjust:none]',
    '[attr.data-state]': 'state()',
    '[attr.data-connected]': 'vflowPortConnected()',
  },
})
export class VflowPort {
  private readonly handle = inject(VflowHandleDirective, { self: true });

  readonly vflowPortState = input<HandleState>();
  readonly vflowPortConnected = input(false, { transform: booleanAttribute });

  protected readonly state = computed(() => this.vflowPortState() ?? this.handle.state());
}
