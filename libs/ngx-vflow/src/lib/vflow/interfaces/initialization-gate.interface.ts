import { InjectionToken } from '@angular/core';

/**
 * Holds the initialization of the flow until the graph is prepared for its first paint, such as laid out. A
 * directive on the `vflow` element provides itself as a gate:
 *
 * ```ts
 * @Directive({
 *   selector: 'vflow[myLayout]',
 *   providers: [{ provide: VFLOW_INITIALIZATION_GATE, useExisting: MyLayout }],
 * })
 * export class MyLayout implements VflowInitializationGate {
 *   onMeasured(ready: () => void): void {
 *     this.placeNodes().then(ready, ready);
 *   }
 * }
 * ```
 */
export interface VflowInitializationGate {
  /**
   * Called once by the flow, when it has a size and every node is measured. Until `ready` is called the graph
   * stays unpainted and `initialized` is not emitted, so call it on failure too. A DOM without layout, such as
   * jsdom, never calls this.
   */
  onMeasured(ready: () => void): void;
}

/** The gate of a flow, provided on its element. */
export const VFLOW_INITIALIZATION_GATE = new InjectionToken<VflowInitializationGate>('VFLOW_INITIALIZATION_GATE');
