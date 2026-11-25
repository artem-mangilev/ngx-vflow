import { InjectionToken, inject } from '@angular/core';
import type { ConnectionRef } from '../interfaces/template-context.interface';

export const CONNECTION_REF = new InjectionToken<ConnectionRef>('CONNECTION_REF');

/**
 * Returns the connection in progress a `vConnection` template is rendered for: the same object the template gets
 * as its context, for a component or a directive inside it.
 */
export function injectConnection(): ConnectionRef {
  return inject(CONNECTION_REF);
}
