import { Directive } from '@angular/core';

/** Surface for toolbar content, for example inside core `node-toolbar`. */
@Directive({ selector: '[vflowToolbar]', host: { class: 'vui-toolbar' } })
export class VflowToolbar {}

/** A label placed outside a shape, below it by default; the shape element must be positioned. */
@Directive({ selector: '[vflowExternalLabel]', host: { class: 'vui-external-label' } })
export class VflowExternalLabel {}
