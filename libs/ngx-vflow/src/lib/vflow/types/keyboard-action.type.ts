/** Modifier-like actions that stay active while a bound key is held. */
export type KeyboardAction = 'multiSelection' | 'selection' | 'pan' | 'zoom';

/** Commands that fire once per press of a bound key on a focused entity wrapper. */
export type KeyboardCommand = 'delete';

export type KeyboardShortcuts = Partial<Record<KeyboardAction | KeyboardCommand, null | string[]>>;
