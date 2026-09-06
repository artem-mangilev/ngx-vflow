import { StaticNode } from '../interfaces/node.interface';

export function isCallable<T = any>(type: StaticNode<T>['type'] | any): boolean {
  if (typeof type !== 'function') return false;
  return type.apply !== undefined;
}
