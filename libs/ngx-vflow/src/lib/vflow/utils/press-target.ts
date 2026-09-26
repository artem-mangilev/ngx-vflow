/**
 * What a press inside the flow lands on. This is the single table from which the pane's pan, the node drag, handles
 * and reconnection handles decide whether a press is theirs; the deepest library element on the path wins.
 *
 * | Nearest element on the path                                   | Press starts        |
 * | ------------------------------------------------------------- | ------------------- |
 * | `[data-vflow-no-drag]` (application and resize controls)      | nothing of the flow |
 * | `.vflow-handle` or `.reconnect-handle` nearer than a drag handle | a connection     |
 * | `.vflow-drag-handle`, or a draggable node without drag handles | a node drag        |
 * | anything else, including edges and undraggable nodes          | a pan, unless inside `[data-vflow-no-pan]` |
 */
export interface PressTarget {
  /** Inside `[data-vflow-no-drag]`. */
  readonly control: boolean;
  /** Inside `[data-vflow-no-pan]`. */
  readonly noPan: boolean;
  /** The handle or reconnection handle that is nearer than any drag handle. */
  readonly connection: Element | null;
  /** The drag handle that is nearer than any handle. */
  readonly dragHandle: Element | null;
  /** The node the target belongs to. */
  readonly node: Element | null;
}

const NO_TARGET: PressTarget = { control: false, noPan: false, connection: null, dragHandle: null, node: null };

export function pressTarget(target: EventTarget | null): PressTarget {
  if (!(target instanceof Element)) return NO_TARGET;

  const nearest = target.closest('.vflow-handle, .reconnect-handle, .vflow-drag-handle');
  const isDragHandle = !!nearest?.classList.contains('vflow-drag-handle');

  return {
    control: !!target.closest('[data-vflow-no-drag]'),
    noPan: !!target.closest('[data-vflow-no-pan]'),
    connection: nearest && !isDragHandle ? nearest : null,
    dragHandle: isDragHandle ? nearest : null,
    node: target.closest('.vflow-node'),
  };
}

/** Whether the press may pan the viewport: it lands outside controls, handles and draggable parts of nodes. */
export function isPanPress(press: PressTarget): boolean {
  if (press.control || press.noPan || press.connection) return false;
  const node = press.node;
  if (!node || node.classList.contains('vflow-node--undraggable')) return true;
  return node.classList.contains('vflow-node--drag-handles-only') && !press.dragHandle;
}

/** Whether the press may drag its node, given whether the node has drag handles. */
export function isNodeDragPress(press: PressTarget, hasDragHandles: boolean): boolean {
  if (press.control || press.connection) return false;
  return hasDragHandles ? press.dragHandle !== null : true;
}
