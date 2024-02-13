import { ChangeDetectionStrategy, Component, Input, TemplateRef, computed, inject } from '@angular/core';
import { FlowStatusService } from '../../services/flow-status.service';
import { straightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionModel } from '../../models/connection.model';
import { bezierPath } from '../../math/edge-path/bezier-path';

@Component({
  selector: 'g[connection]',
  template: `
    <ng-container *ngIf="model.type === 'default'">
      <svg:path *ngIf="path() as path" [attr.d]="path" stroke="black" fill="none" />
    </ng-container>

    <ng-container *ngIf="model.type === 'template' && template">
      <ng-container *ngTemplateOutlet="template; context: getContext()" />
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionComponent {
  @Input({ required: true })
  public model!: ConnectionModel

  @Input()
  public template?: TemplateRef<any>

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

  protected getContext() {
    return {
      $implicit: {
        path: this.path
      }
    }
  }
}
