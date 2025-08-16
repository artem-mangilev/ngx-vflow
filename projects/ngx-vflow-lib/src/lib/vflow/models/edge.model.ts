import { computed, inject, signal } from '@angular/core';
import { EdgeLabelPosition } from '../interfaces/edge-label.interface';
import { Edge, Curve, EdgeType } from '../interfaces/edge.interface';
import { EdgeLabelModel } from './edge-label.model';
import { NodeModel } from './node.model';
import { straightPath } from '../math/edge-path/straigh-path';
import { bezierPath } from '../math/edge-path/bezier-path';
import { toObservable } from '@angular/core/rxjs-interop';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { smoothStepPath } from '../math/edge-path/smooth-step-path';
import { hashCode } from '../utils/hash';
import { Contextable } from '../interfaces/contextable.interface';
import { EdgeContext } from '../interfaces/template-context.interface';
import { HandleModel } from './handle.model';
import { CurveFactoryParams } from '../interfaces/curve-factory.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { extendedComputed } from '../utils/signals/extended-computed';

export class EdgeModel implements FlowEntity, Contextable<EdgeContext> {
  private readonly flowEntitiesService = inject(FlowEntitiesService);

  public source = signal<NodeModel | undefined>(undefined);
  public target = signal<NodeModel | undefined>(undefined);
  public curve: Curve;
  public type: EdgeType;
  public reconnectable: boolean | 'source' | 'target';
  public floating: boolean;

  public selected = signal(false);
  public selected$ = toObservable(this.selected);

  public renderOrder = signal(0);

  public detached = computed(() => {
    const source = this.source();
    const target = this.target();

    if (!source || !target) {
      return true;
    }

    let existsSourceHandle = false;
    let existsTargetHandle = false;

    if (this.edge.sourceHandle) {
      existsSourceHandle = !!source.handles().find((handle) => handle.rawHandle.id === this.edge.sourceHandle);
    } else {
      existsSourceHandle = !!source.handles().find((handle) => handle.rawHandle.type === 'source');
    }

    if (this.edge.targetHandle) {
      existsTargetHandle = !!target.handles().find((handle) => handle.rawHandle.id === this.edge.targetHandle);
    } else {
      existsTargetHandle = !!target.handles().find((handle) => handle.rawHandle.type === 'target');
    }

    return !existsSourceHandle || !existsTargetHandle;
  });

  public detached$ = toObservable(this.detached);

  public path = computed(() => {
    const source = this.sourceHandle();
    const target = this.targetHandle();

    // TODO: don't like this
    if (!source || !target) {
      return {
        path: '',
        labelPoints: {
          start: { x: 0, y: 0 },
          center: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        },
      };
    }

    const params = this.getPathFactoryParams(source, target);

    switch (this.curve) {
      case 'straight':
        return straightPath(params);
      case 'bezier':
        return bezierPath(params);
      case 'smooth-step':
        return smoothStepPath(params);
      case 'step':
        return smoothStepPath(params, 0);
      default:
        return this.curve(params);
    }
  });

  public sourceHandle = extendedComputed<HandleModel | null>((previousHandle) => {
    let handle: HandleModel | null = null;

    if (this.floating) {
      handle = this.closestHandles().sourceHandle;
    } else {
      if (this.edge.sourceHandle) {
        handle =
          this.source()
            ?.handles()
            .find((handle) => handle.rawHandle.id === this.edge.sourceHandle) ?? null;
      } else {
        handle =
          this.source()
            ?.handles()
            .find((handle) => handle.rawHandle.type === 'source') ?? null;
      }
    }

    // In case of virtual scrolling, if the node is scrolled out of view the handle may disappear
    // which could lead to the edge not being rendered
    // so we return the previous handle if the current one is null
    // TODO: check if this breaks anything
    if (handle === null) {
      return previousHandle;
    }

    return handle;
  });

