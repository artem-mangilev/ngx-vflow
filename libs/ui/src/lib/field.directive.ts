import { Directive } from '@angular/core';

/** A field row whose own DOM box can anchor core handles. No schema or endpoint state is stored here. */
@Directive({ selector: '[vflowField]', host: { class: 'vui-field' } })
export class VflowField {}
