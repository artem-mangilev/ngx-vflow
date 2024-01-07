import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, HostListener, Input, OnChanges, OnDestroy, OnInit, Optional, QueryList, SimpleChanges, SkipSelf, ViewChild, ViewChildren, computed, forwardRef, inject, runInInjectionContext } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { BlockEvent } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel } from '../../view-models/container.view-model';
import { provideComponent } from '../../utils/provide-component';
import { FilterService } from '../../../shared/services/filter.service';
import { uuid } from '../../../shared/utils/uuid';
import { AnimationGroupComponent } from '../animation-group/animation-group.component';
import { uiChange$ } from '../../utils/ui-change';
import { merge, of, pairwise, switchMap, tap } from 'rxjs';

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
export class VDocContainerComponent extends VDocViewComponent<ContainerViewModel, ContainerStyleSheet> implements OnInit, AfterViewInit, OnDestroy {
  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width()
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height()
  }

  @HostBinding('attr.x')
  protected get hostX() {
    return this.model.x()
  }

  @HostBinding('attr.y')
  protected get hostY() {
    return this.model.y()
  }

  @HostBinding('style.filter')
  protected get filterStyle() {
    return this.model.filter()
  }

  @ViewChildren('animation')
  private animationComponentList!: QueryList<AnimationGroupComponent>

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

    this.registerShadow()
  }

  public ngAfterViewInit(): void {
    // handle prop changes
    this.subscription.add(
      uiChange$(this.hostRef.nativeElement)
        .pipe(
          tap((snapshot) => this.uiSnapshot.set(snapshot))
        )
        .subscribe()
    )

    // to prevent O(n^2) traverse
    const animationsBySelector = animationGroupHash(this.animationComponentList.toArray())
    // handle animations
    this.subscription.add(
      uiChange$(this.hostRef.nativeElement)
        .pipe(
          pairwise(),
          tap(([oldSnapshot, newSnapshot]) => {
            // compare new shot and old. if old has no selector that appears in new then we should start animations
            newSnapshot.classes.forEach(c => {
              if (!oldSnapshot.classes.has(c)) animationsBySelector[c]?.begin()
            })

            // on the other hand we check if class is dissapear compared to old snapshot, so it's a sign to run back animation
            oldSnapshot.classes.forEach(c => {
              if (!newSnapshot.classes.has(c)) animationsBySelector[c]?.reverse()
            })
          }),
        )
        .subscribe()
    )
  }

  public ngOnDestroy(): void {
    this.model.destroy()
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
  }

  protected defaultStyleSheet(): ContainerStyleSheet {
    return {}
  }

  private registerShadow() {
    const shadow = this.styleSheet.boxShadow
    if (shadow && shadow()) {
      this.filterService.addShadow(shadow()!)
    }
  }
}

// TODO create general solution in utils
function animationGroupHash(groups: AnimationGroupComponent[]) {
  let animationsBySelector: { [selector: string]: AnimationGroupComponent } = {}
  for (const g of groups) {
    animationsBySelector[g.selector] = g
  }

  return animationsBySelector
}
