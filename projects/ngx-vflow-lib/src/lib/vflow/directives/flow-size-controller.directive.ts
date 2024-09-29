import { Directive, ElementRef, HostBinding, NgZone, effect, inject } from '@angular/core';
import { resizable } from '../utils/resizable';
import { tap } from 'rxjs';
import { FlowSettingsService } from '../services/flow-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({ selector: 'svg[flowSizeController]' })
export class FlowSizeControllerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef)
  private flowSettingsService = inject(FlowSettingsService)

  @HostBinding('attr.width')
  public flowWidth: string | number = 0

  @HostBinding('attr.height')
  public flowHeight: string | number = 0

  constructor() {
    effect(() => {
      const view = this.flowSettingsService.view()

      this.flowWidth = view === 'auto' ? '100%' : view[0]
      this.flowHeight = view === 'auto' ? '100%' : view[1]
    })

    resizable([this.host.nativeElement], inject(NgZone)).pipe(
      tap(([entry]) => {
        this.flowSettingsService.computedFlowWidth.set(entry.contentRect.width)
        this.flowSettingsService.computedFlowHeight.set(entry.contentRect.height)
      }),
      takeUntilDestroyed()
    ).subscribe()
  }
}
