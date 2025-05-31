import { CustomTemplateEdgeMockComponent } from './component-mocks/custom-template-edge-mock.component';
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
  GroupNodeTemplateMockDirective,
  HandleTemplateMockDirective,
  NodeHtmlTemplateMockDirective,
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
  CustomTemplateEdgeMockComponent,

  NodeHtmlTemplateMockDirective,
  GroupNodeTemplateMockDirective,
  EdgeLabelHtmlTemplateMockDirective,
  EdgeTemplateMockDirective,
  ConnectionTemplateMockDirective,
  HandleTemplateMockDirective,
] as const;
