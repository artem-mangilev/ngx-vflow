import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';
import { DraggableContextDirective } from './directives/draggable-context.directive';
import { NodeComponent } from './components/node/node.component';

const components = [
  VflowComponent,
  NodeComponent
]

const directives = [
  DraggableContextDirective
]

@NgModule({
  imports: [CommonModule],
  exports: [VflowComponent],
  declarations: [...components, ...directives],
  providers: [],
})
export class VflowModule { }
