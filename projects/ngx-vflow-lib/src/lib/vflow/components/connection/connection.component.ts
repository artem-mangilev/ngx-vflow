import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input } from '@angular/core';
import { FlowStatusService } from '../../services/flow-status.service';
import { straightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionModel } from '../../models/connection.model';
import { bezierPath } from '../../math/edge-path/bezier-path';
import { hashCode } from '../../utils/hash';
import { Position } from '../../types/position.type';
import { smoothStepPath } from '../../math/edge-path/smooth-step-path';
import { NgTemplateOutlet } from '@angular/common';
import { ConnectionContext } from '../../interfaces/template-context.interface';

@Component({
  standalone: true,
  selector: 'g[connection]',
  template: `
    @if (model().type === 'default') {
      @if (path(); as path) {
        <svg:path
          fill="none"
          stroke-width="2"
          [attr.d]="path"
          [attr.marker-end]="markerUrl()"
          [attr.stroke]="defaultColor" />
      }
    }

    @if (model().type === 'template') {
      @if (template(); as template) {
        <ng-container *ngTemplateOutlet="template; context: getContext()" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class ConnectionComponent {
  public model = input.required<ConnectionModel>();

  public template = input<TemplateRef<any>>();

  private flowStatusService = inject(FlowStatusService);
  private spacePointContext = inject(SpacePointContextDirective);

  protected path = computed(() => {
    const status = this.flowStatusService.status();

    if (status.state === 'connection-start' || status.state === 'reconnection-start') {
      const sourceHandle = status.payload.sourceHandle;
      const sourcePoint = sourceHandle.pointAbsolute();
      const sourcePosition = sourceHandle.rawHandle.position;

      const targetPoint = this.spacePointContext.svgCurrentSpacePoint();
      const targetPosition = getOppositePostion(sourceHandle.rawHandle.position);

      switch (this.model().curve) {
        case 'straight':
          return straightPath(sourcePoint, targetPoint).path;
        case 'bezier':
          return bezierPath(sourcePoint, targetPoint, sourcePosition, targetPosition).path;
        case 'smooth-step':
          return smoothStepPath(sourcePoint, targetPoint, sourcePosition, targetPosition).path;
        case 'step':
          return smoothStepPath(sourcePoint, targetPoint, sourcePosition, targetPosition, 0).path;
      }
    }

    if (status.state === 'connection-validation' || status.state === 'reconnection-validation') {
      const sourceHandle = status.payload.sourceHandle;
      const sourcePoint = sourceHandle.pointAbsolute();
      const sourcePosition = sourceHandle.rawHandle.position;

      const targetHandle = status.payload.targetHandle;
      // ignore magnet if validation failed
      const targetPoint = status.payload.valid
        ? targetHandle.pointAbsolute()
        : this.spacePointContext.svgCurrentSpacePoint();
      const targetPosition = status.payload.valid
        ? targetHandle.rawHandle.position
        : getOppositePostion(sourceHandle.rawHandle.position);

      switch (this.model().curve) {
        case 'straight':
          return straightPath(sourcePoint, targetPoint).path;
        case 'bezier':
          return bezierPath(sourcePoint, targetPoint, sourcePosition, targetPosition).path;
        case 'smooth-step':
          return smoothStepPath(sourcePoint, targetPoint, sourcePosition, targetPosition).path;
        case 'step':
          return smoothStepPath(sourcePoint, targetPoint, sourcePosition, targetPosition, 0).path;
      }
    }

    return null;
  });

  protected markerUrl = computed(() => {
    const marker = this.model().settings.marker;

    if (marker) {
      return `url(#${hashCode(JSON.stringify(marker))})`;
    }

    return '';
  });

  protected readonly defaultColor = 'rgb(177, 177, 183)';

  protected getContext(): ConnectionContext {
    return {
      $implicit: {
        path: this.path,
        marker: this.markerUrl,
      },
    };
  }
}

function getOppositePostion(position: Position): Position {
  switch (position) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
  }
}
