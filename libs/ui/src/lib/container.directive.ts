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
      bg-vui-surface-muted text-vui-foreground font-vui-sans tracking-vui-normal text-vui-body antialiased
      data-[vui-selected=true]:outline-2 data-[vui-selected=true]:outline-offset-2 data-[vui-selected=true]:outline-vui-selection
      forced-colors:data-[vui-selected=true]:outline-[Highlight]`,
  },
})
export class VuiContainer {}

/**
 * Header row of a container, set in the headline weight like a card header: a title, meta, icon or actions share the
 * baseline of the title's first line.
 */
@Directive({
  selector: '[vuiContainerHeader]',
  host: {
    class: `vui-container-header
      flex items-baseline gap-vui-2 px-vui-3 py-vui-2 border-b border-vui-separator
      font-vui-strong`,
  },
})
export class VuiContainerHeader {}
