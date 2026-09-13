import { ComponentOutputEvent } from './component-node-event.interface';

/**
 * Event of a component edge. `eventName` is the property name of the output on the component class.
 *
 * The generic accepts the edge component classes of the flow and merges their outputs for type-safe
 * event handling.
 */
export type ComponentEdgeEvent<T extends object[]> = { edgeId: string } & {
  [I in keyof T]: ComponentOutputEvent<T[I]>;
}[number];

export type AnyComponentEdgeEvent = {
  edgeId: string;
  eventName: string;
  eventPayload: unknown;
};
