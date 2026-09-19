import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input } from '@angular/core';
import { FlowStatusService } from '../../services/flow-status.service';
import { getStraightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionModel } from '../../models/connection.model';
import { getBezierPath } from '../../math/edge-path/bezier-path';
import { hashCode } from '../../utils/hash';
import { Position } from '../../types/position.type';
import { getSmoothStepPath } from '../../math/edge-path/smooth-step-path';
import { NgTemplateOutlet } from '@angular/common';
import { ConnectionContext } from '../../interfaces/template-context.interface';
import { Point } from '../../interfaces/point.interface';
import { CurveFactoryParams } from '../../interfaces/curve-factory.interface';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { insetPoint, markerInset } from '../../utils/marker-inset';
import { NodeModel } from '../../models/node.model';

@Component({
  selector: 'g[connection]',
  template: `
    @if (model().type === 'default') {
      @if (path(); as path) {
        <svg:path
          aria-hidden="true"
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
  private readonly flowStatusService = inject(FlowStatusService);
  private readonly spacePointContext = inject(SpacePointContextDirective);
  private readonly flowEntitiesService = inject(FlowEntitiesService);

  public model = input.required<ConnectionModel>();

  public template = input<TemplateRef<any>>();

  protected path = computed(() => {
    const status = this.flowStatusService.connectionStatus();
    if (!status) return null;
    const curve = this.model().curve;

    if (status.state === 'connection-start' || status.state === 'reconnection-start') {
      const sourceHandle = status.payload.sourceHandle;
      const sourcePoint = sourceHandle.pointAbsolute();
      const sourcePosition = sourceHandle.position();

      const targetPoint = this.spacePointContext.svgCurrentSpacePoint();
      const targetPosition = getOppositePostion(sourceHandle.position());

      const params = this.getPathFactoryParams(
        sourcePoint,
        targetPoint,
        sourcePosition,
        targetPosition,
        status.payload.source,
      );

      switch (curve) {
        case 'straight':
          return getStraightPath(params).path;
        case 'bezier':
          return getBezierPath(params).path;
        case 'smooth-step':
          return getSmoothStepPath(params).path;
        case 'step':
          return getSmoothStepPath({ ...params, borderRadius: 0 }).path;
        default:
          return curve(params).path;
      }
    }

    if (status.state === 'connection-validation' || status.state === 'reconnection-validation') {
      const sourceHandle = status.payload.sourceHandle;
      const sourcePoint = sourceHandle.pointAbsolute();
      const sourcePosition = sourceHandle.position();

      const targetHandle = status.payload.targetHandle;
      // ignore magnet if validation failed
      const targetPoint = status.payload.valid
        ? targetHandle.pointAbsolute()
        : this.spacePointContext.svgCurrentSpacePoint();
      const targetPosition = status.payload.valid
        ? targetHandle.position()
        : getOppositePostion(sourceHandle.position());

      const params = this.getPathFactoryParams(
        sourcePoint,
        targetPoint,
        sourcePosition,
        targetPosition,
        status.payload.source,
        status.payload.valid ? status.payload.target : undefined,
      );

      switch (curve) {
        case 'straight':
          return getStraightPath(params).path;
        case 'bezier':
          return getBezierPath(params).path;
        case 'smooth-step':
          return getSmoothStepPath(params).path;
        case 'step':
          return getSmoothStepPath({ ...params, borderRadius: 0 }).path;
        default:
          return curve(params).path;
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

  protected readonly defaultColor = 'var(--vflow-muted, rgb(177, 177, 183))';

  // TODO: move context to model
  protected getContext(): ConnectionContext {
    return {
      $implicit: {
        path: this.path,
        marker: this.markerUrl,
      },
    };
  }

  private getPathFactoryParams(
    sourcePoint: Point,
    targetPoint: Point,
    sourcePosition: Position,
    targetPosition: Position,
    sourceNode: NodeModel,
    targetNode?: NodeModel,
  ): CurveFactoryParams {
    const inset = { start: 0, end: markerInset(this.model().settings.marker) };

    return {
      mode: 'connection',
      sourcePoint,
      // The arrow tip reaches the pointer or the candidate handle; the path ends under the arrowhead.
      targetPoint: insetPoint(targetPoint, targetPosition, inset.end),
      markerInset: inset,
      sourceNode: sourceNode.geometry(),
      targetNode: targetNode?.geometry(),
      sourcePosition,
      targetPosition,
      allEdges: this.flowEntitiesService.rawEdges(),
      allNodes: this.flowEntitiesService.rawNodes(),
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
