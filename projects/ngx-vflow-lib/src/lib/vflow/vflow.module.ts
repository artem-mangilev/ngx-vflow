import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { NodeComponent } from './components/node/node.component';
import { MapContextDirective } from './directives/map-context.directive';
import { EdgeComponent } from './components/edge/edge.component';
import { EdgeLabelComponent } from './components/edge-label/edge-label.component';
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, GroupNodeTemplateDirective, HandleTemplateDirective, NodeHtmlTemplateDirective } from './directives/template.directive';
import { ConnectionComponent } from './components/connection/connection.component';
import { SpacePointContextDirective } from './directives/space-point-context.directive';
import { RootSvgReferenceDirective } from './directives/reference.directive';
import { RootSvgContextDirective } from './directives/root-svg-context.directive';
import { DefsComponent } from './components/defs/defs.component';
import { HandleComponent } from './components/handle/handle.component';
import { HandleSizeControllerDirective } from './directives/handle-size-controller.directive';
import { SelectableDirective } from './directives/selectable.directive';
import { PointerDirective } from './directives/pointer.directive';
import { RootPointerDirective } from './directives/root-pointer.directive';
import { BackgroundComponent } from './components/background/background.component';
import { FlowSizeControllerDirective } from './directives/flow-size-controller.directive';
import { ResizableComponent } from './public-components/resizable/resizable.component';
import { MiniMapComponent } from './public-components/minimap/minimap.component';
import { DefaultNodeComponent } from './components/default-node/default-node.component';

const components = [
  VflowComponent,
  NodeComponent,
  DefaultNodeComponent,
  EdgeComponent,
  EdgeLabelComponent,
  ConnectionComponent,
  HandleComponent,
  DefsComponent,
  BackgroundComponent,
  ResizableComponent,
  MiniMapComponent
]

const directives = [
  SpacePointContextDirective,
  MapContextDirective,
  RootSvgReferenceDirective,
  RootSvgContextDirective,
  HandleSizeControllerDirective,
  SelectableDirective,
  PointerDirective,
  RootPointerDirective,
  FlowSizeControllerDirective,
]

const templateDirectives = [
  NodeHtmlTemplateDirective,
  GroupNodeTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  ConnectionTemplateDirective,
  HandleTemplateDirective
]

@NgModule({
  imports: [CommonModule],
  exports: [
    VflowComponent,
    HandleComponent,
    ResizableComponent,
    SelectableDirective,
    MiniMapComponent,
    ...templateDirectives
  ],
  declarations: [...components, ...directives, ...templateDirectives],
})
export class VflowModule { }
