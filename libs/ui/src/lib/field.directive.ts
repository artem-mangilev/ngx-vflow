import { Directive } from '@angular/core';

/** A field row whose own DOM box can anchor core handles. No schema or endpoint state is stored here. */
@Directive({ selector: '[vflowField]', host: { class: 'vui-field' } })
export class VflowField {}

/** Field name; takes the remaining row width and wraps long identifiers. */
@Directive({ selector: '[vflowFieldName]', host: { class: 'vui-field-name' } })
export class VflowFieldName {}

/** Type, key or other metadata of a field. */
@Directive({ selector: '[vflowFieldMeta]', host: { class: 'vui-field-meta' } })
export class VflowFieldMeta {}
