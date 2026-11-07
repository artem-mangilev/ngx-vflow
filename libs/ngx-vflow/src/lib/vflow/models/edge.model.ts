import { TemplateRef, computed, inject, signal } from '@angular/core';
import { EdgeLabelOrient, EdgeLabelPosition } from '../interfaces/edge-label.interface';
import { Edge, Curve, EDGE_DEFAULTS } from '../interfaces/edge.interface';
import { NodeModel } from './node.model';
import { getStraightPath } from '../math/edge-path/straigh-path';
import { getBezierPath } from '../math/edge-path/bezier-path';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { getSmoothStepPath } from '../math/edge-path/smooth-step-path';
import { Contextable } from '../interfaces/contextable.interface';
import { EdgeContext } from '../interfaces/template-context.interface';
import { HandleModel } from './handle.model';
import { CurveFactoryParams, CurveLayout } from '../interfaces/curve-factory.interface';
import { HandleType } from '../types/handle-type.type';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { MarkerRef } from '../interfaces/marker.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { createModelInjector } from '../utils/model-injector';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { getSvgPathBounds } from '../utils/svg-path-bounds';
import { insetPoint, markerInset } from '../utils/marker-inset';
import { markerUrl } from '../utils/marker-ref';
import { observeSignal } from '../utils/signals/observe-signal';
import { entitySnapshot } from '../utils/signals/entity-snapshot';
import { forwardSignal } from '../utils/signals/forward-signal';

const LABEL_POSITIONS: EdgeLabelPosition[] = ['start', 'center', 'end'];

/** A label declared at one position of the edge. */
export interface EdgeLabelEntry {
  template: TemplateRef<unknown>;
  orient: EdgeLabelOrient;
}

export class EdgeModel implements FlowEntity, Contextable<EdgeContext> {
  private modelInjector = createModelInjector();
  private document = inject(DOCUMENT);
  private readonly flowEntitiesService = inject(FlowEntitiesService);
  private readonly settingsService = inject(FlowSettingsService);

  /**
   * The application's object as of the last edges array. Optional signals are read through it, so a signal the
   * application adds to the object later takes effect with the next array.
   */
  private raw = entitySnapshot(this.edge, this.flowEntitiesService.edges);

  public readonly accessibility = computed(() => {
    const labels = this.settingsService.ariaLabels();
    const endpoints = labels.edgeLabel({
      source: this.source()?.ariaLabel() ?? labels.nodeLabel(this.edge.source),
      target: this.target()?.ariaLabel() ?? labels.nodeLabel(this.edge.target),
    });
    const label = this.raw().ariaLabel?.().trim() || endpoints;
    return {
      label,
      roleDescription: labels.edgeRole,
      domAttributes: this.raw().domAttributes?.(),
      description: [
        this.raw().ariaDescription?.(),
        label !== endpoints ? `${endpoints}.` : '',
        this.selected() ? labels.selected : '',
        !this.selectable() ? labels.selectionUnavailable : '',
      ]
        .filter(Boolean)
        .join(' '),
    };
  });

  public readonly source = signal<NodeModel | null>(null);
  public readonly target = signal<NodeModel | null>(null);
  public readonly curve = computed<Curve>(() => this.raw().curve?.() ?? EDGE_DEFAULTS.curve);
  public readonly reconnectable = computed(() => this.raw().reconnectable?.() ?? EDGE_DEFAULTS.reconnectable);
  public readonly interactionWidth = computed(() => this.raw().interactionWidth?.() ?? EDGE_DEFAULTS.interactionWidth);
  /** `g[vEdgeInteractionArea]` groups and host directives drawing the interaction stroke inside the presentation. */
  public readonly interactionAreasCount = signal(0);
  public readonly markers = computed<{ start?: MarkerRef; end?: MarkerRef }>(
    () => this.raw().markers?.() ?? EDGE_DEFAULTS.markers,
  );
  /** Label templates registered by `ng-template[vEdgeLabel]` inside the presentation of this edge. */
  public readonly labelTemplates = signal<Partial<Record<EdgeLabelPosition, EdgeLabelEntry>>>({});
  public readonly labelEntries = computed(() => {
    const templates = this.labelTemplates();
    return LABEL_POSITIONS.flatMap((position) => {
      const entry = templates[position];
      return entry ? [{ position, ...entry }] : [];
    });
  });

