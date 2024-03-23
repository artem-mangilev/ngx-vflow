import { ChangeDetectionStrategy, Component, Input, TemplateRef, computed, inject } from '@angular/core';
import { FlowStatusService } from '../../services/flow-status.service';
import { straightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionModel } from '../../models/connection.model';
import { bezierPath } from '../../math/edge-path/bezier-path';
import { hashCode } from '../../utils/hash';

@Component({
  selector: 'g[connection]',
  template: `
    <ng-container *ngIf="model.type === 'default'">
      <svg:path
        *ngIf="path() as path"
        [attr.d]="path"
        [attr.marker-end]="markerUrl()"
        [attr.stroke]="defaultColor"
        fill="none"
        stroke-width="2"
      />
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

    if (status.state === 'connection-validation') {
      const sourcePoint = status.payload.sourceNode.sourcePointAbsolute()
      // ignore magnet if validation failed
      const targetPoint = status.payload.valid
        ? status.payload.targetNode.targetPointAbsolute()
        : this.spacePointContext.svgCurrentSpacePoint()

      switch (this.model.curve) {
        case 'straight': return straightPath(sourcePoint, targetPoint).path
        case 'bezier': return bezierPath(
          sourcePoint, targetPoint,
          status.payload.sourceNode.sourcePosition(),
          status.payload.sourceNode.targetPosition()
        ).path
      }
    }

    return null
  })

  protected markerUrl = computed(() => {
    const marker = this.model.connection.marker

    if (marker) {
      return `url(#${hashCode(JSON.stringify(marker))})`
    }

    return ''
  })

  protected readonly defaultColor = 'rgb(177, 177, 183)'

  protected getContext() {
    return {
      $implicit: {
        path: this.path,
        marker: this.markerUrl
      }
    }
  }
}
