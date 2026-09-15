import {
  NoDragDirective,
  NoPanDirective,
  NoWheelDirective,
  NoKeyboardDirective,
} from './directives/gesture-exclusions.directive';
import { VflowComponent } from './components/vflow/vflow.component';

import { DragHandleDirective } from './directives/drag-handle.directive';
import { SelectableDirective } from './directives/selectable.directive';
import { EdgeInteractionDirective } from './directives/edge-interaction.directive';
import {
  ConnectionTemplateDirective,
  EdgeLabelTemplateDirective,
  EdgeTemplateDirective,
  NodeTemplateDirective,
} from './directives/template.directive';
import { ConnectionControllerDirective } from './directives/connection-controller.directive';

import { MiniMapComponent } from './public-components/minimap/minimap.component';
import { NodeToolbarComponent } from './public-components/node-toolbar/node-toolbar.component';
import { ResizableComponent } from './public-components/resizable/resizable.component';
import { VflowHandleDirective } from './directives/handle.directive';

export const Vflow = [
  NoKeyboardDirective,
  NoDragDirective,
  NoPanDirective,
  NoWheelDirective,
  VflowComponent,
  VflowHandleDirective,
  ResizableComponent,
  SelectableDirective,
  EdgeInteractionDirective,
  MiniMapComponent,
  NodeToolbarComponent,
  DragHandleDirective,
  ConnectionControllerDirective,

  NodeTemplateDirective,
  EdgeLabelTemplateDirective,
  EdgeTemplateDirective,
  ConnectionTemplateDirective,
] as const;
