import { Signal, TemplateRef, WritableSignal, computed, inject, linkedSignal, signal, untracked } from '@angular/core';
import { NodeGeometry } from '../interfaces/curve-factory.interface';
import { DomAttributes } from '../interfaces/dom-attributes.interface';
import { NODE_DEFAULTS, Node } from '../interfaces/node.interface';
import { NodeSizeMode } from '../types/node-change.type';
import { HandleModel } from './handle.model';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Point } from '../interfaces/point.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { Contextable } from '../interfaces/contextable.interface';
import { NodeContext } from '../interfaces/template-context.interface';
import { Observable } from 'rxjs';
import { FlowSettingsService } from '../services/flow-settings.service';
import { extendedComputed } from '../utils/signals/extended-computed';
import { observeSignal } from '../utils/signals/observe-signal';
import { createModelInjector } from '../utils/model-injector';
import { isComponentClass } from '../utils/is-component-class';
import { FlowRegistriesService } from '../services/flow-registries.service';
import { entitySnapshot } from '../utils/signals/entity-snapshot';
import { forwardSignal } from '../utils/signals/forward-signal';

export class NodeModel<T = unknown> implements FlowEntity, Contextable<NodeContext> {
  private modelInjector = createModelInjector();
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);

  /**
   * The application's object as of the last nodes array. Optional signals are read through it, so a signal the
   * application adds to the object later takes effect with the next array.
   */
  private raw = entitySnapshot(this.rawNode, this.entitiesService.nodes);

  public readonly ariaLabel = computed(() => {
    const override = this.raw().ariaLabel?.().trim();
    if (override) return override;
    return this.settingsService.ariaLabels().nodeLabel(this.rawNode.id);
  });

  public readonly accessibility = computed(
    (): { label: string; description: string; roleDescription: string; domAttributes?: DomAttributes } => {
      const labels = this.settingsService.ariaLabels();
      const parent = this.parent();
      return {
        label: this.ariaLabel(),
        roleDescription: this.children().length > 0 ? labels.parentRole : labels.nodeRole,
        domAttributes: this.raw().domAttributes?.(),
        description: [
          this.raw().ariaDescription?.(),
          parent ? labels.parentDescription(parent.ariaLabel()) : '',
          this.selected() ? labels.selected : '',
          !this.selectable() ? labels.selectionUnavailable : '',
          !this.draggable() ? labels.movementUnavailable : '',
        ]
          .filter(Boolean)
          .join(' '),
      };
    },
  );

  public readonly focused = signal(false);
  public readonly dragging = signal(false);
  public readonly connectionActive = signal(false);
  public readonly inViewport = signal(false);

  /** CSS culling retains the view and its last measured geometry. */
  public readonly culled = computed(() => {
    if (
      !this.settingsService.optimization().virtualization ||
      !this.isReady() ||
      this.focused() ||
      this.connectionActive() ||
      this.dragging() ||
      this.resizing() ||
      this.inViewport()
    ) {
      return false;
    }
    for (let node = this.parent(); node; node = node.parent()) {
      if (node.dragging() || node.resizing()) return false;
    }
    return true;
  });

  /**
   * Reference to the rendered node host element. Set by `NodeComponent` and used
   * by handles to measure their connection point relative to the node origin.
   */
  public readonly nodeElement = signal<HTMLElement | null>(null);

  /**
   * Whether the node dimensions have been measured at least once.
   * Until then the node is rendered hidden to avoid flicker and wrong
   * edge endpoints.
   */
  public readonly isMeasured = signal(false);

  /** False while the rendered node has no layout box (display: none), so it cannot be measured. */
  public readonly hasBox = signal(true);

  /** The current view has both node dimensions and positioned handles. */
  public readonly isReady = computed(
    // A handle without a layout box (display: none) never gets measured and must not keep the node hidden.
    () => this.isMeasured() && this.handles().every((handle) => handle.isMeasured() || !handle.hasBox()),
  );

  /** The application's position signal. */
  public readonly point: WritableSignal<Point> = this.rawNode.point;

  /** Size the resizer set on an axis without an application signal. */
  private resizedWidth = signal<number | undefined>(undefined);
  private resizedHeight = signal<number | undefined>(undefined);

  /**
   * Fixed size of an `explicit` axis: the application signal, or the resizer's value when the application has none.
   * `undefined` on an `auto` axis. The library renders it inline; measurement never writes it.
   */
  public readonly explicitWidth = computed(() => this.raw().width?.() ?? this.resizedWidth());
  public readonly explicitHeight = computed(() => this.raw().height?.() ?? this.resizedHeight());

  public readonly widthMode = computed<NodeSizeMode>(() => (this.explicitWidth() === undefined ? 'auto' : 'explicit'));
  public readonly heightMode = computed<NodeSizeMode>(() =>
    this.explicitHeight() === undefined ? 'auto' : 'explicit',
  );

  /**
   * Rendered size, used by edges, handles, the minimap and bounds. It starts from the explicit size, follows it when
   * the explicit size changes, and is overwritten by measurement, so CSS min/max on the element win.
   * `NODE_DEFAULTS` is a placeholder until an `auto` axis is first measured.
   */
  public readonly width = linkedSignal(() => this.explicitWidth() ?? NODE_DEFAULTS.width);

  public readonly height = linkedSignal(() => this.explicitHeight() ?? NODE_DEFAULTS.height);

  /** Set by the first measurement and never reset, unlike {@link isMeasured}, which a remount or culling clears. */
  public readonly hasMeasurement = signal(false);

  public readonly renderOrder = signal(0);

  /** Selection of a node without an application signal. */
  private ownSelected = signal(NODE_DEFAULTS.selected);
  public readonly selected = forwardSignal(() => this.raw().selected ?? this.ownSelected);
  public readonly preselected = signal(false);
  public readonly selectable = computed(() => this.raw().selectable?.() ?? this.settingsService.nodesSelectable());
  public readonly focusable = computed(() => this.raw().focusable?.() ?? this.settingsService.nodesFocusable());

  public readonly extent = computed<'parent' | null>(() => {
    const extent = this.raw().extent;
    // `null` is a value of the signal, not its absence.
    return extent ? extent() : NODE_DEFAULTS.extent;
  });

  public readonly globalPoint = computed(() => {
    let parent = this.parent();
    let x = this.point().x;
    let y = this.point().y;

    while (parent !== null) {
      x += parent.point().x;
      y += parent.point().y;

      parent = parent.parent();
    }

    return { x, y };
  });

  /**
   * CSS transform for positioning the node div in the (transformed) viewport.
   */
  public readonly pointTransformCss = computed(() => `translate(${this.globalPoint().x}px, ${this.globalPoint().y}px)`);

  /** Absolute position and measured size, as curve factories receive them. */
  public readonly geometry: Signal<NodeGeometry> = computed(() => {
    const { x, y } = this.globalPoint();

    return {
      id: this.rawNode.id,
      parentId: this.parent()?.rawNode.id ?? null,
      x,
      y,
      width: this.width(),
      height: this.height(),
    };
  });

  public readonly handles = signal<HandleModel[]>([]);

  public readonly draggable = computed(() => this.raw().draggable?.() ?? NODE_DEFAULTS.draggable);

  public readonly dragHandlesCount = signal(0);

  // disabled for configuration for now
  public readonly magnetRadius = 20;

  /** The component that draws the node, a key resolved through `withNodeComponents()`; `undefined` for a template node. */
  public readonly component = inject(FlowRegistriesService).nodeComponent(this.rawNode.component);

  /** A component class renders immediately; a lazy factory or a template waits for the viewport. */
  private isComponentClass = isComponentClass(this.component);

  public readonly shouldLoad = extendedComputed<boolean>((previousShouldLoad) => {
    if (previousShouldLoad) {
      return true;
    }

    // Culling needs initial node and handle geometry, including offscreen nodes.
    if (
      this.settingsService.optimization().virtualization ||
      this.settingsService.optimization().lazyLoadTrigger === 'immediate'
    ) {
      return true;
    }

    if (this.settingsService.optimization().lazyLoadTrigger === 'viewport' && !this.isComponentClass) {
      // A lazy component factory or a template presentation loads once the node reaches the viewport.
      return this.inViewport();
    }

    return true;
  });

  public readonly parent: Signal<NodeModel | null> = computed(() => {
    // Re-read optional signals when application-owned graph structure changes.
    const nodes = this.entitiesService.nodeByIdMap();
    const parentId = this.rawNode.parentId?.();
    if (!parentId) return null;

    return nodes.get(parentId) ?? null;
  });

  public readonly children = computed(() => this.entitiesService.nodesByParentIdMap().get(this.rawNode.id) ?? []);

  public readonly resizing = signal(false);

  /**
   * Registered by the `[vResizable]` element while it exists. The node renders these controls in its own
   * layer, so a clipping element (`overflow: hidden`) cannot hide them, and the registered element, not the
   * node wrapper, receives the explicit size.
   */
  public readonly resizerTemplate = signal<TemplateRef<unknown> | null>(null);

  public readonly context: NodeContext;

  constructor(public rawNode: Node<T>) {
    const ownData = signal(NODE_DEFAULTS.data as T);

    this.context = {
      $implicit: {
        node: rawNode,
        data: computed(() => (this.raw().data ?? ownData)()),
        selected: this.selected.asReadonly(),
        preselected: this.preselected.asReadonly(),
        width: this.width.asReadonly(),
        height: this.height.asReadonly(),
        shouldLoad: this.shouldLoad,
      },
    };
  }

  // Observables are created on first use: each one is an effect, and most flows never subscribe to them.
  private pointObservable?: Observable<Point>;
  private widthObservable?: Observable<number>;
  private heightObservable?: Observable<number>;
  private selectedObservable?: Observable<boolean>;
  private handlesObservable?: Observable<HandleModel[]>;

  public get point$(): Observable<Point> {
    return (this.pointObservable ??= this.observe(this.point));
  }

  public get width$(): Observable<number> {
    return (this.widthObservable ??= this.observe(this.width));
  }

  public get height$(): Observable<number> {
    return (this.heightObservable ??= this.observe(this.height));
  }

  public get selected$(): Observable<boolean> {
    return (this.selectedObservable ??= this.observe(this.selected));
  }

  public get handles$(): Observable<HandleModel[]> {
    return (this.handlesObservable ??= this.observe(this.handles));
  }

  private observe<V>(source: Signal<V>): Observable<V> {
    return observeSignal(source, this.modelInjector.get());
  }

  public destroy(): void {
    this.modelInjector.destroy();
  }

  public setPoint(point: Point): void {
    this.point.set(point);
  }

  /**
   * Fixes the given axes to a size: into the application signal when the node has one, otherwise into the model,
   * which makes the axis `explicit`. The rendered size follows at once.
   */
  public setExplicitSize({ width, height }: { width?: number; height?: number }): void {
    const raw = untracked(this.raw);
    if (width !== undefined) (raw.width ?? this.resizedWidth).set(width);
    if (height !== undefined) (raw.height ?? this.resizedHeight).set(height);
  }
}
