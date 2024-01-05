import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit, Optional, SimpleChanges, SkipSelf, ViewChild, computed, forwardRef, inject } from '@angular/core';
import { ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { BlockEvent } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel } from '../../view-models/container.view-model';
import { provideComponent } from '../../utils/provide-component';
import { FilterService } from '../../../shared/services/filter.service';
import { uuid } from '../../../shared/utils/uuid';
import { AnimationGroupComponent } from '../animation-group/animation-group.component';
import { classChange } from '../../utils/class-change';
import { tap } from 'rxjs';

@Component({
  selector: 'svg[vdoc-container]',
  templateUrl: './vdoc-container.component.html',
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
export class VDocContainerComponent extends VDocViewComponent<ContainerViewModel> implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public styleSheet!: ContainerStyleSheet

  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width()
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

  @ViewChild('animation')
  private animationComponent?: AnimationGroupComponent

  @ViewChild('hoverAnimation')
  private hoverAnimationComponent?: AnimationGroupComponent

  @ViewChild('focusAnimation')
  private focusAnimationComponent?: AnimationGroupComponent

  protected shadowUrl = computed(() => {
    const filter = this.model.filter()
    if (filter) {
      const shadowIdSignal = this.filterService.getShadowId(filter)

      return `url(#${shadowIdSignal()})`
    }

    return null
  })

  protected id = uuid()

  protected filterService = inject(FilterService);

  private hostRef = inject<ElementRef<Element>>(ElementRef)

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

  public ngAfterViewInit(): void {
    this.animationComponent?.begin({ reverseOnceComplete: true })

    // classChange(this.hostRef.nativeElement).pipe(
    //   tap((classList: string[]) => {
    //     for (const [className] of this.styleSheet.onClass!) {
    //       // first matched class has higher priority
    //       if (classList.includes(className)) {
    //         this.model.triggerBlockEvent(BlockEvent.dynamicStyleAdded, className)

    //         return
    //       }
    //     }

    //     // if there are no added classes, notify that class deleted
    //     this.model.triggerBlockEvent(BlockEvent.dynamicStyleDeleted)

    //   })
    // ).subscribe()
  }

  public ngOnDestroy(): void {
    this.model.destroy()
  }

  @HostListener('mouseenter')
  protected onMouseOver() {
    this.model.triggerBlockEvent(BlockEvent.hoverIn)

    this.hoverAnimationComponent?.begin()
  }

  @HostListener('mouseleave')
  protected onMouseOut() {
    this.model.triggerBlockEvent(BlockEvent.hoverOut)

    this.hoverAnimationComponent?.reverse()
  }

  @HostListener('focus')
  protected onFocus() {
    this.model.triggerBlockEvent(BlockEvent.focusIn)

    this.focusAnimationComponent?.begin()
  }

  @HostListener('blur')
  protected onBlur() {
    this.model.triggerBlockEvent(BlockEvent.focusOut)

    this.focusAnimationComponent?.reverse()
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
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
