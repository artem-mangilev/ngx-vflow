import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, NgZone, OnInit, forwardRef, inject, signal } from '@angular/core';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { RootViewModel } from '../../view-models/root.view-model';
import { RootStyleSheet } from '../../interfaces/stylesheet.interface';
import { provideComponent } from '../../utils/provide-component';
import { FilterService } from '../../../shared/services/filter.service';

@Component({
  selector: 'svg[vdoc-root]',
  template: `
    <!-- TODO move filter in new component -->
    <svg:filter
      *ngFor="let shadow of filterService.shadows() | keyvalue"
      [id]="shadow.key"
      color-interpolation-filters="sRGB"
      filterUnits="userSpaceOnUse">
      <svg:feDropShadow
        [attr.dx]="shadow.value.hOffset"
        [attr.dy]="shadow.value.vOffset"
        [attr.stdDeviation]="shadow.value.blur"
        [attr.flood-color]="shadow.value.color"
      />
    </svg:filter>

    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(VDocRootComponent), VDocTreeBuilderService],
})
export class VDocRootComponent extends VDocViewComponent<RootViewModel, RootStyleSheet> implements AfterContentInit {
  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width()
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height()
  }

  protected filterService = inject(FilterService)

  ngAfterContentInit(): void {
    this.treeManager.root?.calculateLayout()
  }

  protected modelFactory(): RootViewModel {
    return new RootViewModel(this.styleSheet)
  }

  protected defaultStyleSheet(): RootStyleSheet {
    return { width: signal(200) }
  }
}
