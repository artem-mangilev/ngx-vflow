import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit, forwardRef, inject } from '@angular/core';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { RootViewModel } from '../../view-models/root.view-model';
import { RootStyleSheet } from '../../interfaces/stylesheet.interface';

@Component({
  selector: 'svg[vdoc-root]',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: VDocViewComponent, useExisting: forwardRef(() => VDocRootComponent) },
    VDocTreeBuilderService
  ]
})
export class VDocRootComponent extends VDocViewComponent implements OnInit, AfterContentInit {
  @Input()
  public styleSheet!: RootStyleSheet

  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height
  }

  protected model!: RootViewModel

  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.model = this.createModel()
  }

  ngAfterContentInit(): void {
    this.treeManager.root?.calculateLayout();
    this.cdr.markForCheck()
  }

  protected modelFactory(): RootViewModel {
    return new RootViewModel(this, this.styleSheet);
  }
}
