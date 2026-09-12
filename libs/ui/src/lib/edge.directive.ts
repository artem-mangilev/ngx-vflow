import { Directive } from '@angular/core';

/** SVG presentation only. Compose with core customTemplateEdge/selectable for interaction. */
@Directive({ selector: 'path[vflowEdge]', host: { class: 'vui-edge' } })
export class VflowEdge {}

/** HTML label surface for an edge label template. */
@Directive({ selector: '[vflowEdgeLabel]', host: { class: 'vui-edge-label' } })
export class VflowEdgeLabel {}
