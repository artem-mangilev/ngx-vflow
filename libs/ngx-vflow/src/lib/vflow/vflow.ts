import {
  VflowNoDragDirective,
  VflowNoPanDirective,
  VflowNoWheelDirective,
  VflowNoKeyboardDirective,
  VflowNoSelectDirective,
} from './public-directives/gesture-exclusions.directive';
import { VflowComponent } from './components/vflow/vflow.component';

import { VflowDragHandleDirective } from './public-directives/drag-handle.directive';
import { VflowEdgeInteractionDirective } from './public-directives/edge-interaction.directive';
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
  VflowEdgeInteractionDirective,
  VflowMinimapComponent,
  VflowNodeToolbarComponent,
  VflowDragHandleDirective,

  VflowNodeTemplateDirective,
  VflowEdgeLabelTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowConnectionTemplateDirective,
  VflowMarkerTemplateDirective,
] as const;
