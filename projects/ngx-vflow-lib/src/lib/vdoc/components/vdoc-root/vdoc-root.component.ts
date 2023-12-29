import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, NgZone, OnInit, forwardRef, inject } from '@angular/core';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { RootViewModel } from '../../view-models/root.view-model';
import { RootStyleSheet } from '../../interfaces/stylesheet.interface';
import { provideComponent } from '../../utils/provide-component';

@Component({
  selector: 'svg[vdoc-root]',
  template: `
    <ng-container *ngLet="model.viewUpdate$ | async">
      <ng-content></ng-content>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocRootComponent), VDocTreeBuilderService],
})
export class VDocRootComponent extends VDocViewComponent<RootViewModel> implements AfterContentInit {
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

  ngAfterContentInit(): void {
    this.treeManager.root?.calculateLayout()
  }

  protected modelFactory(): RootViewModel {
    return new RootViewModel(this, this.styleSheet);
  }
}
