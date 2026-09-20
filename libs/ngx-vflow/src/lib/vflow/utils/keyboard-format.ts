import { KeyboardModifierFlag, ParsedBinding, isMacPlatform } from './keyboard-binding';

/** Display names for keys, looked up by the binding in lower case. */
export type KeyNameMap = Record<string, string>;

const ORDER: KeyboardModifierFlag[] = ['control', 'meta', 'alt', 'shift'];

/** Words rather than glyphs: this text is read out, and a screen reader spells a glyph unpredictably. */
const MAC_WORDS: Record<KeyboardModifierFlag, string> = {
  control: 'Control',
  meta: 'Command',
  alt: 'Option',
  shift: 'Shift',
};

const PC_WORDS: Record<KeyboardModifierFlag, string> = {
  control: 'Ctrl',
  meta: 'Meta',
  alt: 'Alt',
  shift: 'Shift',
};

/** Modifier names of the `aria-keyshortcuts` grammar, which are the UI Events ones. */
const ARIA_WORDS: Record<KeyboardModifierFlag, string> = {
  control: 'Control',
  meta: 'Meta',
  alt: 'Alt',
  shift: 'Shift',
};

function primary(mac: boolean): KeyboardModifierFlag {
  return mac ? 'meta' : 'control';
}

function keyLabel(binding: ParsedBinding, names: KeyNameMap, mac: boolean) {
  const override = names[binding.key];
  if (override) return override;
  if (binding.key === 'mod') return (mac ? MAC_WORDS : PC_WORDS)[primary(mac)];
  if (binding.key === ' ') return 'Space';
  return binding.source.length === 1 ? binding.source.toUpperCase() : binding.source;
}

/** One binding as people read it: `Enter`, `Space`, `+`, `Command+Shift+A`. */
export function formatBinding(binding: ParsedBinding, names: KeyNameMap = {}, mac = isMacPlatform()): string {
  const words = mac ? MAC_WORDS : PC_WORDS;
  const parts = binding.mod ? [names[primary(mac)] ?? words[primary(mac)]] : [];
  for (const flag of ORDER) {
    if (binding.modifiers.includes(flag)) parts.push(names[flag] ?? words[flag]);
  }
  parts.push(keyLabel(binding, names, mac));
  return parts.join('+');
}

/** Joins bindings into one phrase, `Enter or Space`, with a word an application may translate. */
export function formatBindings(bindings: readonly ParsedBinding[], names: KeyNameMap = {}, mac = isMacPlatform()) {
  const labels = [...new Set(bindings.map((binding) => formatBinding(binding, names, mac)))];
  if (labels.length < 2) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} ${names['or'] ?? 'or'} ${labels[labels.length - 1]}`;
}

/**
 * One binding in the `aria-keyshortcuts` grammar: modifiers first under their UI Events names, then the key, with
 * the plus sign and the spacebar spelled out as the specification requires.
 */
export function formatAriaShortcut(binding: ParsedBinding, mac = isMacPlatform()): string {
  const parts = binding.mod ? [ARIA_WORDS[primary(mac)]] : [];
  for (const flag of ORDER) {
    if (binding.modifiers.includes(flag)) parts.push(ARIA_WORDS[flag]);
  }
  const key = binding.key === 'mod' ? ARIA_WORDS[primary(mac)] : binding.key === ' ' ? 'Space' : binding.source;
  parts.push(key === '+' ? 'Plus' : key);
  return parts.join('+');
}
