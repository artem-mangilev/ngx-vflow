import { VflowComponent } from "./components/vflow/vflow.component";
import { DragHandleDirective } from "./directives/drag-handle.directive";
import { SelectableDirective } from "./directives/selectable.directive";
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, GroupNodeTemplateDirective, HandleTemplateDirective, NodeHtmlTemplateDirective } from "./directives/template.directive";
import { MiniMapComponent } from "./public-components/minimap/minimap.component";
import { NodeToolbarComponent } from "./public-components/node-toolbar/node-toolbar.component";
import { ResizableComponent } from "./public-components/resizable/resizable.component";
import { HandleComponent } from "./public-components/handle/handle.component";

export const Vflow = [
  VflowComponent,
  HandleComponent,
  ResizableComponent,
  SelectableDirective,
  MiniMapComponent,
  NodeToolbarComponent,
  DragHandleDirective,

  NodeHtmlTemplateDirective,
  GroupNodeTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  ConnectionTemplateDirective,
  HandleTemplateDirective
] as const;