  public targetHandle = extendedComputed<HandleModel | null>((previousHandle) => {
    let handle: HandleModel | null = null;

    if (this.floating) {
      handle = this.closestHandles().targetHandle;
    } else {
      if (this.edge.targetHandle) {
        handle =
          this.target()
            ?.handles()
            .find((handle) => handle.rawHandle.id === this.edge.targetHandle) ?? null;
      } else {
        handle =
          this.target()
            ?.handles()
            .find((handle) => handle.rawHandle.type === 'target') ?? null;
      }
    }

    // In case of virtual scrolling, if the node is scrolled out of view the handle may disappear
    // which could lead to the edge not being rendered
    // so we return the previous handle if the current one is null
    // TODO: check if this breaks anything
    if (handle === null) {
      return previousHandle;
    }

    return handle;
  });

  public closestHandles = computed(() => {
    const source = this.source();
    const target = this.target();

    if (!source || !target) {
      return { sourceHandle: null, targetHandle: null };
    }

    // Get all source handles from source node
    const sourceHandles =
      this.flowEntitiesService.connection().mode === 'strict'
        ? source.handles().filter((h) => h.rawHandle.type === 'source')
        : source.handles();
    // Get all target handles from target node
    const targetHandles =
      this.flowEntitiesService.connection().mode === 'strict'
        ? target.handles().filter((h) => h.rawHandle.type === 'target')
        : target.handles();

    if (sourceHandles.length === 0 || targetHandles.length === 0) {
      return { sourceHandle: null, targetHandle: null };
    }

    let minDistance = Infinity;
    let closestSourceHandle: HandleModel | null = null;
    let closestTargetHandle: HandleModel | null = null;

    // Check all combinations of source and target handles
    for (const sourceHandle of sourceHandles) {
      for (const targetHandle of targetHandles) {
        const sourcePoint = sourceHandle.pointAbsolute();
        const targetPoint = targetHandle.pointAbsolute();

        const distance = Math.sqrt(
          Math.pow(sourcePoint.x - targetPoint.x, 2) + Math.pow(sourcePoint.y - targetPoint.y, 2),
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestSourceHandle = sourceHandle;
          closestTargetHandle = targetHandle;
        }
      }
    }

    return {
      sourceHandle: closestSourceHandle,
      targetHandle: closestTargetHandle,
    };
  });

  /**
   * TODO: not reactive
   */
  public markerStartUrl = computed(() => {
    const marker = this.edge.markers?.start;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  /**
   * TODO: not reactive
   */
  public markerEndUrl = computed(() => {
    const marker = this.edge.markers?.end;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  public context = {
    $implicit: {
      // TODO: check if edge could change
      edge: this.edge,
      path: computed(() => this.path().path),
      markerStart: this.markerStartUrl,
      markerEnd: this.markerEndUrl,
      selected: this.selected.asReadonly(),
    },
  };

  public edgeLabels: { [position in EdgeLabelPosition]?: EdgeLabelModel } = {};

  constructor(public edge: Edge) {
    this.type = edge.type ?? 'default';
    this.curve = edge.curve ?? 'bezier';
    this.reconnectable = edge.reconnectable ?? false;
    this.floating = edge.floating ?? false;

    if (edge.edgeLabels?.start) this.edgeLabels.start = new EdgeLabelModel(edge.edgeLabels.start);
    if (edge.edgeLabels?.center) this.edgeLabels.center = new EdgeLabelModel(edge.edgeLabels.center);
    if (edge.edgeLabels?.end) this.edgeLabels.end = new EdgeLabelModel(edge.edgeLabels.end);
  }

  private getPathFactoryParams(source: HandleModel, target: HandleModel): CurveFactoryParams {
    return {
      mode: 'edge',
      edge: this.edge,
      sourcePoint: source.pointAbsolute(),
      targetPoint: target.pointAbsolute(),
      sourcePosition: source.rawHandle.position,
      targetPosition: target.rawHandle.position,
      allEdges: this.flowEntitiesService.rawEdges(),
      allNodes: this.flowEntitiesService.rawNodes(),
    };
  }
}
