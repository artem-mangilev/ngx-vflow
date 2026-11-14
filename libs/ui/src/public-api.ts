export { VuiNode, VuiNodeHeader, VuiNodeFooter } from './lib/node.directive';
export { VuiRow } from './lib/row.directive';
export { VuiGroup, VuiGroupHeader } from './lib/group.directive';
export { VuiTitle, VuiMeta } from './lib/text.directive';
export { VuiPort } from './lib/port.directive';
export { VuiEdge, VuiEdgeLabel } from './lib/edge.directive';
export { VuiToolbar } from './lib/overlay.directive';
export { VuiControls, type VuiControlsLabels } from './lib/controls.component';

import { VuiNode, VuiNodeHeader, VuiNodeFooter } from './lib/node.directive';
import { VuiRow } from './lib/row.directive';
import { VuiGroup, VuiGroupHeader } from './lib/group.directive';
import { VuiTitle, VuiMeta } from './lib/text.directive';
import { VuiPort } from './lib/port.directive';
import { VuiEdge, VuiEdgeLabel } from './lib/edge.directive';
import { VuiToolbar } from './lib/overlay.directive';
import { VuiControls } from './lib/controls.component';

/** Convenience imports; every directive is also independently importable. */
export const Vui = [
  VuiNode,
  VuiNodeHeader,
  VuiNodeFooter,
  VuiRow,
  VuiGroup,
  VuiGroupHeader,
  VuiTitle,
  VuiMeta,
  VuiPort,
  VuiEdge,
  VuiEdgeLabel,
  VuiToolbar,
  VuiControls,
] as const;
