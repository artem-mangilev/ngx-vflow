import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * Visible connection point. Use inside a core handle template, not on the positioning wrapper.
 * `vflowPortState` mirrors core feedback for the connection in progress; `vflowPortConnected`
 * is application knowledge about existing edges.
 */
@Directive({
  selector: '[vflowPort]',
  host: {
    class: 'vui-port',
    '[attr.data-state]': 'vflowPortState()',
    '[attr.data-connected]': 'vflowPortConnected()',
  },
})
export class VflowPort {
  readonly vflowPortState = input<'idle' | 'valid' | 'invalid'>('idle');
  readonly vflowPortConnected = input(false, { transform: booleanAttribute });
}

/** Text next to a port, for example a typed output name. Placement is the consumer's layout. */
@Directive({ selector: '[vflowPortLabel]', host: { class: 'vui-port-label' } })
export class VflowPortLabel {}
