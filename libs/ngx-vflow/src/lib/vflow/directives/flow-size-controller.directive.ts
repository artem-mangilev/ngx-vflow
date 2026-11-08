import { Directive, ElementRef, NgZone, inject } from '@angular/core';
import { resizable } from '../utils/resizable';
import { tap } from 'rxjs/operators';
import { FlowSettingsService } from '../services/flow-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/** Measures the root of the flow, which the application sizes with CSS, for the parts that need its size. */
@Directive({
  standalone: true,
  selector: 'div[flowSizeController]',
})
export class FlowSizeControllerDirective {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private flowSettingsService = inject(FlowSettingsService);

  constructor() {
    resizable([this.host.nativeElement], inject(NgZone))
      .pipe(
        tap(([entry]) => {
          const { width, height } = entry.contentRect;
          this.flowSettingsService.computedFlowWidth.set(width);
          this.flowSettingsService.computedFlowHeight.set(height);
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }
}
