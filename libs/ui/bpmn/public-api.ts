import { Directive, input } from '@angular/core';

/** A BPMN event outline. The consumer supplies its symbol and accessible name. */
@Directive({ selector: '[vflowBpmnEvent]', host: { class: 'vui-bpmn-event', '[attr.data-event]': 'vflowBpmnEvent()' } })
export class VflowBpmnEvent {
  readonly vflowBpmnEvent = input<'start' | 'intermediate' | 'end'>('start');
}

/** A diamond outline that leaves the consumer's text and handle coordinates unrotated. */
@Directive({ selector: '[vflowBpmnGateway]', host: { class: 'vui-bpmn-gateway' } })
export class VflowBpmnGateway {}

/** Native task and participant surfaces; graph relationships belong to the consumer. */
@Directive({ selector: '[vflowBpmnTask]', host: { class: 'vui-node vui-bpmn-task' } })
export class VflowBpmnTask {}
@Directive({ selector: '[vflowBpmnPool]', host: { class: 'vui-group vui-bpmn-pool' } })
export class VflowBpmnPool {}
@Directive({ selector: '[vflowBpmnLane]', host: { class: 'vui-group vui-bpmn-lane' } })
export class VflowBpmnLane {}
@Directive({
  selector: 'path[vflowBpmnLink]',
  host: { class: 'vui-edge vui-bpmn-link', '[attr.data-kind]': 'vflowBpmnLink()' },
})
export class VflowBpmnLink {
  readonly vflowBpmnLink = input<'sequence' | 'message' | 'association'>('sequence');
}
export const VflowBpmn = [
  VflowBpmnEvent,
  VflowBpmnGateway,
  VflowBpmnTask,
  VflowBpmnPool,
  VflowBpmnLane,
  VflowBpmnLink,
] as const;
