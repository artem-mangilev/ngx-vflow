import { Directive } from '@angular/core';
import { injectConnection, injectEdge } from 'ngx-vflow';

/** The look of a line, which an edge and the connection in progress share. */
const LINE = `fill-none stroke-2 [stroke-linejoin:round]
  stroke-vui-muted [[data-v-selected]_&]:stroke-vui-accent
  forced-colors:stroke-[CanvasText] forced-colors:[[data-v-selected]_&]:stroke-[Highlight]`;

/**
 * The line of an edge. It draws the path of its edge with the markers of that edge, so there is nothing to bind, and
 * works only inside an edge: in a `vEdge` template or an edge component. Core draws the hit area of the edge, and
 * the selection is read from the core edge host (`data-v-selected`).
 */
@Directive({
  selector: 'path[vuiEdge]',
  host: {
    class: LINE,
    '[attr.d]': 'edge.path()',
    '[attr.marker-start]': 'edge.markerStart() || null',
    '[attr.marker-end]': 'edge.markerEnd() || null',
  },
})
export class VuiEdge {
  protected readonly edge = injectEdge();
}

/**
 * The line of the connection in progress, with the look of an edge. It draws the path of the connection with its end
 * marker, so there is nothing to bind, and works only inside a `vConnection` template.
 */
@Directive({
  selector: 'path[vuiConnection]',
  host: {
    class: LINE,
    '[attr.d]': 'connection.path()',
    '[attr.marker-end]': 'connection.markerEnd() || null',
  },
})
export class VuiConnection {
  protected readonly connection = injectConnection();
}

/** HTML label surface for an edge label template. */
@Directive({
  selector: '[vuiEdgeLabel]',
  host: {
    class: `vui-edge-label
      inline-flex items-center gap-vui-1 px-vui-2 py-vui-1 rounded-vui-control border border-vui-border
      bg-vui-surface text-vui-foreground text-xs`,
  },
})
export class VuiEdgeLabel {}
