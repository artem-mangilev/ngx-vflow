import { InjectionToken, Provider, Type } from '@angular/core';
import { ConnectionPolicy } from './connection-policy.interface';

/** Registered connection policies: instances, or classes the flow instantiates in its own injector. */
export const VFLOW_CONNECTION_POLICIES = new InjectionToken<(ConnectionPolicy | Type<ConnectionPolicy>)[]>(
  'VFLOW_CONNECTION_POLICIES',
);

/**
 * The providers that register one policy on the connection chain, for the provider list of a feature. A class is
 * created by the `<vflow>` injector, so it can `inject()` the flow's services; a value is used as given.
 */
export function provideConnectionPolicy(entry: ConnectionPolicy | Type<ConnectionPolicy>): Provider[] {
  return [{ provide: VFLOW_CONNECTION_POLICIES, useValue: entry, multi: true }];
}
