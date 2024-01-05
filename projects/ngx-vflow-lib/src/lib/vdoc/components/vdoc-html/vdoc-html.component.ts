import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { HtmlStyleSheet } from '../../interfaces/stylesheet.interface';
import { HtmlViewModel } from '../../view-models/html.view-model';
import { provideComponent } from '../../utils/provide-component';
import { Subscription, tap } from 'rxjs';
import { resizable } from '../../utils/resizable';

@Component({
  selector: 'foreignObject[vdoc-html]',
  template: `
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocHtmlComponent)],
})
export class VDocHtmlComponent extends VDocViewComponent<HtmlViewModel> implements OnInit, OnDestroy {
  @Input()
  public styleSheet: HtmlStyleSheet = {}

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

  private host = inject<ElementRef<SVGForeignObjectElement>>(ElementRef)
  private zone = inject(NgZone)

  private subscription = new Subscription()

  public override ngOnInit(): void {
    super.ngOnInit()

    // TODO research how to remove this call
    // this call avoids multiple emits of resizable and flickering of view
    this.treeManager.calculateLayout()

    const firstChild = this.host.nativeElement.firstElementChild!
    this.subscription.add(
      resizable(firstChild, this.zone)
        .pipe(
          tap((entry) => {
            const [box] = entry.borderBoxSize
            this.model.setHeight(box.blockSize)

            // TODO research how to avoid needless calls
            this.treeManager.calculateLayout()
          })
        )
        .subscribe()
    )
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  protected modelFactory(): HtmlViewModel {
    return new HtmlViewModel(this, this.styleSheet)
  }
}

