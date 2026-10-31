import { HandleModel, createHandleMeasureContext } from './handle.model';

/**
 * Measures one handle on its own, as the node's handles controller does for all of them. Not part of the library
 * bundle: only specs import this file.
 */
export function syncHandle(handle: HandleModel, zoom = 1): void {
  const nodeElement = handle.parentNode.nodeElement();
  if (!nodeElement) return;
  handle.applyMeasurement(handle.measure(createHandleMeasureContext(nodeElement, zoom)));
}
