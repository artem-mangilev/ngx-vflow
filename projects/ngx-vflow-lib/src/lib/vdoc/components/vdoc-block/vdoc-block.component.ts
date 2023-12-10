import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { BlockStyleSheet } from '../../interfaces/stylesheet.interface';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { BlockViewModel } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';

@Component({
  selector: 'svg[vdoc-block]',
  template: `
    <svg:rect
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
export class VDocBlockComponent implements OnInit {
  @Input()
  public styleSheet!: BlockStyleSheet

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

  private treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)

  constructor(@SkipSelf() @Optional() private parent: VDocViewComponent) {
    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  ngOnInit(): void {
    this.model = this.createModel();

    this.fillColor = this.styleSheet.backgroundColor
    this.radiusX = this.styleSheet.borderRadius
  }

  createModel() {
    const model = new BlockViewModel(this, this.styleSheet)

    // every vdoc-block must have parent (vdoc-root or other views)
    const parent = this.treeManager.getByComponent(this.parent)
    model.parent = parent;
    parent.children.push(model)

    this.treeManager.register(model)

    return model
  }
}
