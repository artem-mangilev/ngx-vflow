import { computed, inject, signal } from '@angular/core';
import { EdgeLabel, EdgeLabelPosition } from '../interfaces/edge-label.interface';
import { Edge, Curve, EdgeType, EDGE_DEFAULTS } from '../interfaces/edge.interface';
import { EdgeLabelModel } from './edge-label.model';
import { NodeModel } from './node.model';
import { getStraightPath } from '../math/edge-path/straigh-path';
import { getBezierPath } from '../math/edge-path/bezier-path';
import { toObservable } from '@angular/core/rxjs-interop';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { getSmoothStepPath } from '../math/edge-path/smooth-step-path';
import { hashCode } from '../utils/hash';
import { Contextable } from '../interfaces/contextable.interface';
import { EdgeContext } from '../interfaces/template-context.interface';
import { HandleModel } from './handle.model';
import { CurveFactoryParams, CurveLayout } from '../interfaces/curve-factory.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { extendedComputed } from '../utils/signals/extended-computed';
import { Marker } from '../interfaces/marker.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { createModelInjector } from '../utils/model-injector';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { getSvgPathBounds } from '../utils/svg-path-bounds';

export class EdgeModel implements FlowEntity, Contextable<EdgeContext> {
  private modelInjector = createModelInjector();
  private document = inject(DOCUMENT);
  private readonly flowEntitiesService = inject(FlowEntitiesService);
  private readonly settingsService = inject(FlowSettingsService);

  public accessibility = computed(() => {
    const labels = this.settingsService.ariaLabels();
    const endpoints = labels.edgeLabel({
      source: this.source()?.ariaLabel() ?? labels.nodeLabel(this.edge.source),
      target: this.target()?.ariaLabel() ?? labels.nodeLabel(this.edge.target),
    });
    const label = this.edge.ariaLabel?.().trim() || endpoints;
    return {
      label,
      domAttributes: this.edge.domAttributes?.(),
      description: [
        this.edge.ariaDescription?.(),
        label !== endpoints ? endpoints : '',
        this.selected() ? labels.selected : '',
        !this.selectable() ? labels.selectionUnavailable : '',
        !this.reconnectable() ? labels.reconnectionUnavailable : '',
      ]
        .filter(Boolean)
        .join(' '),
    };
  });

  public source = signal<NodeModel | undefined>(undefined);
  public target = signal<NodeModel | undefined>(undefined);
  public curve = signal<Curve>(EDGE_DEFAULTS.curve);
  public type: EdgeType;
  public reconnectable = signal<boolean | 'source' | 'target'>(EDGE_DEFAULTS.reconnectable);
  public floating = signal(EDGE_DEFAULTS.floating);
  public markers = signal<{ start?: Marker; end?: Marker }>(EDGE_DEFAULTS.markers);
  public edgeLabels = signal<{ [position in EdgeLabelPosition]?: EdgeLabel }>(EDGE_DEFAULTS.edgeLabels);

  public selected = signal(EDGE_DEFAULTS.selected);
  public selected$: Observable<boolean>;
  public preselected = signal(false);
  public selectable = computed(() => this.edge.selectable?.() ?? this.settingsService.edgesSelectable());
  public focusable = computed(() => this.edge.focusable?.() ?? this.settingsService.edgesFocusable());

  public shouldLoad = computed(() => (this.source()?.shouldLoad() ?? false) && (this.target()?.shouldLoad() ?? false));

  public renderOrder = signal(0);

  public isReady = computed(() => !!this.source()?.isReady() && !!this.target()?.isReady());

  public detached = computed(() => {
    const source = this.source();
    const target = this.target();

    if (!source || !target) {
      return true;
    }

    return !this.sourceHandle() || !this.targetHandle();
  });

  public detached$ = toObservable(this.detached, { injector: this.modelInjector });

