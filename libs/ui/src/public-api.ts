export { VflowButton } from './lib/button.directive';
export { VflowControls } from './lib/controls.component';
export * from './lib/primitives.directive';

import { VflowButton } from './lib/button.directive';
import { VflowControls } from './lib/controls.component';
import {
  VflowTheme,
  VflowSelected,
  VflowNode,
  VflowNodeHeader,
  VflowNodeBody,
  VflowNodeFooter,
  VflowField,
  VflowPort,
  VflowPortLabel,
  VflowStatus,
  VflowEdge,
  VflowEdgeLabel,
  VflowGroup,
  VflowGroupHeader,
  VflowToolbar,
  VflowExternalLabel,
} from './lib/primitives.directive';

/** Convenience imports; every primitive is independently importable. BPMN is a separate entry point. */
export const VflowUi = [
  VflowButton,
  VflowControls,
  VflowTheme,
  VflowSelected,
  VflowNode,
  VflowNodeHeader,
  VflowNodeBody,
  VflowNodeFooter,
  VflowField,
  VflowPort,
  VflowPortLabel,
  VflowStatus,
  VflowEdge,
  VflowEdgeLabel,
  VflowGroup,
  VflowGroupHeader,
  VflowToolbar,
  VflowExternalLabel,
] as const;
