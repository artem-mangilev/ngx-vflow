import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit, forwardRef, inject } from '@angular/core';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { RootViewModel } from '../../view-models/root.view-model';
import { RootStyleSheet } from '../../interfaces/stylesheet.interface';

@Component({
  selector: '[vdoc-root]',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./vdoc-root.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: VDocViewComponent, useExisting: forwardRef(() => VDocRootComponent) },
    VDocTreeBuilderService
  ]
})
export class VDocRootComponent implements OnInit, AfterContentInit {
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

  private treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)

  private model!: RootViewModel

  ngOnInit(): void {
    this.model = new RootViewModel(this, this.styleSheet)
    this.treeManager.register(this.model)
  }

  ngAfterContentInit(): void {
    this.treeManager.root?.calculateLayout();
    this.cdr.markForCheck()
  }
}
