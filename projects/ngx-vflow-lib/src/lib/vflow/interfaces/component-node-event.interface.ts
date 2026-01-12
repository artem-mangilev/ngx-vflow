import { EventEmitter, OutputRef } from '@angular/core';
import { CustomNodeComponent } from '../public-components/custom-node/custom-node.component';

type EventInfo<T> = T extends EventEmitter<infer U> | OutputRef<infer U> ? U : never;

type EventKeys<T> = {
  [K in keyof T]: T[K] extends EventEmitter<any> | OutputRef<any> ? K : never;
}[keyof T];

type EventShape<T, K extends keyof T> = {
  [P in K]: { eventName: P; eventPayload: EventInfo<T[P]> };
}[K];

type EventsFromComponent<T> = EventShape<T, EventKeys<T>>;

/**
 * Event of custom component node
 *
 * Generic accepts array of custom components and merge their event emitters for type-safe
 * event handling
 *
 * @experimental
 */
export type ComponentNodeEvent<T extends CustomNodeComponent[]> = { nodeId: string } & {
  [I in keyof T]: EventsFromComponent<T[I]>;
}[number];

export type AnyComponentNodeEvent = {
  nodeId: string;
  eventName: string;
  eventPayload: unknown;
};
