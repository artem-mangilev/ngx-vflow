import { booleanAttribute, Directive, input } from '@angular/core';

/** Scope a theme to consumer DOM, including the flow's HTML and SVG layers. */
@Directive({ selector: '[vflowTheme]', host: { '[attr.data-vui-theme]': 'vflowTheme()' } })
export class VflowTheme {
  readonly vflowTheme = input<'light' | 'dark'>('light');
}

/** Presentation only: bind selection from ngx-vflow's template context. */
@Directive({ selector: '[vflowSelected]', host: { '[attr.data-vui-selected]': 'vflowSelected()' } })
export class VflowSelected {
  readonly vflowSelected = input(false, { transform: booleanAttribute });
}

/** A node surface; dimensions, content, semantics and interaction belong to the consumer/core. */
@Directive({ selector: '[vflowNode]', host: { class: 'vui-node' } })
export class VflowNode {}

@Directive({ selector: '[vflowNodeHeader]', host: { class: 'vui-node-header' } })
export class VflowNodeHeader {}

@Directive({ selector: '[vflowNodeBody]', host: { class: 'vui-node-body' } })
export class VflowNodeBody {}

@Directive({ selector: '[vflowNodeFooter]', host: { class: 'vui-node-footer' } })
export class VflowNodeFooter {}

/** A field row whose own DOM box can anchor core handles. No schema or endpoint state is stored here. */
@Directive({ selector: '[vflowField]', host: { class: 'vui-field' } })
export class VflowField {}

/** Use inside a core handle template, not on the positioning wrapper. */
@Directive({
  selector: '[vflowPort]',
  host: { class: 'vui-port', '[attr.data-state]': 'vflowPortState()' },
})
export class VflowPort {
  readonly vflowPortState = input<'idle' | 'valid' | 'invalid'>('idle');
}

/** Tone and status text are independent from graph selection and focus. */
@Directive({
  selector: '[vflowStatus]',
  host: { class: 'vui-status', '[attr.data-tone]': 'vflowStatus()', '[attr.data-active]': 'vflowStatusActive()' },
})
export class VflowStatus {
  readonly vflowStatus = input<'neutral' | 'info' | 'success' | 'warning' | 'danger'>('neutral');
  /** Activity is visual, not an action gate or an automatic live-region announcement. */
  readonly vflowStatusActive = input(false, { transform: booleanAttribute });
}

/** SVG presentation only. Compose with core customTemplateEdge/selectable for interaction. */
@Directive({ selector: 'path[vflowEdge]', host: { class: 'vui-edge' } })
export class VflowEdge {}

@Directive({ selector: '[vflowEdgeLabel]', host: { class: 'vui-edge-label' } })
export class VflowEdgeLabel {}

/** A visual frame; does not create parent relationships or change graph state. */
@Directive({ selector: '[vflowGroup]', host: { class: 'vui-group' } })
export class VflowGroup {}

@Directive({ selector: '[vflowGroupHeader]', host: { class: 'vui-group-header' } })
export class VflowGroupHeader {}

@Directive({ selector: '[vflowToolbar]', host: { class: 'vui-toolbar' } })
export class VflowToolbar {}

@Directive({ selector: '[vflowExternalLabel]', host: { class: 'vui-external-label' } })
export class VflowExternalLabel {}

@Directive({ selector: '[vflowPortLabel]', host: { class: 'vui-port-label' } })
export class VflowPortLabel {}
