import { Directive, ElementRef, NgZone, Signal, computed, inject, isDevMode } from '@angular/core';
import { resizable } from '../utils/resizable';
import { tap } from 'rxjs/operators';
import { FlowSettingsService } from '../services/flow-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true,
  selector: 'div[flowSizeController]',
  host: {
    '[style.width]': 'flowWidth()',
    '[style.height]': 'flowHeight()',
  },
})
export class FlowSizeControllerDirective {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private flowSettingsService = inject(FlowSettingsService);
  private reportedCollapse = false;

  public flowWidth: Signal<string> = computed(() => {
    const view = this.flowSettingsService.view();

    return view === 'auto' ? '100%' : `${view[0]}px`;
  });

  public flowHeight: Signal<string> = computed(() => {
    const view = this.flowSettingsService.view();

    return view === 'auto' ? '100%' : `${view[1]}px`;
  });

  constructor() {
    resizable([this.host.nativeElement], inject(NgZone))
      .pipe(
        tap(([entry]) => {
          const { width, height } = entry.contentRect;
          this.flowSettingsService.computedFlowWidth.set(width);
          this.flowSettingsService.computedFlowHeight.set(height);
          if (
            isDevMode() &&
            !this.reportedCollapse &&
            this.flowSettingsService.view() === 'auto' &&
            (width === 0) !== (height === 0)
          ) {
            // An unrendered element reports no size at all, so one zero axis means a parent without a size on it.
            this.reportedCollapse = true;
            console.warn(
              `[ngx-vflow] The flow measured ${width}×${height}px with view 'auto'. ` +
                'Give its parent element a width and height, or pass [view]="[width, height]".',
            );
          }
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
