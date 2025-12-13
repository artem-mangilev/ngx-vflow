import { TemplateRef, computed, inject, signal } from '@angular/core';
import { NODE_DEFAULTS, Node, isComponentNode } from '../interfaces/node.interface';
import { toObservable } from '@angular/core/rxjs-interop';
import { HandleModel } from './handle.model';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Point } from '../interfaces/point.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME } from '../constants/magic-number-to-fix-glitch-in-chrome.constant';
import { Contextable } from '../interfaces/contextable.interface';
import { GroupNodeContext, NodeContext } from '../interfaces/template-context.interface';
import { catchError, filter, Observable, of, shareReplay, switchMap } from 'rxjs';
import { NodePreview } from '../interfaces/node-preview.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { extendedComputed } from '../utils/signals/extended-computed';
import { isCallable } from '../utils/is-callable';
import { isCustomNodeComponent } from '../utils/is-vflow-component';

export class NodeModel<T = unknown>
  implements FlowEntity, Contextable<NodeContext | GroupNodeContext | { $implicit: object }>
{
  private entitiesService = inject(FlowEntitiesService);
  private settingsService = inject(FlowSettingsService);
  private nodeRenderingService = inject(NodeRenderingService);

  public isVisible = signal(false);

  public point = signal<Point>({ x: 0, y: 0 });
  public point$: Observable<Point>;

  public width = signal(NODE_DEFAULTS.width);
  public width$: Observable<number>;

  public height = signal(NODE_DEFAULTS.height);
  public height$: Observable<number>;

  /**
   * @deprecated use width or height signals
   */
  public size = computed(() => ({ width: this.width(), height: this.height() }));
  /**
   * @deprecated use width$ or height$
   */
  public size$: Observable<{ width: number; height: number }>;

  /**
   * If resizer is used, the node size fully depends on the resizer
   * Otherwise it calculates the size based on the content
   */
  public styleWidth = computed(() => (this.controlledByResizer() ? `${this.width()}px` : '100%'));
  public styleHeight = computed(() => (this.controlledByResizer() ? `${this.height()}px` : '100%'));

  public foWidth = computed(() => this.width() + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME);
  public foHeight = computed(() => this.height() + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME);

  public renderOrder = signal(0);

  public selected = signal(false);
  public selected$: Observable<boolean>;

  public preview = signal<NodePreview>({ style: {} });

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

    if (this.settingsService.optimization().lazyLoadTrigger === 'immediate') {
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
        this.rawNode.type === 'svg-template' ||
        this.rawNode.type === 'template-group'
      ) {
        return this.nodeRenderingService.viewportNodes().includes(this as NodeModel);
      }
    }

    // For each other case, we want to load the component immediately
    return true;
  });

  public componentInstance$ = toObservable(this.shouldLoad).pipe(
    filter(Boolean),
    // @ts-expect-error we assume it's a function with dynamic import
    switchMap(() => this.rawNode.type()),
    catchError(() => of(this.rawNode.type)),
    shareReplay(1),
  );

  // Default node specific thing
  public text = signal(NODE_DEFAULTS.text);

  // Component node specific thing
  public componentTypeInputs = {
    node: this.rawNode,
  };

  public parent = computed(() => this.entitiesService.nodes().find((n) => n.rawNode.id === this.parentId()) ?? null);

  public children = computed(() => this.entitiesService.nodes().filter((n) => n.parentId() === this.rawNode.id));

  public color = signal(NODE_DEFAULTS.color);

  public controlledByResizer = signal(false);
  public resizable = signal(NODE_DEFAULTS.resizable);
  public resizing = signal(false);
  public resizerTemplate = signal<TemplateRef<unknown> | null>(null);

  public context = {
    $implicit: {},
  };

  private parentId = signal<string | null>(NODE_DEFAULTS.parentId);

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

    if (rawNode.parentId) {
      this.parentId = rawNode.parentId;
    }

    if (rawNode.preview) {
      this.preview = rawNode.preview;
    }

    if (rawNode.selected) {
      this.selected = rawNode.selected;
    }

    if (rawNode.type === 'default-group' && rawNode.color) {
      this.color = rawNode.color;
    }

    if (rawNode.type === 'default-group' && rawNode.resizable) {
      this.resizable = rawNode.resizable;
    }

    if (rawNode.type === 'default' && rawNode.text) {
      this.text = rawNode.text;
    }

    if (rawNode.type === 'html-template') {
      this.context = {
        $implicit: {
          node: rawNode,
          data: rawNode.data ?? signal(NODE_DEFAULTS.data as T),
          selected: this.selected.asReadonly(),
          shouldLoad: this.shouldLoad,
        },
      };
    }

    if (rawNode.type === 'svg-template') {
      this.context = {
        $implicit: {
          node: rawNode,
          data: rawNode.data ?? signal(NODE_DEFAULTS.data as T),
          selected: this.selected.asReadonly(),
          width: this.width.asReadonly(),
          height: this.height.asReadonly(),
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
          width: this.width.asReadonly(),
          height: this.height.asReadonly(),
          shouldLoad: this.shouldLoad,
        },
      };
    }

    // Initialize Observables after all signal assignments
    this.point$ = toObservable(this.point);
    this.width$ = toObservable(this.width);
    this.height$ = toObservable(this.height);
    this.size$ = toObservable(this.size);
    this.selected$ = toObservable(this.selected);
    this.handles$ = toObservable(this.handles);
  }

  public setPoint(point: Point) {
    this.point.set(point);
  }
}
