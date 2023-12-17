import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { HtmlStyleSheet } from '../../interfaces/stylesheet.interface';
import { HtmlViewModel } from '../../view-models/html.view-model';

@Component({
  selector: 'foreignObject[vdoc-html]',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: VDocViewComponent, useExisting: forwardRef(() => VDocHtmlComponent) }],
})
export class VDocHtmlComponent extends VDocViewComponent implements OnInit, OnDestroy {
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

  protected model!: HtmlViewModel;

  private host: ElementRef<SVGForeignObjectElement> = inject(ElementRef)

  private resizeObserver!: ResizeObserver;

  constructor(
    @SkipSelf() @Optional() protected parent: VDocViewComponent,
    private zone: NgZone
  ) {
    super()
  }

  ngOnInit(): void {
    this.model = this.createModel();

    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.zone.run(() => {
        this.model.setHeight(entry.contentRect.height);

        // TODO see how to avoid recalculation whole layout
        this.treeManager.calculateLayout();
      })
    })

    this.resizeObserver.observe(this.host.nativeElement.firstElementChild!)
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect()
  }

  protected modelFactory(): HtmlViewModel {
    return new HtmlViewModel(this, this.styleSheet)
  }
}
