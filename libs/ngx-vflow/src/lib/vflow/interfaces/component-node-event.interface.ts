import { EventEmitter, OutputRef } from '@angular/core';

type EventInfo<T> = T extends EventEmitter<infer U> | OutputRef<infer U> ? U : never;

type EventKeys<T> = {
  [K in keyof T]: T[K] extends EventEmitter<any> | OutputRef<any> ? K : never;
}[keyof T];

type EventShape<T, K extends keyof T> = {
  [P in K]: { eventName: P; eventPayload: EventInfo<T[P]> };
}[K];

/** Union of `{ eventName, eventPayload }` for every output declared on a component class. */
export type ComponentOutputEvent<T> = EventShape<T, EventKeys<T>>;

/**
 * Event of a component node. `eventName` is the property name of the output on the component class.
 *
 * The generic accepts the component classes of the flow and merges their outputs for type-safe
 * event handling.
 */
export type ComponentNodeEvent<T extends object[]> = { nodeId: string } & {
  [I in keyof T]: ComponentOutputEvent<T[I]>;
}[number];

export type AnyComponentNodeEvent = {
  nodeId: string;
  eventName: string;
  eventPayload: unknown;
};
