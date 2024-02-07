import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FlowStatusConnectionStart, FlowStatusService } from '../../services/flow-status.service';
import { straightPath } from '../../math/edge-path/straigh-path';
import { RootControllerDirective } from '../../directives/root-controller.directive';

@Component({
  selector: 'g[connection]',
  template: `
    <svg:path
      *ngIf="path()"
      [attr.d]="path()"
      stroke="black"
      fill="none"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent {
  private flowStatusService = inject(FlowStatusService)
  private rootController = inject(RootControllerDirective)

  protected path = computed(() => {
    const status = this.flowStatusService.status()
    const targetPoint = this.rootController.svgSpacePoint()

    if (status.state === 'connection-start') {
      const sourcePoint = status.payload.sourceNode.sourcePoint()

      return straightPath(sourcePoint, targetPoint, [false, false, false]).path
    }

    return null
  })
}
