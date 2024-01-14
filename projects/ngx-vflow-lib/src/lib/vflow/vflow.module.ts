import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VflowComponent } from './components/vflow/vflow.component';

const components = [
  VflowComponent
]

@NgModule({
  imports: [CommonModule],
  exports: [VflowComponent],
  declarations: [...components],
  providers: [],
})
export class VflowModule { }
