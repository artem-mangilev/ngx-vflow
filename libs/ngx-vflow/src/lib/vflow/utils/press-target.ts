/**
 * What a press inside the flow lands on. This is the single table from which the pane's pan, the node drag, handles
 * and reconnection handles decide whether a press is theirs; the deepest library element on the path wins. The
 * roles are data attributes: a class is a hook for styles, never for behaviour.
 *
 * | Nearest element on the path                                                       | Press starts                           |
 * | --------------------------------------------------------------------------------- | -------------------------------------- |
 * | `[data-v-no-drag]` (application and resize controls)                              | nothing of the flow                    |
 * | `[data-v-handle-type]` or `[data-v-reconnect-handle]` nearer than a drag handle   | a connection                           |
 * | `[data-v-drag-handle]`, or a draggable node without drag handles                  | a node drag                            |
 * | anything else, including edges and undraggable nodes                              | a pan, unless inside `[data-v-no-pan]` |
 *
 * A handle that cannot start a connection (`canStart` false) is not a connection target: a press on it belongs to
 * the node, as on any part of the node body, so a node that is a handle as a whole still drags.
 *
 * A node keeps the presses that drag it (its gesture stops their propagation), so a press that reaches the pane
 * from inside a node is one the node declined, and the pane needs no knowledge of the node.
 */
interface PressTarget {
  /** Inside `[data-v-no-drag]`. */
  readonly control: boolean;
  /** Inside `[data-v-no-pan]`. */
  readonly noPan: boolean;
  /** The handle or reconnection handle that is nearer than any drag handle. */
  readonly connection: Element | null;
  /** The drag handle that is nearer than any handle. */
  readonly dragHandle: Element | null;
}

const NO_TARGET: PressTarget = { control: false, noPan: false, connection: null, dragHandle: null };

export function pressTarget(target: EventTarget | null): PressTarget {
  if (!(target instanceof Element)) return NO_TARGET;

  const nearest = target.closest(
    '[data-v-handle-type]:not([data-v-handle-can-start="false"]), [data-v-reconnect-handle], [data-v-drag-handle]',
  );
  const isDragHandle = !!nearest?.hasAttribute('data-v-drag-handle');

  return {
    control: !!target.closest('[data-v-no-drag]'),
    noPan: !!target.closest('[data-v-no-pan]'),
    connection: nearest && !isDragHandle ? nearest : null,
    dragHandle: isDragHandle ? nearest : null,
  };
}

/** Whether the press may pan the viewport: it lands outside controls, handles and `[data-v-no-pan]`. */
export function isPanPress(press: PressTarget): boolean {
  return !press.control && !press.noPan && !press.connection;
}

/** Whether the press may drag its node, given whether the node has drag handles. */
export function isNodeDragPress(press: PressTarget, hasDragHandles: boolean): boolean {
  if (press.control || press.connection) return false;
  return hasDragHandles ? press.dragHandle !== null : true;
}
