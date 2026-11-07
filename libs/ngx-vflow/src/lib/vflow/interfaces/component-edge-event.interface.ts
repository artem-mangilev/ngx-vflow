import { Type } from '@angular/core';
import { ComponentOutputEvent } from './component-node-event.interface';

/**
 * Event of a component edge, narrowed to the outputs of the given component classes: `eventName` is the property
 * name of one of their outputs and `eventPayload` its type. {@link isComponentEdgeEvent} narrows an
 * {@link AnyComponentEdgeEvent} to it.
 */
export type ComponentEdgeEvent<T extends object[]> = { edgeId: string } & {
  [I in keyof T]: ComponentOutputEvent<T[I]>;
}[number];

/** Payload of `(componentEdgeEvent)`: an output of a component edge, before narrowing. */
export interface AnyComponentEdgeEvent {
  edgeId: string;
  /** The component class that emitted the event. */
  component: Type<unknown>;
  /** Property name of the output on the component class. */
  eventName: string;
  eventPayload: unknown;
}

/** Whether the event comes from an edge rendered by `component`; narrows it to the outputs of that class. */
export function isComponentEdgeEvent<C extends object>(
  event: AnyComponentEdgeEvent,
  component: Type<C>,
): event is ComponentEdgeEvent<[C]> {
  return event.component === component;
}
