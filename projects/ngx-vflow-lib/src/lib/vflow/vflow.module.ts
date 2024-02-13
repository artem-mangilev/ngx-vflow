import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { NodeComponent } from './components/node/node.component';
import { MapContextDirective } from './directives/map-context.directive';
import { EdgeComponent } from './components/edge/edge.component';
import { EdgeLabelComponent } from './components/edge-label/edge-label.component';
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, NodeHtmlTemplateDirective } from './directives/template.directive';
import { ConnectionComponent } from './components/connection/connection.component';
import { SpacePointContextDirective } from './directives/space-point-context.directive';
import { RootSvgReferenceDirective } from './directives/reference.directive';
import { RootSvgContextDirective } from './directives/root-svg-context.directive';

const components = [
  VflowComponent,
  NodeComponent,
  EdgeComponent,
  EdgeLabelComponent,
  ConnectionComponent
]

const directives = [
  SpacePointContextDirective,
  MapContextDirective,
  RootSvgReferenceDirective,
  RootSvgContextDirective,
  // TEMPLATES
  NodeHtmlTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  ConnectionTemplateDirective,
]

@NgModule({
  imports: [CommonModule],
  exports: [
    VflowComponent,
    NodeHtmlTemplateDirective,
    EdgeLabelHtmlTemplateDirective,
    EdgeTemplateDirective,
  ],
  declarations: [...components, ...directives],
})
export class VflowModule { }
