export type KeyboardAction = 'multiSelection' | 'selection' | 'pan' | 'zoom';

export type KeyboardShortcuts = Partial<Record<KeyboardAction, null | string[]>>;
