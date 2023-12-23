import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit, Optional, SkipSelf, forwardRef } from '@angular/core';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ImageViewModel } from '../../view-models/image.view-model';
import { ImageStyleSheet } from '../../interfaces/stylesheet.interface';

@Component({
  selector: 'svg[vdoc-image]',
  template: `
    <svg:image
      [attr.href]="src"
      [attr.width]="model.width"
      [attr.height]="model.height"
    ></svg:image>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: VDocViewComponent, useExisting: forwardRef(() => VDocImageComponent) }],
})
export class VDocImageComponent extends VDocViewComponent implements OnInit {
  @Input()
  public styleSheet: ImageStyleSheet = {}

  @Input()
  public src: string = ''

  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height
  }

  @HostBinding('attr.x')
  protected get hostX() {
    return this.model.x
  }

  @HostBinding('attr.y')
  protected get hostY() {
    return this.model.y
  }

  protected model!: ImageViewModel;

  ngOnInit(): void {
    this.model = this.createModel()
  }

  protected modelFactory(): ImageViewModel {
    return new ImageViewModel(this, this.styleSheet);
  }
}