  public path = computed<CurveLayout>(() => {
    const source = this.sourceHandle();
    const target = this.targetHandle();

    // TODO: don't like this
    if (!source || !target) {
      return { path: '' };
    }

    const params = this.getPathFactoryParams(source, target);

    const curve = this.curve();
    switch (curve) {
      case 'straight':
        return getStraightPath(params);
      case 'bezier':
        return getBezierPath(params);
      case 'smooth-step':
        return getSmoothStepPath(params);
      case 'step':
        return getSmoothStepPath({ ...params, borderRadius: 0 });
      default:
        return curve(params);
    }
  });

  public bounds = computed(() => {
    const layout = this.path();
    return layout.path ? (layout.bounds ?? getSvgPathBounds(this.document, layout.path)) : null;
  });

  public sourceHandle = extendedComputed<HandleModel | null>((previousHandle) => {
    let handle: HandleModel | null = null;

    if (this.floating()) {
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

    if (handle === null && this.source()?.virtualized() && previousHandle?.parentNode === this.source()) {
      return previousHandle;
    }

    return handle;
  });

  public targetHandle = extendedComputed<HandleModel | null>((previousHandle) => {
    let handle: HandleModel | null = null;

    if (this.floating()) {
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

    if (handle === null && this.target()?.virtualized() && previousHandle?.parentNode === this.target()) {
      return previousHandle;
    }

    return handle;
  });

  public closestHandles = extendedComputed<{
    sourceHandle: HandleModel | null;
    targetHandle: HandleModel | null;
  }>((previous) => {
    const source = this.source();
    const target = this.target();

    if (!source || !target) {
      return { sourceHandle: null, targetHandle: null };
    }

    // A virtually unmounted endpoint still participates in closest-pair selection.
    const availableSourceHandles = source.handles().length
      ? source.handles()
      : source.virtualized() && previous?.sourceHandle?.parentNode === source
        ? [previous.sourceHandle]
        : [];
    const availableTargetHandles = target.handles().length
      ? target.handles()
      : target.virtualized() && previous?.targetHandle?.parentNode === target
        ? [previous.targetHandle]
        : [];

    const sourceHandles =
      this.flowEntitiesService.connection().mode === 'strict'
        ? availableSourceHandles.filter((h) => h.rawHandle.type === 'source')
        : availableSourceHandles;
    const targetHandles =
      this.flowEntitiesService.connection().mode === 'strict'
        ? availableTargetHandles.filter((h) => h.rawHandle.type === 'target')
        : availableTargetHandles;

    if (sourceHandles.length === 0 || targetHandles.length === 0) {
      return { sourceHandle: sourceHandles[0] ?? null, targetHandle: targetHandles[0] ?? null };
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

  public markerStartUrl = computed(() => {
    const marker = this.markers()?.start;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  public markerEndUrl = computed(() => {
    const marker = this.markers()?.end;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  public context: EdgeContext;

  public labelModels = computed(() => {
    const models: { [position in EdgeLabelPosition]?: EdgeLabelModel } = {};

    const labels = this.edgeLabels();
    if (labels?.start) models.start = new EdgeLabelModel(labels.start);
    if (labels?.center) models.center = new EdgeLabelModel(labels.center);
    if (labels?.end) models.end = new EdgeLabelModel(labels.end);

    return models;
  });

  constructor(public edge: Edge) {
    this.type = edge.type ?? EDGE_DEFAULTS.type;

    if (edge.curve) {
      this.curve = edge.curve;
    }

    if (edge.reconnectable) {
      this.reconnectable = edge.reconnectable;
    }

    if (edge.floating) {
      this.floating = edge.floating;
    }

    if (edge.selected) {
      this.selected = edge.selected;
    }

    if (edge.markers) {
      this.markers = edge.markers;
    }

    if (edge.edgeLabels) {
      this.edgeLabels = edge.edgeLabels;
    }

    this.context = {
      $implicit: {
        edge: this.edge,
        data: this.edge.data ?? signal({}),
        path: computed(() => this.path().path),
        markerStart: this.markerStartUrl,
        markerEnd: this.markerEndUrl,
        selected: this.selected.asReadonly(),
        preselected: this.preselected.asReadonly(),
        shouldLoad: this.shouldLoad,
      },
    };

    this.selected$ = toObservable(this.selected, { injector: this.modelInjector });
  }

  public destroy() {
    this.modelInjector.destroy();
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
