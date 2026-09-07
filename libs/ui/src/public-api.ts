export { VflowButton } from './lib/button.directive';
export * from './lib/primitives.directive';

import { VflowButton } from './lib/button.directive';
import {
  VflowTheme,
  VflowSelected,
  VflowNode,
  VflowNodeHeader,
  VflowNodeBody,
  VflowNodeFooter,
  VflowField,
  VflowPort,
  VflowStatus,
  VflowEdge,
  VflowEdgeLabel,
  VflowGroup,
  VflowBpmnEvent,
  VflowBpmnGateway,
} from './lib/primitives.directive';

/** Convenience imports; every directive is also independently importable. */
export const VflowUi = [
  VflowButton,
  VflowTheme,
  VflowSelected,
  VflowNode,
  VflowNodeHeader,
  VflowNodeBody,
  VflowNodeFooter,
  VflowField,
  VflowPort,
  VflowStatus,
  VflowEdge,
  VflowEdgeLabel,
  VflowGroup,
  VflowBpmnEvent,
  VflowBpmnGateway,
] as const;
