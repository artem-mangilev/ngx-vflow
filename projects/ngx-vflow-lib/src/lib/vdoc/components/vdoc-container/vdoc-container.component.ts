import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { BlockViewModel, BlockEvent } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel } from '../../view-models/container.view-model';
import { provideComponent } from '../../utils/provide-component';

@Component({
  selector: 'svg[vdoc-container]',
  template: `
    <svg:filter *ngIf="model.filter" id="shadow" color-interpolation-filters="sRGB">
      <feDropShadow
        [attr.dx]="model.filter.hOffset"
        [attr.dy]="model.filter.vOffset"
        [attr.stdDeviation]="model.filter.blur"
        [attr.flood-color]="model.filter.color"
      />
    </svg:filter>

    <svg:rect
        *ngLet="model.viewUpdate$ | async"
        [attr.width]="model.contentWidth"
        [attr.height]="model.contentHeight"
        [attr.x]="model.contentX"
        [attr.y]="model.contentY"
        [attr.rx]="model.borderRadius"
        [attr.fill]="model.backgroundColor"
        [attr.stroke]="model.borderColor"
        [attr.stroke-width]="model.borderWidth"
        [style.filter]="'url(#shadow)'"
    ></svg:rect>
    <ng-content></ng-content>
  `,
  styles: [`
    :host {
      overflow: visible;
    }

    :host:focus {
      outline: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocContainerComponent)]
})
export class VDocContainerComponent extends VDocViewComponent<ContainerViewModel> implements OnInit, OnDestroy {
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

  @HostBinding('style.filter')
  protected get filterStyle() {
    return this.model.filter
  }

  constructor() {
    super()

    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  public ngOnDestroy(): void {
    this.model.destroy()
  }

  @HostListener('mouseover')
  protected onMouseOver() {
    this.model.triggerBlockEvent(BlockEvent.hoverIn)
  }

  @HostListener('mouseout')
  protected onMouseOut() {
    this.model.triggerBlockEvent(BlockEvent.hoverOut)
  }

  @HostListener('focus')
  protected onFocus() {
    this.model.triggerBlockEvent(BlockEvent.focusIn)
  }

  @HostListener('blur')
  protected onBlur() {
    this.model.triggerBlockEvent(BlockEvent.focusOut)
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
  }
}
