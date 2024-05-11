import { Directive, HostListener, inject } from '@angular/core';
import { FlowStatusService } from '../services/flow-status.service';
import { FlowEntitiesService } from '../services/flow-entities.service';

// TODO: too general purpose nane
@Directive({ selector: 'svg[rootSvgContext]' })
export class RootSvgContextDirective {
  private flowStatusService = inject(FlowStatusService)
  private flowEntitiesService = inject(FlowEntitiesService)

  // TODO: check for multiple instances on page
  @HostListener('document:mouseup')
  protected resetConnection() {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-start') {
      this.flowStatusService.setIdleStatus()
    }
  }

  @HostListener('mousedown', ['$event'])
  protected resetSelection(event: PointerEvent) {
    // ignore reset if chain conntains selectable element
    // in order to not undo its selection
    if ((event.target as Element).closest('.selectable')) {
      return
    }

    this.flowEntitiesService.select(null)
  }
}
