import { Directive } from '@angular/core';

/**
 * A visual frame with a title around other nodes. Parent relationships and shared movement
 * stay in graph data (ADR-0003); this directive does not create them.
 */
@Directive({ selector: '[vflowContainer]', host: { class: 'vui-container' } })
export class VflowContainer {}

@Directive({ selector: '[vflowContainerTitle]', host: { class: 'vui-container-title' } })
export class VflowContainerTitle {}

@Directive({ selector: '[vflowContainerBody]', host: { class: 'vui-container-body' } })
export class VflowContainerBody {}
