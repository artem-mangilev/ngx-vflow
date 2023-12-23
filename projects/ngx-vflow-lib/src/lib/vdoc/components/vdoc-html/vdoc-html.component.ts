import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { HtmlStyleSheet } from '../../interfaces/stylesheet.interface';
import { HtmlViewModel } from '../../view-models/html.view-model';
import { provideComponent } from '../../utils/provide-component';

@Component({
  selector: 'foreignObject[vdoc-html]',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocHtmlComponent)],
})
export class VDocHtmlComponent extends VDocViewComponent<HtmlViewModel> implements OnInit, OnDestroy {
  @Input()
  public styleSheet: HtmlStyleSheet = {}

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

  private host = inject<ElementRef<SVGForeignObjectElement>>(ElementRef)
  private zone = inject(NgZone)

  private resizeObserver!: ResizeObserver;

  public override ngOnInit(): void {
    super.ngOnInit()

    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.zone.run(() => {
        this.model.setHeight(entry.contentRect.height);

        // TODO see how to avoid recalculation whole layout
        this.treeManager.calculateLayout();
      })
    })

    this.resizeObserver.observe(this.host.nativeElement.firstElementChild!)
  }

  public ngOnDestroy(): void {
    this.resizeObserver.disconnect()
  }

  protected modelFactory(): HtmlViewModel {
    return new HtmlViewModel(this, this.styleSheet)
  }
}
