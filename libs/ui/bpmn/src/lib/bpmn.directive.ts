import { Directive, input } from '@angular/core';

const SELECTED =
  'vui:data-[vui-selected=true]:outline-2 vui:data-[vui-selected=true]:outline-offset-2 vui:data-[vui-selected=true]:outline-accent vui:forced-colors:data-[vui-selected=true]:outline-[Highlight]';

/** A BPMN event outline. The consumer supplies its symbol and accessible name. */
@Directive({
  selector: '[vflowBpmnEvent]',
  host: {
    class: `vui-bpmn-event vui:relative vui:box-border vui:grid vui:place-items-center vui:size-14 vui:rounded-full vui:border-2 vui:border-foreground vui:bg-surface vui:text-foreground vui:font-sans vui:text-base vui:data-[event=intermediate]:border-[5px] vui:data-[event=intermediate]:border-double vui:data-[event=end]:border-[5px] ${SELECTED}`,
    '[attr.data-event]': 'vflowBpmnEvent()',
  },
})
export class VflowBpmnEvent {
  readonly vflowBpmnEvent = input<'start' | 'intermediate' | 'end'>('start');
}

/**
 * A diamond outline that leaves the consumer's text and handle coordinates unrotated.
 * Renders the exclusive (×) or parallel (+) marker; put the decision text in `vflowExternalLabel`.
 */
@Directive({
  selector: '[vflowBpmnGateway]',
  host: {
    class: `vui-bpmn-gateway vui:relative vui:isolate vui:grid vui:place-items-center vui:size-16 vui:text-[28px] vui:leading-none vui:text-foreground vui:font-sans vui:before:content-[''] vui:before:absolute vui:before:-z-10 vui:before:box-border vui:before:size-[70.7107%] vui:before:rotate-45 vui:before:border-2 vui:before:border-foreground vui:before:bg-surface vui:data-[gateway=exclusive]:after:content-(--vui-bpmn-exclusive) vui:data-[gateway=parallel]:after:content-(--vui-bpmn-parallel) vui:after:font-semibold vui:data-[vui-selected=true]:before:outline-2 vui:data-[vui-selected=true]:before:outline-offset-2 vui:data-[vui-selected=true]:before:outline-accent vui:forced-colors:data-[vui-selected=true]:before:outline-[Highlight]`,
    '[attr.data-gateway]': 'vflowBpmnGateway()',
  },
})
export class VflowBpmnGateway {
  readonly vflowBpmnGateway = input<'exclusive' | 'parallel'>('exclusive');
}

/** A task: rounded rectangle with centered text. Size and content are the consumer's. */
@Directive({
  selector: '[vflowBpmnTask]',
  host: {
    class: `vui-bpmn-task vui:relative vui:box-border vui:grid vui:place-items-center vui:text-center vui:rounded-lg vui:border vui:border-foreground vui:bg-surface vui:text-foreground vui:font-sans vui:text-base vui:px-3 vui:py-2 ${SELECTED}`,
  },
})
export class VflowBpmnTask {}

const PARTICIPANT_TITLE =
  'vui:[&>.vui-title]:absolute vui:[&>.vui-title]:inset-y-0 vui:[&>.vui-title]:left-0 vui:[&>.vui-title]:w-8 vui:[&>.vui-title]:grid vui:[&>.vui-title]:place-items-center vui:[&>.vui-title]:px-1.5 vui:[&>.vui-title]:[writing-mode:vertical-rl] vui:[&>.vui-title]:rotate-180 vui:[&>.vui-title]:font-semibold vui:[&>.vui-title]:whitespace-nowrap';

/**
 * A pool: the frame of a participant with a vertical title strip. Lanes and elements are separate
 * nodes whose parent relationship stays in graph data; the pool can carry its own handles for message flows.
 */
@Directive({
  selector: '[vflowBpmnPool]',
  host: {
    class: `vui-bpmn-pool vui:relative vui:box-border vui:border vui:border-foreground vui:bg-[color-mix(in_srgb,var(--vui-surface-muted)_55%,transparent)] vui:text-foreground vui:font-sans vui:text-base ${PARTICIPANT_TITLE} vui:[&>.vui-title]:border-r vui:[&>.vui-title]:border-foreground vui:[&>.vui-title]:bg-surface ${SELECTED}`,
  },
})
export class VflowBpmnPool {}

/** A lane inside a pool: a thinner frame with its own vertical title strip. */
@Directive({
  selector: '[vflowBpmnLane]',
  host: {
    class: `vui-bpmn-lane vui:relative vui:box-border vui:border vui:border-border vui:text-foreground vui:font-sans vui:text-base ${PARTICIPANT_TITLE} vui:[&>.vui-title]:border-r vui:[&>.vui-title]:border-border ${SELECTED}`,
  },
})
export class VflowBpmnLane {}

/**
 * Sequence, message or association flow on the SVG path of an edge template. Routing, hit targets
 * and markers stay with core: attach `arrow-closed` (sequence) or `arrow` (message) end markers in edge data.
 */
@Directive({
  selector: 'path[vflowBpmnFlow]',
  host: {
    class:
      'vui-bpmn-flow vui:fill-none vui:stroke-foreground vui:stroke-2 vui:[stroke-linejoin:round] vui:data-[flow=message]:[stroke-dasharray:8_5] vui:data-[flow=association]:[stroke-dasharray:2_4] vui:data-[flow=association]:stroke-[1.5] vui:data-[vui-selected=true]:stroke-accent vui:forced-colors:stroke-[CanvasText] vui:forced-colors:data-[vui-selected=true]:stroke-[Highlight]',
    '[attr.data-flow]': 'vflowBpmnFlow()',
  },
})
export class VflowBpmnFlow {
  readonly vflowBpmnFlow = input<'sequence' | 'message' | 'association'>('sequence');
}
