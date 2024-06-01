import { Directive, HostListener, inject } from '@angular/core';
import { FlowStatusService } from '../services/flow-status.service';


// TODO: too general purpose nane
@Directive({ selector: 'svg[rootSvgContext]' })
export class RootSvgContextDirective {
  private flowStatusService = inject(FlowStatusService)

  // TODO: check for multiple instances on page
  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  protected resetConnection() {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-start') {
      this.flowStatusService.setIdleStatus()
    }
  }
}
