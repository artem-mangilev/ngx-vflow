import { VflowHandleMockDirective } from './directive-mocks/handle-mock.directive';
import { VflowMinimapMockComponent } from './component-mocks/minimap-mock.component';
import { VflowNodeToolbarMockComponent } from './component-mocks/node-toolbar-mock.component';
import { VflowResizableMockComponent } from './component-mocks/resizable-mock.component';
import { VflowMockComponent } from './component-mocks/vflow-mock.component';
import { VflowDragHandleMockDirective } from './directive-mocks/drag-handle-mock.directive';
import { VflowSelectableMockDirective } from './directive-mocks/selectable-mock.directive';
import { VflowEdgeInteractionMockDirective } from './directive-mocks/edge-interaction-mock.directive';
import {
  VflowConnectionTemplateMockDirective,
  VflowEdgeLabelTemplateMockDirective,
  VflowEdgeTemplateMockDirective,
  VflowMarkerTemplateMockDirective,
  VflowNodeTemplateMockDirective,
} from './directive-mocks/template-mock.directive';

export const VflowMocks = [
  VflowMockComponent,
  VflowHandleMockDirective,
  VflowResizableMockComponent,
  VflowSelectableMockDirective,
  VflowEdgeInteractionMockDirective,
  VflowMinimapMockComponent,
  VflowNodeToolbarMockComponent,
  VflowDragHandleMockDirective,

  VflowNodeTemplateMockDirective,
  VflowEdgeLabelTemplateMockDirective,
  VflowEdgeTemplateMockDirective,
  VflowConnectionTemplateMockDirective,
  VflowMarkerTemplateMockDirective,
] as const;
