import { booleanAttribute, Directive, input } from '@angular/core';

/**
 * Visible connection point. Use inside a core handle template, not on the positioning wrapper.
 * `vflowPortState` mirrors core feedback for the connection in progress; `vflowPortConnected`
 * is application knowledge about existing edges.
 */
@Directive({
  selector: '[vflowPort]',
  host: {
    class:
      'vui-port vui:block vui:box-border vui:size-3.5 vui:rounded-full vui:border-2 vui:border-surface vui:bg-muted vui:data-[connected=true]:bg-foreground vui:data-[state=valid]:bg-success vui:data-[state=invalid]:bg-danger vui:data-[state=invalid]:border-dashed vui:forced-colors:bg-[ButtonText] vui:forced-colors:border-[Canvas] vui:forced-colors:[forced-color-adjust:none]',
    '[attr.data-state]': 'vflowPortState()',
    '[attr.data-connected]': 'vflowPortConnected()',
  },
})
export class VflowPort {
  readonly vflowPortState = input<'idle' | 'valid' | 'invalid'>('idle');
  readonly vflowPortConnected = input(false, { transform: booleanAttribute });
}
