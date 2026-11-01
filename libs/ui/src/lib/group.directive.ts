import { Directive } from '@angular/core';

/**
 * A visual group with a title around other nodes: a tinted surface with a hairline, like a macOS group box. Parent relationships and shared movement
 * stay in graph data (ADR-0003); this directive does not create them. Selection is read from the core node host and
 * colors the edge like `vuiNode`'s.
 */
@Directive({
  selector: '[vuiGroup]',
  host: {
    class: `vui-group
      relative box-border rounded-vui-surface border border-vui-border
      bg-vui-surface-muted text-vui-foreground
      [&:is([data-v-selected]_*,[data-v-preselected]_*)]:border-vui-accent
      [&:is([data-v-selected]_*,[data-v-preselected]_*)]:ring-1
      [&:is([data-v-selected]_*,[data-v-preselected]_*)]:ring-vui-accent
      forced-colors:[&:is([data-v-selected]_*,[data-v-preselected]_*)]:outline-2
      forced-colors:[&:is([data-v-selected]_*,[data-v-preselected]_*)]:outline-offset-2
      forced-colors:[&:is([data-v-selected]_*,[data-v-preselected]_*)]:outline-[Highlight]`,
  },
})
export class VuiGroup {}

/**
 * Header row of a group, set in semibold like a card header: a title, meta, icon or actions share the
 * baseline of the title's first line.
 */
@Directive({
  selector: '[vuiGroupHeader]',
  host: {
    class: `vui-group-header
      flex items-baseline gap-vui-2 px-vui-3 py-vui-2 border-b border-vui-separator
      font-semibold`,
  },
})
export class VuiGroupHeader {}
