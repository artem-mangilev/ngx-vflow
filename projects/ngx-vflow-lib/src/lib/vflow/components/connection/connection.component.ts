import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FlowStatusConnectionStart, FlowStatusService } from '../../services/flow-status.service';
import { straightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';

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
  private spacePointContext = inject(SpacePointContextDirective)

  protected path = computed(() => {
    const status = this.flowStatusService.status()
    const targetPoint = this.spacePointContext.svgSpacePoint()

    if (status.state === 'connection-start') {
      const sourcePoint = status.payload.sourceNode.sourcePointAbsolute()

      return straightPath(sourcePoint, targetPoint).path
    }

    return null
  })
}
