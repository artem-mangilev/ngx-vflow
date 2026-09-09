import { TemplateRef, computed, inject, signal } from '@angular/core';
import { DomAttributes } from '../interfaces/dom-attributes.interface';
import { NODE_DEFAULTS, Node, isComponentNode } from '../interfaces/node.interface';
import { toObservable } from '@angular/core/rxjs-interop';
import { HandleModel } from './handle.model';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Point } from '../interfaces/point.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { Contextable } from '../interfaces/contextable.interface';
import { GroupNodeContext, NodeContext } from '../interfaces/template-context.interface';
import { Observable, of } from 'rxjs';
import { catchError, filter, shareReplay, switchMap } from 'rxjs/operators';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { extendedComputed } from '../utils/signals/extended-computed';
import { isCallable } from '../utils/is-callable';
import { isCustomNodeComponent } from '../utils/is-vflow-component';
import { createModelInjector } from '../utils/model-injector';

export class NodeModel<T = unknown>
  implements FlowEntity, Contextable<NodeContext | GroupNodeContext | { $implicit: object }>
{
  private modelInjector = createModelInjector();
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private nodeRenderingService = inject(NodeRenderingService);

  public ariaLabel = computed(() => {
    const override = this.rawNode.ariaLabel?.().trim();
    if (override) return override;
    const labels = this.settingsService.ariaLabels();
    return this.rawNode.type === 'template-group'
      ? labels.groupLabel(this.rawNode.id)
      : labels.nodeLabel(this.rawNode.id);
  });

  public accessibility = computed((): { label: string; description: string; domAttributes?: DomAttributes } => {
    const labels = this.settingsService.ariaLabels();
    const parent = this.parent();
    return {
      label: this.ariaLabel(),
      domAttributes: this.rawNode.domAttributes?.(),
      description: [
        this.rawNode.ariaDescription?.(),
        parent ? labels.parentDescription(parent.ariaLabel()) : '',
        this.selected() ? labels.selected : '',
        !this.selectable() ? labels.selectionUnavailable : '',
        !this.draggable() ? labels.movementUnavailable : '',
      ]
        .filter(Boolean)
        .join(' '),
    };
  });

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

  /** The current view has both node dimensions and positioned handles. */
  public isReady = computed(() => this.isMeasured() && this.handles().every((handle) => handle.isMeasured()));

  public point = signal<Point>({ x: 0, y: 0 });
  public point$: Observable<Point>;

  public width = signal(NODE_DEFAULTS.width);
  public width$: Observable<number>;

  public height = signal(NODE_DEFAULTS.height);
  public height$: Observable<number>;

  public renderOrder = signal(0);

  public selected = signal(false);
  public selected$: Observable<boolean>;
  public preselected = signal(false);
  public selectable = computed(() => this.rawNode.selectable?.() ?? this.settingsService.nodesSelectable());
  public focusable = computed(() => this.rawNode.focusable?.() ?? this.settingsService.nodesFocusable());

  public extent = signal<'parent' | null>(NODE_DEFAULTS.extent);

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

  public handles = signal<HandleModel[]>([]);
  public handles$: Observable<HandleModel[]>;

  public draggable = signal(true);

  public dragHandlesCount = signal(0);

  // disabled for configuration for now
  public readonly magnetRadius = 20;

  // TODO: not sure if we need to statically store it
  public isComponentType = isComponentNode(this.rawNode);

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
    } else if (this.settingsService.optimization().lazyLoadTrigger === 'viewport') {
      // Immediately load component if it's a plain class
      if (isCustomNodeComponent(this.rawNode.type)) {
        return true;
      }

      // For cases
      // - if it's a factory with dynamic import
      // - if it's a template (html, svg, group)
      // check if it's in the viewport
      if (
        isCallable(this.rawNode.type) ||
        this.rawNode.type === 'html-template' ||
        this.rawNode.type === 'template-group'
      ) {
        return this.nodeRenderingService.viewportNodes().includes(this as NodeModel);
      }
    }

    // For each other case, we want to load the component immediately
    return true;
  });

  public componentInstance$ = toObservable(this.shouldLoad, { injector: this.modelInjector }).pipe(
    filter(Boolean),
    // @ts-expect-error we assume it's a function with dynamic import
    switchMap(() => this.rawNode.type()),
    catchError(() => of(this.rawNode.type)),
    shareReplay(1),
  );

  // Component node specific thing
  public componentTypeInputs = {
    node: this.rawNode,
  };

  public parent = computed<NodeModel | null>(() => {
    // Re-read optional signals when application-owned graph structure changes.
    const nodes = this.entitiesService.nodeByIdMap();
    const parentId = this.rawNode.parentId?.();
    if (!parentId) return null;

    return nodes.get(parentId) ?? null;
  });

  public children = computed(() => this.entitiesService.nodesByParentIdMap().get(this.rawNode.id) ?? []);

  public controlledByResizer = signal(false);
  public resizable = signal(NODE_DEFAULTS.resizable);
  public resizing = signal(false);
  public resizerTemplate = signal<TemplateRef<unknown> | null>(null);

  public context = {
    $implicit: {},
  };

  constructor(public rawNode: Node<T>) {
    if (rawNode.point) {
      this.point = rawNode.point;
    }

    if (rawNode.width) {
      this.width = rawNode.width;
    }

    if (rawNode.height) {
      this.height = rawNode.height;
    }

    if (rawNode.draggable) {
      this.draggable = rawNode.draggable;
    }

    if (rawNode.selected) {
      this.selected = rawNode.selected;
    }

    if (rawNode.extent) {
      this.extent = rawNode.extent;
    }

    if (rawNode.type === 'html-template') {
      this.context = {
        $implicit: {
          node: rawNode,
          data: rawNode.data ?? signal(NODE_DEFAULTS.data as T),
          selected: this.selected.asReadonly(),
          preselected: this.preselected.asReadonly(),
          shouldLoad: this.shouldLoad,
        },
      };
    }

    if (rawNode.type === 'template-group') {
      this.context = {
        $implicit: {
          node: rawNode,
          data: rawNode.data ?? signal(NODE_DEFAULTS.data as T),
          selected: this.selected.asReadonly(),
          preselected: this.preselected.asReadonly(),
          width: this.width.asReadonly(),
          height: this.height.asReadonly(),
          shouldLoad: this.shouldLoad,
        },
      };
    }

    // Initialize Observables after all signal assignments
    this.point$ = toObservable(this.point, { injector: this.modelInjector });
    this.width$ = toObservable(this.width, { injector: this.modelInjector });
    this.height$ = toObservable(this.height, { injector: this.modelInjector });
    this.selected$ = toObservable(this.selected, { injector: this.modelInjector });
    this.handles$ = toObservable(this.handles, { injector: this.modelInjector });
  }

  public destroy() {
    this.modelInjector.destroy();
  }

  public setPoint(point: Point) {
    this.point.set(point);
  }
}
