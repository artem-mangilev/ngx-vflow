import { Type, reflectComponentType } from '@angular/core';

/** A decorated component class, as opposed to a factory that lazily imports one. */
export function isComponentClass(value: unknown): value is Type<unknown> {
  return typeof value === 'function' && reflectComponentType(value as Type<unknown>) !== null;
}
