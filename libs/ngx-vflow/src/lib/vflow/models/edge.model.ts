import { TemplateRef, computed, inject, signal } from '@angular/core';
import { EdgeLabelPosition } from '../interfaces/edge-label.interface';
import { Edge, Curve, EDGE_DEFAULTS } from '../interfaces/edge.interface';
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
import { HandleType } from '../types/handle-type.type';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { Marker } from '../interfaces/marker.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { createModelInjector } from '../utils/model-injector';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { getSvgPathBounds } from '../utils/svg-path-bounds';
import { insetPoint, markerInset } from '../utils/marker-inset';

const LABEL_POSITIONS: EdgeLabelPosition[] = ['start', 'center', 'end'];

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
  public reconnectable = signal<boolean | 'source' | 'target'>(EDGE_DEFAULTS.reconnectable);
  public interactionWidth = signal(EDGE_DEFAULTS.interactionWidth);
  public markers = signal<{ start?: Marker; end?: Marker }>(EDGE_DEFAULTS.markers);
  /** Label templates registered by `ng-template[edgeLabel]` inside the presentation of this edge. */
  public labelTemplates = signal<Partial<Record<EdgeLabelPosition, TemplateRef<unknown>>>>({});
  public labelEntries = computed(() => {
    const templates = this.labelTemplates();
    return LABEL_POSITIONS.flatMap((position) => {
      const template = templates[position];
      return template ? [{ position, template }] : [];
    });
  });

  public focused = signal(false);
  public reconnecting = signal(false);
  public inViewport = signal(false);
  public culled = computed(
    () => !!this.settingsService.optimization().virtualization && !this.focused() && !this.inViewport(),
  );

  public selected = signal(EDGE_DEFAULTS.selected);
  public selected$: Observable<boolean>;
  public preselected = signal(false);
  public selectable = computed(() => this.edge.selectable?.() ?? this.settingsService.edgesSelectable());
  public focusable = computed(() => this.edge.focusable?.() ?? this.settingsService.edgesFocusable());

  public shouldLoad = computed(() => (this.source()?.shouldLoad() ?? false) && (this.target()?.shouldLoad() ?? false));

  public renderOrder = signal(0);

  public isReady = computed(
    () =>
      !!this.source()?.isReady() &&
      !!this.target()?.isReady() &&
      // An endpoint handle without a layout box has no point to draw to.
      this.sourceHandle()?.hasBox() !== false &&
      this.targetHandle()?.hasBox() !== false,
  );

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

  public sourceHandle = computed<HandleModel | null>(() =>
    this.findHandle(this.source()?.handles() ?? [], 'source', this.edge.sourceHandle),
  );

  public targetHandle = computed<HandleModel | null>(() =>
    this.findHandle(this.target()?.handles() ?? [], 'target', this.edge.targetHandle),
  );

  /** By id, or the first handle of the role; a handle of type `any` serves either role. */
  private findHandle(handles: HandleModel[], type: HandleType, id?: string) {
    if (id) {
      return handles.find((handle) => handle.id() === id) ?? null;
    }

    return handles.find((handle) => handle.type() === type || handle.type() === 'any') ?? null;
  }

  public markerStartUrl = computed(() => {
    const marker = this.markers()?.start;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  public markerEndUrl = computed(() => {
    const marker = this.markers()?.end;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  public context: EdgeContext;

  constructor(public edge: Edge) {
    if (edge.curve) {
      this.curve = edge.curve;
    }

    if (edge.reconnectable) {
      this.reconnectable = edge.reconnectable;
    }

    if (edge.interactionWidth) {
      this.interactionWidth = edge.interactionWidth;
    }

    if (edge.selected) {
      this.selected = edge.selected;
    }

    if (edge.markers) {
      this.markers = edge.markers;
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
    const markers = this.markers();
    const inset = { start: markerInset(markers?.start), end: markerInset(markers?.end) };
    // A dynamic handle resolves its point towards the reference point of the other end.
    const start = source.endpoint(target.pointAbsolute());
    const end = target.endpoint(source.pointAbsolute());

    return {
      mode: 'edge',
      edge: this.edge,
      // An arrow tip touches the handle; the path itself ends under the arrowhead.
      sourcePoint: insetPoint(start.point, start.position, inset.start),
      targetPoint: insetPoint(end.point, end.position, inset.end),
      markerInset: inset,
      sourceNode: source.parentNode.geometry(),
      targetNode: target.parentNode.geometry(),
      sourcePosition: start.position,
      targetPosition: end.position,
      allEdges: this.flowEntitiesService.rawEdges(),
      allNodes: this.flowEntitiesService.rawNodes(),
    };
  }
}
