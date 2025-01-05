import { Directive, ElementRef, NgZone, Signal, computed, inject } from '@angular/core';
import { resizable } from '../utils/resizable';
import { tap } from 'rxjs';
import { FlowSettingsService } from '../services/flow-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  standalone: true,
  selector: 'svg[flowSizeController]',
  host: {
    '[attr.width]': 'flowWidth()',
    '[attr.height]': 'flowHeight()'
  },
})
export class FlowSizeControllerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef)
  private flowSettingsService = inject(FlowSettingsService)

  public flowWidth: Signal<string | number> = computed(() => {
    const view = this.flowSettingsService.view()

    return view === 'auto' ? '100%' : view[0]
  })

  public flowHeight: Signal<string | number> = computed(() => {
    const view = this.flowSettingsService.view()

    return view === 'auto' ? '100%' : view[1]
  })

  constructor() {
    resizable([this.host.nativeElement], inject(NgZone)).pipe(
      tap(([entry]) => {
        this.flowSettingsService.computedFlowWidth.set(entry.contentRect.width)
        this.flowSettingsService.computedFlowHeight.set(entry.contentRect.height)
      }),
      takeUntilDestroyed()
    ).subscribe()
  }
}
