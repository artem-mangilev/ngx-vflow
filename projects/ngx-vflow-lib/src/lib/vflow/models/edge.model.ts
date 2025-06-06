import { computed, signal } from '@angular/core';
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

export class EdgeModel implements FlowEntity, Contextable<EdgeContext> {
  public source = signal<NodeModel | undefined>(undefined);
  public target = signal<NodeModel | undefined>(undefined);
  public curve: Curve;
  public type: EdgeType;
  public reconnectable: boolean | 'source' | 'target';

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
        points: {
          start: { x: 0, y: 0 },
          center: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        },
      };
    }

    switch (this.curve) {
      case 'straight':
        return straightPath(source.pointAbsolute(), target.pointAbsolute());
      case 'bezier':
        return bezierPath(
          source.pointAbsolute(),
          target.pointAbsolute(),
          source.rawHandle.position,
          target.rawHandle.position,
        );
      case 'smooth-step':
        return smoothStepPath(
          source.pointAbsolute(),
          target.pointAbsolute(),
          source.rawHandle.position,
          target.rawHandle.position,
        );
      case 'step':
        return smoothStepPath(
          source.pointAbsolute(),
          target.pointAbsolute(),
          source.rawHandle.position,
          target.rawHandle.position,
          0,
        );
    }
  });

  public sourceHandle = computed(() => {
    if (this.edge.sourceHandle) {
      return (
        this.source()
          ?.handles()
          .find((handle) => handle.rawHandle.id === this.edge.sourceHandle) ?? null
      );
    }

    return (
      this.source()
        ?.handles()
        .find((handle) => handle.rawHandle.type === 'source') ?? null
    );
  });

  public targetHandle = computed(() => {
    if (this.edge.targetHandle) {
      return (
        this.target()
          ?.handles()
          .find((handle) => handle.rawHandle.id === this.edge.targetHandle) ?? null
      );
    }

    return (
      this.target()
        ?.handles()
        .find((handle) => handle.rawHandle.type === 'target') ?? null
    );
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

    if (edge.edgeLabels?.start) this.edgeLabels.start = new EdgeLabelModel(edge.edgeLabels.start);
    if (edge.edgeLabels?.center) this.edgeLabels.center = new EdgeLabelModel(edge.edgeLabels.center);
    if (edge.edgeLabels?.end) this.edgeLabels.end = new EdgeLabelModel(edge.edgeLabels.end);
  }
}
