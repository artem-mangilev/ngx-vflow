import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, OnInit, forwardRef, inject } from '@angular/core';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';

@Component({
  selector: 'foreignObject[vdoc-html]',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./vdoc-html.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: VDocViewComponent, useExisting: forwardRef(() => VDocHtmlComponent) }]
})
export class VDocHtmlComponent {
  @HostBinding('attr.width')
  protected hostWidth = '100%';

  @HostBinding('attr.height')
  protected hostHeight = '100%';
}
