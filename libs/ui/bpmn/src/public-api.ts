export { VuiBpmnEvent, VuiBpmnGateway, VuiBpmnTask, VuiBpmnPool, VuiBpmnLane, VuiBpmnFlow } from './lib/bpmn.directive';

import { VuiBpmnEvent, VuiBpmnGateway, VuiBpmnTask, VuiBpmnPool, VuiBpmnLane, VuiBpmnFlow } from './lib/bpmn.directive';

/** The BPMN subset: task, start/intermediate/end events, exclusive/parallel gateways, pool/lane and flows. */
export const VuiBpmn = [VuiBpmnEvent, VuiBpmnGateway, VuiBpmnTask, VuiBpmnPool, VuiBpmnLane, VuiBpmnFlow] as const;
