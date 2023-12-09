import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, Optional, SkipSelf, forwardRef, inject } from '@angular/core';
import { BlockStyleSheet } from '../../interfaces/stylesheet.interface';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { BlockViewModel } from '../../view-models/block.view-model';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';

@Component({
  selector: '[vdoc-block]',
  template: `
    <svg:rect
      [attr.width]="width"
      [attr.height]="height"
      [attr.x]="x"
      [attr.y]="y"
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
  protected hostWidth = 0

  @HostBinding('attr.height')
  protected hostHeight = 0

  @HostBinding('attr.x')
  protected hostX = 0

  @HostBinding('attr.y')
  protected hostY = 0

  protected width = 0
  protected height = 0
  protected x = 0
  protected y = 0
  protected radiusX = 0
  protected fillColor = ''

  private treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)

  constructor(@SkipSelf() @Optional() private parent: VDocViewComponent) {
    if (!this.parent) {
      throw new Error(`vdoc-block must not be used outside of vdoc-root`);
    }
  }

  ngOnInit(): void {
    const model = this.createModel();

    this.hostWidth = model.width
    this.width = model.width

    this.hostHeight = model.height
    this.height = model.height

    this.hostX = model.x
    this.hostY = model.y

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
