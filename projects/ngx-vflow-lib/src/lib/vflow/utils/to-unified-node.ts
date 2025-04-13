import { signal, Signal } from '@angular/core';
import { DynamicNode, isDynamicNode, Node } from '../interfaces/node.interface';

export function toUnifiedNode<T>(node: Node<T> | DynamicNode<T>): DynamicNode<T> {
  if (isDynamicNode(node)) {
    return node;
  }

  return {
    ...toSignalProperties(node),
    // non-signal props below
    id: node.id,
    // TODO this actually of incorrect type for component nodes
    type: node.type,
  } as DynamicNode<T>;
}

function toSignalProperties(obj: Record<string, any>): Record<string, Signal<any>> {
  const newObj: Record<string, Signal<any>> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = signal(obj[key]);
    }
  }
  return newObj;
}
