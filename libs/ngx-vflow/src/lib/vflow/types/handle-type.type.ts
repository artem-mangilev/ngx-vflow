import { Position } from './position.type';

/** `any` starts and accepts connections in either direction; the edge direction is the direction of the gesture. */
export type HandleType = 'source' | 'target' | 'any';

/**
 * Where the connection point of a handle is, relative to its node. A side is fixed. `auto` is the middle of the
 * node side that faces the other end of each edge; `center` is the node center. With `auto` and `center` the
 * element is only the interaction surface: it is not positioned, and its own box is not measured.
 */
export type HandlePosition = Position | 'auto' | 'center';

/**
 * Feedback for the connection in progress: `connecting` on the handle it is dragged from, `valid` or `invalid`
 * while the handle is the candidate.
 */
export type HandleState = 'connecting' | 'valid' | 'invalid' | 'idle';

/**
 * `auto`: the handle directive positions its element on the node side next to the center of the parent element.
 * `manual`: the application positions the element; the connection point is read from its box.
 */
export type HandleLayout = 'auto' | 'manual';