  public readonly focused = signal(false);
  public readonly reconnecting = signal(false);
  public readonly inViewport = signal(false);
  public readonly culled = computed(
    () => !!this.settingsService.optimization().virtualization && !this.focused() && !this.inViewport(),
  );

  /** Selection of an edge without an application signal. */
  private ownSelected = signal(EDGE_DEFAULTS.selected);
  public readonly selected = forwardSignal(() => this.raw().selected ?? this.ownSelected);
  public readonly preselected = signal(false);
  public readonly selectable = computed(() => this.raw().selectable?.() ?? this.settingsService.edgesSelectable());
  public readonly focusable = computed(() => this.raw().focusable?.() ?? this.settingsService.edgesFocusable());

  public readonly shouldLoad = computed(
    () => (this.source()?.shouldLoad() ?? false) && (this.target()?.shouldLoad() ?? false),
  );

  public readonly renderOrder = signal(0);

  /**
   * Both endpoint nodes are measured and the edge's own endpoint handles are placed. Other handles of those nodes do
   * not matter: a handle added to a node that is already shown must not hide the edges drawn to its other handles.
   */
  public readonly isReady = computed(
    () =>
      !!this.source()?.isMeasured() &&
      !!this.target()?.isMeasured() &&
      endpointPlaced(this.sourceHandle()) &&
      endpointPlaced(this.targetHandle()),
  );

  public readonly detached = computed(() => {
    const source = this.source();
    const target = this.target();

    if (!source || !target) {
      return true;
    }

    return !this.sourceHandle() || !this.targetHandle();
  });

  public readonly path = computed<CurveLayout>(() => {
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

  public readonly bounds = computed(() => {
    const layout = this.path();
    return layout.path ? (layout.bounds ?? getSvgPathBounds(this.document, layout.path)) : null;
  });

  public readonly sourceHandle = computed<HandleModel | null>(() =>
    this.findHandle(this.source()?.handles() ?? [], 'source', this.edge.sourceHandle),
  );

  public readonly targetHandle = computed<HandleModel | null>(() =>
    this.findHandle(this.target()?.handles() ?? [], 'target', this.edge.targetHandle),
  );

  /** By id, or the first handle of the role; a handle of type `any` serves either role. */
  private findHandle(handles: HandleModel[], type: HandleType, id?: string) {
    if (id) {
      return handles.find((handle) => handle.id() === id) ?? null;
    }

    return handles.find((handle) => handle.type() === type || handle.type() === 'any') ?? null;
  }

  public readonly markerStartUrl = computed(() => markerUrl(this.markers()?.start));

  public readonly markerEndUrl = computed(() => markerUrl(this.markers()?.end));

  public readonly context: EdgeContext;

  constructor(public edge: Edge) {
    const ownData = signal({});

    this.context = {
      $implicit: {
        edge: this.edge,
        data: computed(() => (this.raw().data ?? ownData)()),
        path: computed(() => this.path().path),
        markerStart: this.markerStartUrl,
        markerEnd: this.markerEndUrl,
        selected: this.selected.asReadonly(),
        preselected: this.preselected.asReadonly(),
        shouldLoad: this.shouldLoad,
      },
    };
  }

  private selectedObservable?: Observable<boolean>;

  /** Created on first use: each observable is an effect, and most flows never subscribe to it. */
  public get selected$(): Observable<boolean> {
    return (this.selectedObservable ??= observeSignal(this.selected, this.modelInjector.get()));
  }

  public destroy(): void {
    this.modelInjector.destroy();
  }

  private getPathFactoryParams(source: HandleModel, target: HandleModel): CurveFactoryParams {
    const markers = this.markers();
    const shapes = this.flowEntitiesService.markerShapes();
    const inset = { start: markerInset(markers?.start, shapes), end: markerInset(markers?.end, shapes) };
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

/** A found endpoint handle must be measured; one without a layout box has no point to draw to. */
function endpointPlaced(handle: HandleModel | null): boolean {
  return !handle || (handle.hasBox() && handle.isMeasured());
}
