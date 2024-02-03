import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { NodeComponent } from './components/node/node.component';
import { MapContextDirective } from './directives/map-context.directive';
import { EdgeComponent } from './components/edge/edge.component';
import { EdgeLabelComponent } from './components/edge-label/edge-label.component';
import { EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, NodeHtmlTemplateDirective } from './directives/template.directive';

const components = [
  VflowComponent,
  NodeComponent,
  EdgeComponent,
  EdgeLabelComponent
]

const directives = [
  MapContextDirective,
  NodeHtmlTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
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
