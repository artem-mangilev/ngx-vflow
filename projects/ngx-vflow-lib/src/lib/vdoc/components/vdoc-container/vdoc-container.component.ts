import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Optional, SkipSelf, ViewChild, computed, forwardRef, inject } from '@angular/core';
import { AnimationProperty, ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { BlockViewModel, BlockEvent } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel } from '../../view-models/container.view-model';
import { provideComponent } from '../../utils/provide-component';
import { FilterService } from '../../../shared/services/filter.service';

@Component({
  selector: 'svg[vdoc-container]',
  template: `
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
        [style.filter]="shadowUrl()"
    >
      <svg:animate
        *ngIf="styleSheet.animation as animation"
        #animate
        [attr.attributeName]="getAttrName(animation.property)"
        [attr.from]="animation.from"
        [attr.to]="animation.to"
        [attr.dur]="animation.duration + 'ms'"
        fill="freeze"
        begin="indefinite"
      ></svg:animate>

      <svg:animate
        *ngIf="styleSheet.onHover?.animation as animation"
        #animate
        [attr.attributeName]="getAttrName(animation.property)"
        [attr.from]="animation.from"
        [attr.to]="animation.to"
        [attr.dur]="animation.duration + 'ms'"
        fill="freeze"
        begin="indefinite"
      ></svg:animate>

      <svg:animate
        *ngIf="styleSheet.onFocus?.animation as animation"
        #animate
        [attr.attributeName]="getAttrName(animation.property)"
        [attr.from]="animation.from"
        [attr.to]="animation.to"
        [attr.dur]="animation.duration + 'ms'"
        fill="freeze"
        begin="indefinite"
      ></svg:animate>
    </svg:rect>
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

  @ViewChild('animate')
  private animateElementRef?: ElementRef<SVGAnimateElement>

  protected shadowUrl = computed(() => {
    const filter = this.model.filter()
    if (filter) {
      const shadowIdSignal = this.filterService.getShadowId(filter)

      return `url(#${shadowIdSignal()})`
    }

    return null
  })

  protected filterService = inject(FilterService);

  constructor() {
    super()

    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  public override ngOnInit(): void {
    super.ngOnInit()

    this.registerShadows()
  }

  public ngOnDestroy(): void {
    this.model.destroy()
  }

  @HostListener('mouseover')
  protected onMouseOver() {
    this.model.triggerBlockEvent(BlockEvent.hoverIn)

    if (this.animateElementRef && this.styleSheet.onHover?.animation) {
      this.animateElementRef.nativeElement.beginElement()
    }
  }

  @HostListener('mouseout')
  protected onMouseOut() {
    this.model.triggerBlockEvent(BlockEvent.hoverOut)
  }

  @HostListener('focus')
  protected onFocus() {
    this.model.triggerBlockEvent(BlockEvent.focusIn)

    if (this.animateElementRef && this.styleSheet.onFocus?.animation) {
      this.animateElementRef.nativeElement.beginElement()
    }
  }

  @HostListener('blur')
  protected onBlur() {
    this.model.triggerBlockEvent(BlockEvent.focusOut)
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
  }

  protected getAttrName(property: AnimationProperty) {
    const map: { [key in AnimationProperty]: string } = {
      'borderRadius': 'rx'
    }

    return map[property]
  }

  private registerShadows() {
    const shadows = [
      this.styleSheet.boxShadow,
      this.styleSheet.onHover?.boxShadow,
      this.styleSheet.onFocus?.boxShadow,
    ]

    for (const shadow of shadows) {
      if (shadow) {
        this.filterService.addShadow(shadow)
      }
    }
  }
}
