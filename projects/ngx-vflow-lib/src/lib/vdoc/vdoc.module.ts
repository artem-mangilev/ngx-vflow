import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VDocRootComponent } from './components/vdoc-root/vdoc-root.component';
import { VDocContainerComponent } from './components/vdoc-block/vdoc-container.component';
import { VDocHtmlComponent } from './components/vdoc-html/vdoc-html.component';
import { LetDirective } from './directives/let.directive';
import { VDocImageComponent } from './components/vdoc-image/vdoc-image.component';

const components = [
  VDocRootComponent,
  VDocContainerComponent,
  VDocHtmlComponent,
  VDocImageComponent
]

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [...components],
  declarations: [...components, LetDirective],
  providers: [],
})
export class VDocModule { }
