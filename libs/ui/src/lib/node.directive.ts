import { Directive } from '@angular/core';

/** Card shell; dimensions, content, semantics and interaction belong to the consumer and core. */
@Directive({ selector: '[vflowNode]', host: { class: 'vui-node' } })
export class VflowNode {}

@Directive({ selector: '[vflowNodeHeader]', host: { class: 'vui-node-header' } })
export class VflowNodeHeader {}

@Directive({ selector: '[vflowNodeBody]', host: { class: 'vui-node-body' } })
export class VflowNodeBody {}

@Directive({ selector: '[vflowNodeFooter]', host: { class: 'vui-node-footer' } })
export class VflowNodeFooter {}
