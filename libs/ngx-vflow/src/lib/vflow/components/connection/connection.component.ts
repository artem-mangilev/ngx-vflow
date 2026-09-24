import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input } from '@angular/core';
import { FlowStatusService } from '../../services/flow-status.service';
import { getStraightPath } from '../../math/edge-path/straigh-path';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionModel } from '../../models/connection.model';
import { getBezierPath } from '../../math/edge-path/bezier-path';
import { markerUrl } from '../../utils/marker-ref';
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
    @if (template(); as template) {
      <ng-container *ngTemplateOutlet="template; context: getContext()" />
    } @else if (path(); as path) {
      <svg:path
        aria-hidden="true"
        fill="none"
        stroke-width="2"
        [attr.d]="path"
        [attr.marker-end]="markerUrl()"
        [attr.stroke]="defaultColor" />
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

    const sourceHandle = status.payload.sourceHandle;
    const pointer = this.spacePointContext.svgCurrentSpacePoint();
    // The candidate is the end only while valid; otherwise the preview follows the pointer.
    const candidate =
      (status.state === 'connection-validation' || status.state === 'reconnection-validation') && status.payload.valid
        ? { node: status.payload.target, handle: status.payload.targetHandle }
        : null;

    const source = sourceHandle.endpoint(candidate ? candidate.handle.pointAbsolute() : pointer);
    const target = candidate
      ? candidate.handle.endpoint(sourceHandle.pointAbsolute())
      : { point: pointer, position: getOppositePostion(source.position) };

    const params = this.getPathFactoryParams(
      source.point,
      target.point,
      source.position,
      target.position,
      status.payload.source,
      candidate?.node,
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
  });

  protected markerUrl = computed(() => markerUrl(this.model().settings.marker));

  protected readonly defaultColor = 'var(--vflow-muted)';

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
    const inset = { start: 0, end: markerInset(this.model().settings.marker, this.flowEntitiesService.markerShapes()) };

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
