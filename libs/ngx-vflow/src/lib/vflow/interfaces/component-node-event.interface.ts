import { EventEmitter, OutputRef, Type } from '@angular/core';

type EventInfo<T> = T extends EventEmitter<infer U> | OutputRef<infer U> ? U : never;

/** Names of the public outputs of a component class; `keyof` does not see protected ones, which emit all the same. */
type EventKeys<T> = {
  [K in keyof T & string]: T[K] extends EventEmitter<any> | OutputRef<any> ? K : never;
}[keyof T & string];

type EventShape<T, K extends keyof T & string> = {
  [P in K]: { component: Type<T>; eventName: P; eventPayload: EventInfo<T[P]> };
}[K];

/** Union of `{ component, eventName, eventPayload }` for every output declared on a component class. */
export type ComponentOutputEvent<T> = EventShape<T, EventKeys<T>>;

/**
 * Event of a component node, narrowed to the outputs of the given component classes: `eventName` is the property
 * name of one of their outputs and `eventPayload` its type. {@link isComponentNodeEvent} narrows an
 * {@link AnyComponentNodeEvent} to it.
 */
export type ComponentNodeEvent<T extends object[]> = { nodeId: string } & {
  [I in keyof T]: ComponentOutputEvent<T[I]>;
}[number];

/** Payload of `(componentNodeEvent)`: an output of a component node, before narrowing. */
export interface AnyComponentNodeEvent {
  nodeId: string;
  /** The component class that emitted the event. */
  component: Type<unknown>;
  /** Property name of the output on the component class. */
  eventName: string;
  eventPayload: unknown;
}

/**
 * Whether the event comes from a node rendered by `component`; narrows it to the outputs of that class.
 *
 * ```ts
 * onNodeEvent(event: AnyComponentNodeEvent) {
 *   if (isComponentNodeEvent(event, TaskNodeComponent) && event.eventName === 'done') {
 *     event.eventPayload; // the type of `TaskNodeComponent.done`
 *   }
 * }
 * ```
 */
export function isComponentNodeEvent<C extends object>(
  event: AnyComponentNodeEvent,
  component: Type<C>,
): event is ComponentNodeEvent<[C]> {
  return event.component === component;
}
