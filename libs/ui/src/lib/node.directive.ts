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

/** Decorative icon slot; mark purely decorative icons with `aria-hidden` yourself. */
@Directive({ selector: '[vflowNodeIcon]', host: { class: 'vui-node-icon' } })
export class VflowNodeIcon {}

/** Card title; takes the remaining header width and wraps long names. */
@Directive({ selector: '[vflowNodeTitle]', host: { class: 'vui-node-title' } })
export class VflowNodeTitle {}

@Directive({ selector: '[vflowNodeDescription]', host: { class: 'vui-node-description' } })
export class VflowNodeDescription {}

/** Secondary text such as category, type or timestamps. */
@Directive({ selector: '[vflowNodeMeta]', host: { class: 'vui-node-meta' } })
export class VflowNodeMeta {}

/** Group of consumer actions; add `vflowNoDrag` to controls that must not start a node drag. */
@Directive({ selector: '[vflowNodeActions]', host: { class: 'vui-node-actions' } })
export class VflowNodeActions {}
