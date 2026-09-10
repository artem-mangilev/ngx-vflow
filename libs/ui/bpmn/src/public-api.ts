import { Directive, input } from '@angular/core';
import { VflowEdge, VflowGroup, VflowNode, VflowNodeBody } from '@vflow/ui';

/** BPMN presentation only; names, anchors and process semantics belong to the application. */
@Directive({
  selector: '[vflowBpmnTask]',
  hostDirectives: [VflowNode, VflowNodeBody],
  host: { class: 'vui-bpmn-task' },
})
export class VflowBpmnTask {}

@Directive({ selector: '[vflowBpmnEvent]', host: { class: 'vui-bpmn-event', '[attr.data-event]': 'vflowBpmnEvent()' } })
export class VflowBpmnEvent {
  readonly vflowBpmnEvent = input<'start' | 'end'>('start');
}

/** The application supplies × for XOR or + for parallel; the content stays unrotated. */
@Directive({
  selector: '[vflowBpmnGateway]',
  host: { class: 'vui-bpmn-gateway', '[attr.data-gateway]': 'vflowBpmnGateway()' },
})
export class VflowBpmnGateway {
  readonly vflowBpmnGateway = input<'xor' | 'parallel'>('xor');
}

@Directive({ selector: '[vflowBpmnPool]', hostDirectives: [VflowGroup], host: { class: 'vui-bpmn-pool' } })
export class VflowBpmnPool {}

@Directive({ selector: '[vflowBpmnLane]', hostDirectives: [VflowGroup], host: { class: 'vui-bpmn-lane' } })
export class VflowBpmnLane {}

/** Bind core geometry/marker URLs on the same path. */
@Directive({
  selector: 'path[vflowBpmnLink]',
  hostDirectives: [VflowEdge],
  host: { class: 'vui-bpmn-link', '[attr.data-link]': 'vflowBpmnLink()' },
})
export class VflowBpmnLink {
  readonly vflowBpmnLink = input<'sequence' | 'message' | 'association'>('sequence');
}

export const VflowBpmn = [
  VflowBpmnTask,
  VflowBpmnEvent,
  VflowBpmnGateway,
  VflowBpmnPool,
  VflowBpmnLane,
  VflowBpmnLink,
] as const;
