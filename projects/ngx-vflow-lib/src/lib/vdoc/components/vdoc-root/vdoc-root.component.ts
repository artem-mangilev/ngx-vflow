import { AfterContentInit, AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, NgZone, OnInit, forwardRef, inject, signal } from '@angular/core';
import { VDocTreeBuilderService } from '../../services/vdoc-tree-builder.service';
import { VDocViewComponent } from '../vdoc-view/vdoc-view.component';
import { RootViewModel } from './root.view-model';
import { RootStyleSheet } from '../../interfaces/stylesheet.interface';
import { provideComponent } from '../../utils/provide-component';
import { FilterService } from '../../../shared/services/filter.service';

@Component({
  selector: 'svg[vdoc-root]',
  template: `
    <!-- TODO move filter in new component -->
    <svg:filter
      *ngFor="let shadow of filterService.shadows() | keyvalue; trackBy: trackByShadowHash"
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
export class VDocRootComponent extends VDocViewComponent<RootViewModel, RootStyleSheet> implements AfterContentInit, AfterViewChecked {
  @HostBinding('attr.width')
  protected get hostWidth() {
    return this.model.width()
  }

  @HostBinding('attr.height')
  protected get hostHeight() {
    return this.model.height()
  }

  protected filterService = inject(FilterService)

  public ngAfterContentInit(): void {
    this.treeManager.root?.calculateLayout()
  }

  /**
   * @todo research how to remove this manual cdr call
   */
  public ngAfterViewChecked(): void {
    this.viewRef.detectChanges()
  }

  protected modelFactory(): RootViewModel {
    return new RootViewModel(this.styleSheet)
  }

  protected defaultStyleSheet(): RootStyleSheet {
    return { width: signal(200) }
  }

  protected trackByShadowHash(_: number, { key }: { key: number }) {
    return key
  }
}
