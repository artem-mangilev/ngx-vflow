import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { BlockViewModel } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel, PseudoEvent } from '../../view-models/container.view-model';
import { provideComponent } from '../../utils/provide-component';

@Component({
  selector: 'svg[vdoc-container]',
  template: `
    <svg:rect
        *ngLet="model.viewUpdate$ | async"
        [attr.width]="model.contentWidth"
        [attr.height]="model.contentHeight"
        [attr.x]="model.contentX"
        [attr.y]="model.contentY"
        [attr.rx]="styleSheet.borderRadius"
        [attr.fill]="styleSheet.backgroundColor"
        [attr.stroke]="model.borderColor"
        [attr.stroke-width]="styleSheet.borderWidth"
    ></svg:rect>
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocContainerComponent)]
})
export class VDocContainerComponent extends VDocViewComponent<ContainerViewModel> implements OnInit {
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

  constructor() {
    super()

    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  @HostListener('mouseover')
  protected onMouseOver() {
    this.model.triggerPseudoEvent(PseudoEvent.hoverIn)
  }

  @HostListener('mouseout')
  protected onMouseOut() {
    this.model.triggerPseudoEvent(PseudoEvent.hoverOut)
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
  }
}
