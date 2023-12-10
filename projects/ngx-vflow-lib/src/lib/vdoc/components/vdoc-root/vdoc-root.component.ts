import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, forwardRef, inject } from '@angular/core';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { RootViewModel } from '../../view-models/root.view-model';

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
  private treeManager: VDocTreeBuilderService = inject(VDocTreeBuilderService)
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef)

  ngOnInit(): void {
    const model = new RootViewModel(this)
    this.treeManager.register(model)
  }

  ngAfterContentInit(): void {
    this.treeManager.root?.calculateLayout();
    this.cdr.markForCheck()
  }
}
