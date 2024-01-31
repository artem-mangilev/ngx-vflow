import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { NodeComponent } from './components/node/node.component';
import { MapContextDirective } from './directives/map-context.directive';
import { EdgeComponent } from './components/edge/edge.component';
import { NodeHtmlTemplateDirective } from './directives/node-html.template.directive';
import { EdgeLabelHtmlTemplateDirective } from './directives/edge-label-html.template.directive';

const components = [
  VflowComponent,
  NodeComponent,
  EdgeComponent
]

const directives = [
  MapContextDirective,
  NodeHtmlTemplateDirective,
  EdgeLabelHtmlTemplateDirective
]

@NgModule({
  imports: [CommonModule],
  exports: [
    VflowComponent,
    NodeHtmlTemplateDirective,
    EdgeLabelHtmlTemplateDirective
  ],
  declarations: [...components, ...directives],
  providers: [],
})
export class VflowModule { }
