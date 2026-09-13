import { CustomEdgeMockComponent } from './component-mocks/custom-edge-mock.component';
import { HandleMockComponent } from './component-mocks/handle-mock.component';
import { MiniMapMockComponent } from './component-mocks/minimap-mock.component';
import { NodeToolbarMockComponent } from './component-mocks/node-toolbar-mock.component';
import { ResizableMockComponent } from './component-mocks/resizable-mock.component';
import { VflowMockComponent } from './component-mocks/vflow-mock.component';
import { ConnectionControllerMockDirective } from './directive-mocks/connection-controller-mock.directive';
import { DragHandleMockDirective } from './directive-mocks/drag-handle-mock.directive';
import { SelectableMockDirective } from './directive-mocks/selectable-mock.directive';
import {
  ConnectionTemplateMockDirective,
  EdgeLabelHtmlTemplateMockDirective,
  EdgeTemplateMockDirective,
  HandleTemplateMockDirective,
  NodeTemplateMockDirective,
} from './directive-mocks/template-mock.directive';

export const VflowMocks = [
  VflowMockComponent,
  HandleMockComponent,
  ResizableMockComponent,
  SelectableMockDirective,
  MiniMapMockComponent,
  NodeToolbarMockComponent,
  DragHandleMockDirective,
  ConnectionControllerMockDirective,
  CustomEdgeMockComponent,

  NodeTemplateMockDirective,
  EdgeLabelHtmlTemplateMockDirective,
  EdgeTemplateMockDirective,
  ConnectionTemplateMockDirective,
  HandleTemplateMockDirective,
] as const;
