import { Directive, input } from '@angular/core';

const SELECTED = `data-[vui-selected=true]:outline-2 data-[vui-selected=true]:outline-offset-2
  data-[vui-selected=true]:outline-vui-selection forced-colors:data-[vui-selected=true]:outline-[Highlight]`;

/** A BPMN event outline. The consumer supplies its symbol and accessible name. */
@Directive({
  selector: '[vuiBpmnEvent]',
  host: {
    class: `vui-bpmn-event
      relative box-border grid place-items-center size-vui-14 rounded-full border-2 border-vui-foreground
      data-[vui-event=intermediate]:border-4 data-[vui-event=intermediate]:border-double data-[vui-event=end]:border-4
      bg-vui-surface text-vui-foreground font-vui-sans text-vui-body
      ${SELECTED}`,
    '[attr.data-vui-event]': 'vuiBpmnEvent()',
  },
})
export class VuiBpmnEvent {
  readonly vuiBpmnEvent = input<'start' | 'intermediate' | 'end'>('start');
}

/**
 * A diamond outline that leaves the consumer's text and handle coordinates unrotated.
 * Renders the exclusive (×) or parallel (+) marker; put the decision text in `vuiExternalLabel`.
 * The diamond is a square rotated by 45° whose side is 1/√2 of the host, so its corners touch the host's edges.
 */
@Directive({
  selector: '[vuiBpmnGateway]',
  host: {
    class: `vui-bpmn-gateway
      relative isolate grid place-items-center size-vui-16
      text-vui-foreground font-vui-sans text-vui-symbol
      before:content-[''] before:absolute before:-z-10 before:box-border before:size-[70.7107%] before:rotate-45
      before:border-2 before:border-vui-foreground before:bg-vui-surface
      data-[vui-gateway=exclusive]:after:content-(--vui-bpmn-exclusive) data-[vui-gateway=parallel]:after:content-(--vui-bpmn-parallel)
      after:font-vui-strong
      data-[vui-selected=true]:before:outline-2 data-[vui-selected=true]:before:outline-offset-2
      data-[vui-selected=true]:before:outline-vui-selection forced-colors:data-[vui-selected=true]:before:outline-[Highlight]`,
    '[attr.data-vui-gateway]': 'vuiBpmnGateway()',
  },
})
export class VuiBpmnGateway {
  readonly vuiBpmnGateway = input<'exclusive' | 'parallel'>('exclusive');
}

/** A task: rounded rectangle with centered text. Size and content are the consumer's. */
@Directive({
  selector: '[vuiBpmnTask]',
  host: {
    class: `vui-bpmn-task
      relative box-border grid place-items-center text-center px-vui-3 py-vui-2 rounded-vui-surface border border-vui-foreground
      bg-vui-surface text-vui-foreground font-vui-sans text-vui-body
      ${SELECTED}`,
  },
})
export class VuiBpmnTask {}

const PARTICIPANT_TITLE = `[&>.vui-title]:absolute [&>.vui-title]:inset-y-vui-0 [&>.vui-title]:left-vui-0 [&>.vui-title]:w-vui-8
  [&>.vui-title]:grid [&>.vui-title]:place-items-center [&>.vui-title]:px-vui-1
  [&>.vui-title]:[writing-mode:vertical-rl] [&>.vui-title]:rotate-180 [&>.vui-title]:whitespace-nowrap
  [&>.vui-title]:font-vui-strong [&>.vui-title]:border-r`;

/**
 * A pool: the frame of a participant with a vertical title strip. Lanes and elements are separate
 * nodes whose parent relationship stays in graph data; the pool can carry its own handles for message flows.
 */
@Directive({
  selector: '[vuiBpmnPool]',
  host: {
    class: `vui-bpmn-pool
      relative box-border border border-vui-foreground
      bg-vui-surface-muted text-vui-foreground font-vui-sans text-vui-body
      ${PARTICIPANT_TITLE} [&>.vui-title]:border-vui-foreground [&>.vui-title]:bg-vui-surface
      ${SELECTED}`,
  },
})
export class VuiBpmnPool {}

/** A lane inside a pool: a thinner frame with its own vertical title strip. */
@Directive({
  selector: '[vuiBpmnLane]',
  host: {
    class: `vui-bpmn-lane
      relative box-border border border-vui-border
      text-vui-foreground font-vui-sans text-vui-body
      ${PARTICIPANT_TITLE} [&>.vui-title]:border-vui-border
      ${SELECTED}`,
  },
})
export class VuiBpmnLane {}

/**
 * Sequence, message or association flow on the SVG path of an edge template. Routing, hit targets
 * and markers stay with core: attach `arrow-closed` (sequence) or `arrow` (message) end markers in edge data.
 */
@Directive({
  selector: 'path[vuiBpmnFlow]',
  host: {
    class: `vui-bpmn-flow
      fill-none stroke-2 [stroke-linejoin:round]
      data-[vui-flow=message]:[stroke-dasharray:8_5] data-[vui-flow=association]:[stroke-dasharray:2_4]
      data-[vui-flow=association]:stroke-1
      stroke-vui-foreground data-[vui-selected=true]:stroke-vui-selection
      forced-colors:stroke-[CanvasText] forced-colors:data-[vui-selected=true]:stroke-[Highlight]`,
    '[attr.data-vui-flow]': 'vuiBpmnFlow()',
  },
})
export class VuiBpmnFlow {
  readonly vuiBpmnFlow = input<'sequence' | 'message' | 'association'>('sequence');
}
