import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VDocRootComponent } from './components/vdoc-root/vdoc-root.component';
import { VDocContainerComponent } from './components/vdoc-container/vdoc-container.component';
import { VDocHtmlComponent } from './components/vdoc-html/vdoc-html.component';
import { LetDirective } from './directives/let.directive';
import { VDocImageComponent } from './components/vdoc-image/vdoc-image.component';
import { FilterService } from '../shared/services/filter.service';
import { AnimationComponent } from './components/animation/animation.component';

const components = [
  VDocRootComponent,
  VDocContainerComponent,
  VDocHtmlComponent,
  VDocImageComponent,
  AnimationComponent
]

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [...components],
  declarations: [...components, LetDirective],
  providers: [FilterService],
})
export class VDocModule { }
