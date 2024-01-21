import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { NodeComponent } from './components/node/node.component';
import { MapContextDirective } from './directives/map-context.directive';

const components = [
  VflowComponent,
  NodeComponent
]

const directives = [
  MapContextDirective,
]

@NgModule({
  imports: [CommonModule],
  exports: [VflowComponent],
  declarations: [...components, ...directives],
  providers: [],
})
export class VflowModule { }
