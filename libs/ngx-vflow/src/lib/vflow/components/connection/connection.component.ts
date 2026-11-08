import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input, untracked } from '@angular/core';
import { ConnectionService } from '../../services/connection.service';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { ConnectionModel } from '../../models/connection.model';
import { markerUrl } from '../../utils/marker-ref';
import { Position } from '../../types/position.type';
import { resolveCurve } from '../../math/edge-path/resolve-curve';
import { VFLOW_CURVES } from '../../features/with-curves';
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
  private readonly connection = inject(ConnectionService);
  private readonly spacePointContext = inject(SpacePointContextDirective);
  private readonly flowEntitiesService = inject(FlowEntitiesService);

  public model = input.required<ConnectionModel>();

  public template = input<TemplateRef<ConnectionContext>>();

  private readonly curves = inject(VFLOW_CURVES, { optional: true });

  protected path = computed(() => {
    const gesture = this.connection.gesture();
    if (!gesture) return null;

    const sourceHandle = gesture.sourceHandle;
    // Follows the pointer and the viewport, which auto-pan moves under a still pointer.
    const pointer = this.spacePointContext.clientToFlowPosition(this.connection.pointer());
    // The candidate is the end only while valid; otherwise the preview follows the pointer.
    const candidate = gesture.candidate?.valid ? gesture.candidate : null;

    const source = sourceHandle.endpoint(candidate ? candidate.handle.pointAbsolute() : pointer);
    const target = candidate
      ? candidate.handle.endpoint(sourceHandle.pointAbsolute())
      : { point: pointer, position: getOppositePostion(source.position) };

    return resolveCurve(
      this.model().curve,
      this.getPathFactoryParams(
        source.point,
        target.point,
        source.position,
        target.position,
        gesture.source,
        candidate?.node,
      ),
      untracked(() => this.curves?.()),
    ).path;
  });

  protected markerUrl = computed(() => markerUrl(this.model().settings.markerEnd));

  protected readonly defaultColor = 'var(--v-connection)';

  // TODO: move context to model
  protected getContext(): ConnectionContext {
    return {
      $implicit: {
        path: this.path,
        markerEnd: this.markerUrl,
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
    const entities = this.flowEntitiesService;
    const inset = { start: 0, end: markerInset(this.model().settings.markerEnd, entities.markerShapes()) };

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
      allEdges: entities.rawEdges(),
      allNodes: entities.rawNodes(),
      // Read inside the factory, so only a factory that routes around nodes follows every node.
      get nodeGeometries() {
        return entities.nodeGeometries();
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
