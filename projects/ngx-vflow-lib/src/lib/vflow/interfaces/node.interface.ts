import { signal, Type, WritableSignal } from '@angular/core';
import { Point } from './point.interface';
import { NodePreview } from './node-preview.interface';
import { isCallable } from '../utils/is-callable';
import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';
import { isCustomNodeComponent } from '../utils/is-vflow-component';
import { UnwrapSignal } from '../types/unwrap-signal.type';
import { isDefined } from '../utils/is-defined';

export const NODE_DEFAULTS = {
  point: { x: 0, y: 0 },
  width: 100,
  height: 50,
  draggable: true,
  parentId: null,
  preview: { style: {} },
  selected: false,
  color: '#1b262c',
  resizable: false,
  text: '',
  data: {},
};

export type Node<T = any> =
  | DefaultNode
  | HtmlTemplateNode<T>
  | SvgTemplateNode<T>
  | ComponentNode<T>
  | DefaultGroupNode
  | TemplateGroupNode<T>;

export interface SharedNode {
  id: string;
  point: WritableSignal<Point>;
  draggable?: WritableSignal<boolean>;
  parentId?: WritableSignal<string | null>;
  preview?: WritableSignal<NodePreview>;
  selected?: WritableSignal<boolean>;
  controlledByResizer?: WritableSignal<boolean>;
}

export interface DefaultNode extends SharedNode {
  type: 'default';
  text?: WritableSignal<string>;
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
}

export interface HtmlTemplateNode<T = any> extends SharedNode {
  type: 'html-template';
  data?: WritableSignal<T>;
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
}

export interface SvgTemplateNode<T = any> extends SharedNode {
  type: 'svg-template';
  width: WritableSignal<number>;
  height: WritableSignal<number>;
  data?: WritableSignal<T>;
}

export interface DefaultGroupNode extends SharedNode {
  type: 'default-group';
  width: WritableSignal<number>;
  height: WritableSignal<number>;
  color?: WritableSignal<string>;
  resizable?: WritableSignal<boolean>;
}

export interface TemplateGroupNode<T = any> extends SharedNode {
  type: 'template-group';
  width: WritableSignal<number>;
  height: WritableSignal<number>;
  data?: WritableSignal<T>;
}

export interface ComponentNode<T = any> extends SharedNode {
  type: Type<CustomNodeComponent<T>> | (() => Promise<Type<CustomNodeComponent<T>>>);
  data?: WritableSignal<T>;
  width?: WritableSignal<number>;
  height?: WritableSignal<number>;
}

export function isComponentNode<T>(node: Node<T>): node is ComponentNode<T> {
  if (isCustomNodeComponent(node.type)) {
    return true;
  }

  // Check if the type is a function with dynamic import
  return isCallable(node.type);
}

export function isTemplateNode<T>(node: Node<T>): node is HtmlTemplateNode<T> {
  return node.type === 'html-template';
}

export function isSvgTemplateNode<T>(node: Node<T>): node is SvgTemplateNode<T> {
  return node.type === 'svg-template';
}

export function isDefaultNode(node: Node): node is DefaultNode {
  return node.type === 'default';
}

export function isDefaultGroupNode(node: Node): node is DefaultGroupNode {
  return node.type === 'default-group';
}

export function isTemplateGroupNode<T>(node: Node<T>): node is TemplateGroupNode<T> {
  return node.type === 'template-group';
}

export type StaticNode<T = unknown> =
  | UnwrapSignal<DefaultNode>
  | UnwrapSignal<HtmlTemplateNode<T>>
  | UnwrapSignal<SvgTemplateNode<T>>
  | UnwrapSignal<ComponentNode<T>>
  | UnwrapSignal<DefaultGroupNode>
  | UnwrapSignal<TemplateGroupNode<T>>;

interface CreateNodeOptions {
  useDefaults: boolean;
}

function createBaseNode(node: UnwrapSignal<SharedNode>, useDefaults: boolean) {
  if (useDefaults) {
    return {
      id: node.id,
      point: signal(node.point),
      draggable: signal(node.draggable ?? NODE_DEFAULTS.draggable),
      parentId: signal(node.parentId ?? NODE_DEFAULTS.parentId),
      preview: signal(node.preview ?? NODE_DEFAULTS.preview),
      selected: signal(node.selected ?? NODE_DEFAULTS.selected),
    };
  } else {
    return {
      id: node.id,
      point: signal(node.point),
      draggable: isDefined(node.draggable) ? signal(node.draggable) : undefined,
      parentId: isDefined(node.parentId) ? signal(node.parentId) : undefined,
      preview: isDefined(node.preview) ? signal(node.preview) : undefined,
      selected: isDefined(node.selected) ? signal(node.selected) : undefined,
    };
  }
}

