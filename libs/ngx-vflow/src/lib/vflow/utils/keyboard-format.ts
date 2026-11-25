import { KeyboardModifierFlag, ParsedBinding, isMacPlatform } from './keyboard-binding';

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

function primary(mac: boolean): KeyboardModifierFlag {
  return mac ? 'meta' : 'control';
}

function keyLabel(binding: ParsedBinding, mac: boolean) {
  if (binding.key === 'mod') return (mac ? MAC_WORDS : PC_WORDS)[primary(mac)];
  if (binding.key === ' ') return 'Space';
  return binding.source.length === 1 ? binding.source.toUpperCase() : binding.source;
}

/** One binding as people read it: `Enter`, `Space`, `+`, `Command+Shift+A`. */
export function formatBinding(binding: ParsedBinding, mac = isMacPlatform()): string {
  const words = mac ? MAC_WORDS : PC_WORDS;
  const parts = binding.mod ? [words[primary(mac)]] : [];
  for (const flag of ORDER) {
    if (binding.modifiers.includes(flag)) parts.push(words[flag]);
  }
  parts.push(keyLabel(binding, mac));
  return parts.join('+');
}

/** Joins bindings into one phrase, `Enter or Space`. */
export function formatBindings(bindings: readonly ParsedBinding[], mac = isMacPlatform()) {
  const labels = [...new Set(bindings.map((binding) => formatBinding(binding, mac)))];
  if (labels.length < 2) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
}
