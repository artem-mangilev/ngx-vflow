import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { NodeComponent } from './components/node/node.component';
import { MapContextDirective } from './directives/map-context.directive';
import { EdgeComponent } from './components/edge/edge.component';
import { EdgeLabelComponent } from './components/edge-label/edge-label.component';
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, HandleTemplateDirective, NodeHtmlTemplateDirective } from './directives/template.directive';
import { ConnectionComponent } from './components/connection/connection.component';
import { SpacePointContextDirective } from './directives/space-point-context.directive';
import { RootSvgReferenceDirective } from './directives/reference.directive';
import { RootSvgContextDirective } from './directives/root-svg-context.directive';
import { DefsComponent } from './components/defs/defs.component';
import { HandleComponent } from './components/handle/handle.component';
import { HandleSizeControllerDirective } from './directives/handle-size-controller.directive';
import { SelectableDirective } from './directives/selectable.directive';
import { PointerDirective } from './directives/pointer.directive';

const components = [
  VflowComponent,
  NodeComponent,
  EdgeComponent,
  EdgeLabelComponent,
  ConnectionComponent,
  HandleComponent,
  DefsComponent
]

const directives = [
  SpacePointContextDirective,
  MapContextDirective,
  RootSvgReferenceDirective,
  RootSvgContextDirective,
  HandleSizeControllerDirective,
  SelectableDirective,
  PointerDirective
]

const templateDirectives = [
  NodeHtmlTemplateDirective,
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
    SelectableDirective,
    ...templateDirectives
  ],
  declarations: [...components, ...directives, ...templateDirectives],
})
export class VflowModule { }
