import { ChangeDetectionStrategy, Component, Input, computed, inject } from '@angular/core';
import { FlowStatusConnectionStart, FlowStatusService } from '../../services/flow-status.service';
import { straightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { ConnectionModel } from '../../models/connection.model';
import { bezierPath } from '../../math/edge-path/bezier-path';

@Component({
  selector: 'g[connection]',
  template: `
    <svg:path *ngIf="path() as path" [attr.d]="path" stroke="black" fill="none" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent {
  @Input({ required: true })
  public model!: ConnectionModel

  private flowStatusService = inject(FlowStatusService)
  private spacePointContext = inject(SpacePointContextDirective)

  protected path = computed(() => {
    const status = this.flowStatusService.status()

    if (status.state === 'connection-start') {
      const sourceNode = status.payload.sourceNode
      const sourcePoint = sourceNode.sourcePointAbsolute()
      const targetPoint = this.spacePointContext.svgCurrentSpacePoint()

      switch (this.model.curve) {
        case 'straight': return straightPath(sourcePoint, targetPoint).path
        case 'bezier': return bezierPath(
          sourcePoint, targetPoint,
          sourceNode.sourcePosition(), sourceNode.targetPosition()
        ).path
      }
    }

    return null
  })
}
