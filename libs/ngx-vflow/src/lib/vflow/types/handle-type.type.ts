export type HandleType = 'source' | 'target';

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
