import { Directive } from '@angular/core';

/**
 * A visual group with a title around other nodes: a tinted surface with a hairline, like a macOS group box. Parent relationships and shared movement
 * stay in graph data (ADR-0003); this directive does not create them.
 */
@Directive({
  selector: '[vuiContainer]',
  host: {
    class: `vui-container
      relative box-border rounded-vui-surface border border-vui-border
      bg-vui-surface-muted text-vui-foreground font-vui-sans text-vui-body
      data-[vui-selected=true]:outline-2 data-[vui-selected=true]:outline-offset-2 data-[vui-selected=true]:outline-vui-selection
      forced-colors:data-[vui-selected=true]:outline-[Highlight]`,
  },
})
export class VuiContainer {}
