/**
 * The node components registered with `withNodeComponents()`, by key. Empty here; an application that wants the keys
 * in `Node.component` checked augments it:
 *
 * ```ts
 * declare module 'ngx-vflow' {
 *   interface VflowNodeComponents {
 *     task: typeof TaskNode;
 *     decision: typeof DecisionNode;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VflowNodeComponents {}

/** The edge components registered with `withEdgeComponents()`, by key; augmented like {@link VflowNodeComponents}. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VflowEdgeComponents {}

/** A key of {@link VflowNodeComponents}: any string until the interface is augmented. */
export type NodeComponentKey = keyof VflowNodeComponents extends never ? string : keyof VflowNodeComponents & string;

/** A key of {@link VflowEdgeComponents}: any string until the interface is augmented. */
export type EdgeComponentKey = keyof VflowEdgeComponents extends never ? string : keyof VflowEdgeComponents & string;
