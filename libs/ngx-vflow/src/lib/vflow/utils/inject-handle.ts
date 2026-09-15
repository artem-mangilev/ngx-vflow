import { InjectionToken, Signal, inject } from '@angular/core';
import { Position } from '../types/position.type';
import { HandleState, HandleType } from '../types/handle-type.type';

/**
 * What a handle element and its content read about the handle. Provided by the `vflowHandle` directive, so a
 * component that applies it through `hostDirectives` gets it with {@link injectHandle}.
 */
export interface HandleRef {
  state: Signal<HandleState>;
  type: Signal<HandleType>;
  position: Signal<Position>;
  id: Signal<string | undefined>;
  canStart: Signal<boolean>;
  canAccept: Signal<boolean>;
}

export const HANDLE_REF = new InjectionToken<HandleRef>('HANDLE_REF');

/** Returns the handle of the current element or of the closest ancestor element that is a handle. */
export function injectHandle(): HandleRef {
  return inject(HANDLE_REF);
}
