import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, Optional, Renderer2, SkipSelf, ViewChild, forwardRef, inject } from '@angular/core';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { HtmlStyleSheet } from '../../interfaces/stylesheet.interface';
import { HtmlViewModel } from './html.view-model';
import { provideComponent } from '../../utils/provide-component';
import { Subscription, tap } from 'rxjs';
import { resizable } from '../../utils/resizable';

@Component({
  selector: 'foreignObject[vdoc-html]',
  template: `
    <div #wrapper>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocHtmlComponent)],
})
export class VDocHtmlComponent extends VDocViewComponent<HtmlViewModel, HtmlStyleSheet> implements OnInit {
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

  /**
   * wrapper exists for cases where used passes 0 or 2+ elements,
   * so we need to conviniently wrap them into single element
   */
  @ViewChild('wrapper', { static: true })
  protected wrapperRef!: ElementRef<HTMLDivElement>

  private zone = inject(NgZone)

  public override ngOnInit(): void {
    super.ngOnInit()

    // TODO research how to remove this call
    // this call avoids multiple emits of resizable and flickering of view
    this.treeManager.calculateLayout()

    this.subscription.add(
      resizable(this.wrapperRef.nativeElement, this.zone)
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

  protected modelFactory(): HtmlViewModel {
    return new HtmlViewModel(this.styleSheet)
  }

  protected defaultStyleSheet(): HtmlStyleSheet {
    return {}
  }
}

