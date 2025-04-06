import { Signal, TemplateRef, computed, inject, signal } from '@angular/core';
import {
  DynamicNode,
  Node,
  isComponentDynamicNode,
  isComponentStaticNode,
  isDynamicNode,
} from '../interfaces/node.interface';
import { isDefined } from '../utils/is-defined';
import { toObservable } from '@angular/core/rxjs-interop';
import { HandleModel } from './handle.model';
import { FlowEntity } from '../interfaces/flow-entity.interface';
import { Point } from '../interfaces/point.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME } from '../constants/magic-number-to-fix-glitch-in-chrome.constant';
import { Contextable } from '../interfaces/contextable.interface';
import { GroupNodeContext, NodeContext } from '../interfaces/template-context.interface';

export class NodeModel<T = unknown>
  implements FlowEntity, Contextable<NodeContext | GroupNodeContext | { $implicit: object }>
{
  private static defaultWidth = 100;
  private static defaultHeight = 50;
  private static defaultColor = '#1b262c';

  private entitiesService = inject(FlowEntitiesService);

  public point = this.createInternalPointSignal();
  public point$ = toObservable(this.point);

  public width = this.createWidthSignal(NodeModel.defaultWidth);
  public width$ = toObservable(this.width);

  public height = this.createHeightSignal(NodeModel.defaultHeight);
  public height$ = toObservable(this.height);

  /**
   * @deprecated use width or height signals
   */
  public size = computed(() => ({ width: this.width(), height: this.height() }));
  /**
   * @deprecated use width$ or height$
   */
  public size$ = toObservable(this.size);

  public styleWidth = computed(() => `${this.width()}px`);
  public styleHeight = computed(() => `${this.height()}px`);

  public foWidth = computed(() => this.width() + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME);
  public foHeight = computed(() => this.height() + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME);

  public renderOrder = signal(0);

  public selected = signal(false);
  public selected$ = toObservable(this.selected);

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
  public handles$ = toObservable(this.handles);

  public draggable = signal(true);

  public dragHandlesCount = signal(0);

  // disabled for configuration for now
  public readonly magnetRadius = 20;

  // TODO: not sure if we need to statically store it
  public isComponentType = isComponentStaticNode(this.node as Node) || isComponentDynamicNode(this.node as DynamicNode);

  // Default node specific thing
  public text = this.createTextSignal();

  // Component node specific thing
  public componentTypeInputs = {
    node: this.node,
  };

  public parent = computed(() => this.entitiesService.nodes().find((n) => n.node.id === this.parentId()) ?? null);

  public children = computed(() => this.entitiesService.nodes().filter((n) => n.parentId() === this.node.id));

  public color = signal(NodeModel.defaultColor);

  public resizable = signal(false);
  public resizing = signal(false);
  public resizerTemplate = signal<TemplateRef<unknown> | null>(null);

  public context = {
    $implicit: {},
  };

  private parentId = signal<string | null>(null);

  constructor(public node: Node<T> | DynamicNode<T>) {
    if (isDefined(node.draggable)) {
      if (isDynamicNode(node)) {
        this.draggable = node.draggable;
      } else {
        this.draggable.set(node.draggable);
      }
    }

    if (isDefined(node.parentId)) {
      if (isDynamicNode(node)) {
        this.parentId = node.parentId;
      } else {
        this.parentId.set(node.parentId);
      }
    }

    if (node.type === 'default-group' && node.color) {
      if (isDynamicNode(node)) {
        this.color = node.color;
      } else {
        this.color.set(node.color);
      }
    }

    if (node.type === 'default-group' && node.resizable) {
      if (isDynamicNode(node)) {
        this.resizable = node.resizable;
      } else {
        this.resizable.set(node.resizable);
      }
    }

    if (node.type === 'html-template') {
      this.context = {
        $implicit: {
          node: node,
          selected: this.selected,
        },
      };
    } else if (node.type === 'template-group') {
      this.context = {
        $implicit: {
          node: node,
          selected: this.selected.asReadonly(),
          width: this.width,
          height: this.height,
        },
      };
    }
  }

  public setPoint(point: Point) {
    this.point.set(point);
  }

  private createTextSignal(): Signal<string> {
    const node = this.node;

    if (node.type === 'default') {
      if (isDynamicNode(node)) {
        return node.text ?? signal('');
      } else {
        return signal(node.text ?? '');
      }
    }

    return signal('');
  }

  private createInternalPointSignal() {
    return isDynamicNode(this.node) ? this.node.point : signal({ x: this.node.point.x, y: this.node.point.y });
  }

  private createWidthSignal(defaultValue: number) {
    return isDynamicNode(this.node)
      ? (this.node.width ?? signal(defaultValue))
      : signal(this.node.width ?? defaultValue);
  }

  private createHeightSignal(defaultValue: number) {
    return isDynamicNode(this.node)
      ? (this.node.height ?? signal(defaultValue))
      : signal(this.node.height ?? defaultValue);
  }
}
