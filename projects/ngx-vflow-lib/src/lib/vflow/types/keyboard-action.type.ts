export type KeyboardAction = 'multiSelection' | 'selection';

export type KeyboardShortcuts = Partial<Record<KeyboardAction, null | string[]>>;
