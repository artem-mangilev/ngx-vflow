import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VDocRootComponent } from './components/vdoc-root/vdoc-root.component';
import { VDocBlockComponent } from './components/vdoc-block/vdoc-block.component';
import { TreeManagerService } from './services/tree-manager.service';

const components = [
  VDocRootComponent,
  VDocBlockComponent
]

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [...components],
  declarations: [...components],
  providers: [],
})
export class VDocModule { }
