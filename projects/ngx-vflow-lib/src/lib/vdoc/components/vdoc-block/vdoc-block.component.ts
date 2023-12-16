import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { ContainerStyleSheet } from '../../interfaces/stylesheet.interface';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { BlockViewModel } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { ContainerViewModel } from '../../view-models/container.view-model';
import { AnyViewModel } from '../../view-models/any.view-model';

@Component({
  selector: 'svg[vdoc-block]',
  template: `
    <svg:rect
        *ngLet="model.viewUpdate$ | async"
        [attr.width]="width"
        [attr.height]="height"
        [attr.rx]="radiusX"
        [attr.fill]="fillColor"
    ></svg:rect>
    <ng-content></ng-content>
  `,
  styleUrls: ['./vdoc-block.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: VDocViewComponent, useExisting: forwardRef(() => VDocBlockComponent) }]
})
export class VDocBlockComponent extends VDocViewComponent implements OnInit {
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

  protected get width() {
    return this.model.width
  }

  protected get height() {
    return this.model.height
  }

  protected radiusX = 0
  protected fillColor = ''

  protected model!: BlockViewModel

  constructor(@SkipSelf() @Optional() protected parent: VDocViewComponent) {
    super()

    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  ngOnInit(): void {
    this.model = this.createModel();

    this.fillColor = this.styleSheet.backgroundColor
    this.radiusX = this.styleSheet.borderRadius
  }

  protected modelFactory(): ContainerViewModel {
    return new ContainerViewModel(this, this.styleSheet)
  }
}
