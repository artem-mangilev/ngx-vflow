import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { BlockViewModel } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel } from '../../view-models/container.view-model';

@Component({
  selector: 'svg[vdoc-container]',
  template: `
    <svg:rect
        *ngLet="model.viewUpdate$ | async"
        [attr.width]="model.width"
        [attr.height]="model.height"
        [attr.rx]="styleSheet.borderRadius"
        [attr.fill]="styleSheet.backgroundColor"
        [attr.stroke]="styleSheet.borderColor"
        [attr.stroke-width]="styleSheet.borderWidth"
    ></svg:rect>
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: VDocViewComponent, useExisting: forwardRef(() => VDocContainerComponent) }]
})
export class VDocContainerComponent extends VDocViewComponent implements OnInit {
  @Input()
  public styleSheet!: ContainerStyleSheet

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

  protected model!: ContainerViewModel

  constructor(@SkipSelf() @Optional() protected parent: VDocViewComponent) {
    super()

    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  ngOnInit(): void {
    this.model = this.createModel();
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
  }
}
