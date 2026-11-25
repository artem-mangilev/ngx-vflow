/**
 * Adds an event listener and returns the function that removes it. A listener is not removed through an
 * `AbortSignal`: with zone.js in jsdom, `addEventListener` with the `signal` option throws.
 */
export function listen<K extends keyof GlobalEventHandlersEventMap>(
  target: EventTarget,
  type: K,
  listener: (event: GlobalEventHandlersEventMap[K]) => void,
  options?: AddEventListenerOptions,
): () => void {
  target.addEventListener(type, listener as EventListener, options);

  return () => target.removeEventListener(type, listener as EventListener, options);
}
