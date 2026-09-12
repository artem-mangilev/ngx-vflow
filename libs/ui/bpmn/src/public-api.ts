export {
  VflowBpmnEvent,
  VflowBpmnGateway,
  VflowBpmnTask,
  VflowBpmnPool,
  VflowBpmnLane,
  VflowBpmnFlow,
} from './lib/bpmn.directive';

import {
  VflowBpmnEvent,
  VflowBpmnGateway,
  VflowBpmnTask,
  VflowBpmnPool,
  VflowBpmnLane,
  VflowBpmnFlow,
} from './lib/bpmn.directive';

/** The BPMN subset: task, start/intermediate/end events, exclusive/parallel gateways, pool/lane and flows. */
export const VflowBpmn = [
  VflowBpmnEvent,
  VflowBpmnGateway,
  VflowBpmnTask,
  VflowBpmnPool,
  VflowBpmnLane,
  VflowBpmnFlow,
] as const;
