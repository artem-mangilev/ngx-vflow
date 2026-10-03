import { Signal, TemplateRef, computed, inject, linkedSignal, signal, untracked } from '@angular/core';
import { NodeGeometry } from '../interfaces/curve-factory.interface';
import { DOCUMENT } from '@angular/common';
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
import { entitySnapshot } from '../utils/signals/entity-snapshot';
import { forwardSignal } from '../utils/signals/forward-signal';

export class NodeModel<T = unknown> implements FlowEntity, Contextable<NodeContext> {
  private modelInjector = createModelInjector();
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private document = inject(DOCUMENT);

  /**
   * The application's object as of the last nodes array. Optional signals are read through it, so a signal the
   * application adds to the object later takes effect with the next array.
   */
  private raw = entitySnapshot(this.rawNode, this.entitiesService.nodes);

  public ariaLabel = computed(() => {
    const override = this.raw().ariaLabel?.().trim();
    if (override) return override;
    return this.settingsService.ariaLabels().nodeLabel(this.rawNode.id);
  });

  public accessibility = computed(
    (): { label: string; description: string; roleDescription: string; domAttributes?: DomAttributes } => {
      const labels = this.settingsService.ariaLabels();
      const parent = this.parent();
      return {
        label: this.ariaLabel(),
        roleDescription: this.children().length > 0 ? labels.groupRole : labels.nodeRole,
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

  public focused = signal(false);
  public dragging = signal(false);
  public connectionActive = signal(false);
  public inViewport = signal(false);

  /** CSS culling retains the view and its last measured geometry. */
  public culled = computed(() => {
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
  public nodeElement = signal<HTMLElement | null>(null);

  /**
   * Whether the node dimensions have been measured at least once.
   * Until then the node is rendered hidden to avoid flicker and wrong
   * edge endpoints.
   */
  public isMeasured = signal(false);

  /** False while the rendered node has no layout box (display: none), so it cannot be measured. */
  public hasBox = signal(true);

  /** The current view has both node dimensions and positioned handles. */
  public isReady = computed(
    // A handle without a layout box (display: none) never gets measured and must not keep the node hidden.
    () => this.isMeasured() && this.handles().every((handle) => handle.isMeasured() || !handle.hasBox()),
  );

  public point = signal<Point>({ x: 0, y: 0 });

  /** Size the resizer set on an axis without an application signal. */
  private resizedWidth = signal<number | undefined>(undefined);
  private resizedHeight = signal<number | undefined>(undefined);

  /**
   * Fixed size of an `explicit` axis: the application signal, or the resizer's value when the application has none.
   * `undefined` on an `auto` axis. The library renders it inline; measurement never writes it.
   */
  public explicitWidth = computed(() => this.raw().width?.() ?? this.resizedWidth());
  public explicitHeight = computed(() => this.raw().height?.() ?? this.resizedHeight());

  public widthMode = computed<NodeSizeMode>(() => (this.explicitWidth() === undefined ? 'auto' : 'explicit'));
  public heightMode = computed<NodeSizeMode>(() => (this.explicitHeight() === undefined ? 'auto' : 'explicit'));

  /**
   * Rendered size, used by edges, handles, the minimap and bounds. It starts from the explicit size, follows it when
   * the explicit size changes, and is overwritten by measurement, so CSS min/max on the element win.
   * `NODE_DEFAULTS` is a placeholder until an `auto` axis is first measured.
   */
  public width = linkedSignal(() => this.explicitWidth() ?? NODE_DEFAULTS.width);

  public height = linkedSignal(() => this.explicitHeight() ?? NODE_DEFAULTS.height);

  /** Set by the first measurement and never reset, unlike {@link isMeasured}, which a remount or culling clears. */
  public hasMeasurement = signal(false);

  public renderOrder = signal(0);

  /** Selection of a node without an application signal. */
  private ownSelected = signal(NODE_DEFAULTS.selected);
  public selected = forwardSignal(() => this.raw().selected ?? this.ownSelected);
  public preselected = signal(false);
  public selectable = computed(() => this.raw().selectable?.() ?? this.settingsService.nodesSelectable());
  public focusable = computed(() => this.raw().focusable?.() ?? this.settingsService.nodesFocusable());

  public extent = computed<'parent' | null>(() => {
    const extent = this.raw().extent;
    // `null` is a value of the signal, not its absence.
    return extent ? extent() : NODE_DEFAULTS.extent;
  });

  public globalPoint = computed(() => {
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

  public pointTransform = computed(() => `translate(${this.globalPoint().x}, ${this.globalPoint().y})`);

  /**
   * CSS transform for positioning the node div in the (transformed) viewport.
   */
  public pointTransformCss = computed(() => `translate(${this.globalPoint().x}px, ${this.globalPoint().y}px)`);

  /** Absolute position and measured size, as curve factories receive them. */
  public geometry = computed<NodeGeometry>(() => {
    const { x, y } = this.globalPoint();

    return { id: this.rawNode.id, x, y, width: this.width(), height: this.height() };
  });

  public handles = signal<HandleModel[]>([]);

  public draggable = computed(() => this.raw().draggable?.() ?? NODE_DEFAULTS.draggable);

  public dragHandlesCount = signal(0);

  // disabled for configuration for now
  public readonly magnetRadius = 20;

  /** A component class renders immediately; a lazy factory or a template waits for the viewport. */
  private isComponentClass = isComponentClass(this.rawNode.component);

  public shouldLoad = extendedComputed<boolean>((previousShouldLoad) => {
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

  public parent = computed<NodeModel | null>(() => {
    // Re-read optional signals when application-owned graph structure changes.
    const nodes = this.entitiesService.nodeByIdMap();
    const parentId = this.rawNode.parentId?.();
    if (!parentId) return null;

    return nodes.get(parentId) ?? null;
  });

  public children = computed(() => this.entitiesService.nodesByParentIdMap().get(this.rawNode.id) ?? []);

  public resizing = signal(false);

  /**
   * Registered by the `[resizable]` element while it exists. The node renders these controls in its own
   * layer, so a clipping element (`overflow: hidden`) cannot hide them, and the registered element, not the
   * node wrapper, receives the explicit size.
   */
  public resizerTemplate = signal<TemplateRef<unknown> | null>(null);

  public context: NodeContext;

  constructor(public rawNode: Node<T>) {
    if (rawNode.point) {
      this.point = rawNode.point;
    }

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
  private observables = new Map<string, Observable<unknown>>();

  public get point$(): Observable<Point> {
    return this.observe('point', this.point);
  }

  public get width$(): Observable<number> {
    return this.observe('width', this.width);
  }

  public get height$(): Observable<number> {
    return this.observe('height', this.height);
  }

  public get selected$(): Observable<boolean> {
    return this.observe('selected', this.selected);
  }

  public get handles$(): Observable<HandleModel[]> {
    return this.observe('handles', this.handles);
  }

  private observe<V>(key: string, source: Signal<V>): Observable<V> {
    let observable = this.observables.get(key) as Observable<V> | undefined;
    if (!observable) {
      observable = observeSignal(source, this.modelInjector.get());
      this.observables.set(key, observable);
    }
    return observable;
  }

  public destroy() {
    this.modelInjector.destroy();
  }

  public setPoint(point: Point) {
    this.point.set(point);
  }

  /**
   * Fixes the given axes to a size: into the application signal when the node has one, otherwise into the model,
   * which makes the axis `explicit`. The rendered size follows at once.
   */
  public setExplicitSize({ width, height }: { width?: number; height?: number }) {
    const raw = untracked(this.raw);
    if (width !== undefined) (raw.width ?? this.resizedWidth).set(width);
    if (height !== undefined) (raw.height ?? this.resizedHeight).set(height);
  }
}
