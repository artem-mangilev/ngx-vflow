/** Keys held to change what a pointer gesture does while they are down. */
export type KeyboardModifierName = 'selection' | 'multiSelection' | 'panActivation' | 'zoomActivation';

/** Commands that run once per key press on a focused entity wrapper or on the graph container. */
export type KeyboardCommandName =
  | 'select'
  | 'clearSelection'
  | 'delete'
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'panUp'
  | 'panDown'
  | 'panLeft'
  | 'panRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'fitView';

/**
 * Keys of the graph, in two sections: `modifiers` stay active while held and change pointer gestures, `commands`
 * run on a press. Each entry is a list of alternative keys, not a chord. Omitted entries keep their defaults and an
 * empty list disables an entry.
 */
export interface KeyboardShortcuts {
  modifiers?: Partial<Record<KeyboardModifierName, string[]>>;
  commands?: Partial<Record<KeyboardCommandName, string[]>>;
}