// Перегрузка с useDefaults: true (или без опций) - возвращает Required<Node<T>>
export function createNode<T>(node: StaticNode<T>): Required<Node<T>>;
export function createNode<T>(node: StaticNode<T>, options: { useDefaults: true }): Required<Node<T>>;
// Перегрузка с useDefaults: false - возвращает Node<T>
export function createNode<T>(node: StaticNode<T>, options: { useDefaults: false }): Node<T>;
// Реализация
export function createNode<T>(
  node: StaticNode<T>,
  options: CreateNodeOptions = { useDefaults: true },
): Node<T> | Required<Node<T>> {
  const baseNode = createBaseNode(node, options.useDefaults);

  if (node.type === 'default') {
    if (options.useDefaults) {
      return {
        ...baseNode,
        type: 'default' as const,
        text: signal(node.text ?? ''),
        width: signal(node.width ?? NODE_DEFAULTS.width),
        height: signal(node.height ?? NODE_DEFAULTS.height),
      };
    } else {
      return {
        ...baseNode,
        type: 'default' as const,
        text: isDefined(node.text) ? signal(node.text) : undefined,
        width: isDefined(node.width) ? signal(node.width) : undefined,
        height: isDefined(node.height) ? signal(node.height) : undefined,
      };
    }
  }

  if (node.type === 'html-template') {
    if (options.useDefaults) {
      return {
        ...baseNode,
        type: 'html-template' as const,
        data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
        width: signal(node.width ?? NODE_DEFAULTS.width),
        height: signal(node.height ?? NODE_DEFAULTS.height),
      };
    } else {
      return {
        ...baseNode,
        type: 'html-template' as const,
        data: isDefined(node.data) ? (signal(node.data) as WritableSignal<T>) : undefined,
        width: isDefined(node.width) ? signal(node.width) : undefined,
        height: isDefined(node.height) ? signal(node.height) : undefined,
      };
    }
  }

  if (node.type === 'svg-template') {
    const width = signal(node.width);
    const height = signal(node.height);

    if (options.useDefaults) {
      return {
        ...baseNode,
        type: 'svg-template' as const,
        width,
        height,
        data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
      };
    } else {
      return {
        ...baseNode,
        type: 'svg-template' as const,
        width,
        height,
        data: isDefined(node.data) ? (signal(node.data) as WritableSignal<T>) : undefined,
      };
    }
  }

  if (node.type === 'default-group') {
    const width = signal(node.width);
    const height = signal(node.height);

    if (options.useDefaults) {
      return {
        ...baseNode,
        type: 'default-group' as const,
        width,
        height,
        color: signal(node.color ?? NODE_DEFAULTS.color),
        resizable: signal(node.resizable ?? NODE_DEFAULTS.resizable),
      };
    } else {
      return {
        ...baseNode,
        type: 'default-group' as const,
        width,
        height,
        color: isDefined(node.color) ? signal(node.color) : undefined,
        resizable: isDefined(node.resizable) ? signal(node.resizable) : undefined,
      };
    }
  }

  if (node.type === 'template-group') {
    const width = signal(node.width);
    const height = signal(node.height);

    if (options.useDefaults) {
      return {
        ...baseNode,
        type: 'template-group' as const,
        width,
        height,
        data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
      };
    } else {
      return {
        ...baseNode,
        type: 'template-group' as const,
        width,
        height,
        data: isDefined(node.data) ? (signal(node.data) as WritableSignal<T>) : undefined,
      };
    }
  }

  if (isCustomNodeComponent(node.type) || isCallable(node.type)) {
    if (options.useDefaults) {
      return {
        ...baseNode,
        type: node.type,
        data: signal(node.data ?? (NODE_DEFAULTS.data as T)),
        width: signal(node.width ?? NODE_DEFAULTS.width),
        height: signal(node.height ?? NODE_DEFAULTS.height),
      };
    } else {
      return {
        ...baseNode,
        type: node.type,
        data: isDefined(node.data) ? (signal(node.data) as WritableSignal<T>) : undefined,
        width: isDefined(node.width) ? signal(node.width) : undefined,
        height: isDefined(node.height) ? signal(node.height) : undefined,
      };
    }
  }

  throw new Error(`Unknown node type for node with id ${node.id}`);
}

export function createNodes<T = unknown>(nodes: StaticNode<T>[]): Required<Node<T>>[];
export function createNodes<T = unknown>(nodes: StaticNode<T>[], options: { useDefaults: true }): Required<Node<T>>[];
export function createNodes<T = unknown>(nodes: StaticNode<T>[], options: { useDefaults: false }): Node<T>[];
export function createNodes<T = unknown>(
  nodes: StaticNode<T>[],
  options: CreateNodeOptions = { useDefaults: true },
): Node<T>[] | Required<Node<T>>[] {
  if (options.useDefaults) {
    return nodes.map((node) => createNode(node, { useDefaults: true }));
  } else {
    return nodes.map((node) => createNode(node, { useDefaults: false }));
  }
}
