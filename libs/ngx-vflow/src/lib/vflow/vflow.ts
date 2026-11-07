import {
  VflowNoDragDirective,
  VflowNoPanDirective,
  VflowNoWheelDirective,
  VflowNoKeyboardDirective,
  VflowNoSelectDirective,
} from './public-directives/gesture-exclusions.directive';
import { VflowComponent } from './components/vflow/vflow.component';

import { VflowDragHandleDirective } from './public-directives/drag-handle.directive';
import { VflowEdgeInteractionAreaDirective } from './public-directives/edge-interaction-area.directive';
import {
  VflowConnectionTemplateDirective,
  VflowEdgeLabelTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowMarkerTemplateDirective,
  VflowNodeTemplateDirective,
} from './public-directives/template.directive';

import { VflowMinimapComponent } from './public-components/minimap/minimap.component';
import { VflowNodeToolbarComponent } from './public-components/node-toolbar/node-toolbar.component';
import { VflowResizableComponent } from './public-components/resizable/resizable.component';
import { VflowHandleDirective } from './public-directives/handle.directive';

export const Vflow = [
  VflowNoKeyboardDirective,
  VflowNoDragDirective,
  VflowNoPanDirective,
  VflowNoWheelDirective,
  VflowNoSelectDirective,
  VflowComponent,
  VflowHandleDirective,
  VflowResizableComponent,
  VflowEdgeInteractionAreaDirective,
  VflowMinimapComponent,
  VflowNodeToolbarComponent,
  VflowDragHandleDirective,

  VflowNodeTemplateDirective,
  VflowEdgeLabelTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowConnectionTemplateDirective,
  VflowMarkerTemplateDirective,
] as const;
