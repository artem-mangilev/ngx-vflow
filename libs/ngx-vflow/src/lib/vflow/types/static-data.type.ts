/** Data type of one static node or edge; one without `data` adds nothing to a union. */
type StaticEntityData<E> = E extends { data?: infer D } ? (unknown extends D ? never : D) : never;

/**
 * Union of the data types of static nodes or edges, or `unknown` when none of them has `data`. `createNodes()` and
 * `createEdges()` type their result with it when called without a type argument.
 */
export type StaticData<E> = [StaticEntityData<E>] extends [never] ? unknown : StaticEntityData<E>;
