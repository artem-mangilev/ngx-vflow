import { getOS } from './get-os';

/** Modifier flags of a keyboard event, named as UI Events and `aria-keyshortcuts` name them. */
export type KeyboardModifierFlag = 'control' | 'meta' | 'alt' | 'shift';

/** A shortcut binding split into its modifiers and its key, ready to compare against a keyboard event. */
export interface ParsedBinding {
  /** Lowercased key, compared against both `KeyboardEvent.key` and `KeyboardEvent.code` of the event. */
  key: string;
  /** Modifiers the event must carry, besides the primary one when `mod` is set. */
  modifiers: KeyboardModifierFlag[];
  /** The binding named `Mod`, which resolves to Meta on macOS and Control elsewhere. */
  mod: boolean;
}

export interface MatchBindingOptions {
  /** Defaults to the platform of the current document. */
  mac?: boolean;
  /** Modifiers the binding tolerates in any state, whatever the event carries. */
  ignoreModifiers?: Iterable<KeyboardModifierFlag>;
}

const FLAGS: KeyboardModifierFlag[] = ['control', 'meta', 'alt', 'shift'];

const MODIFIER_TOKENS: Record<string, KeyboardModifierFlag | 'mod'> = {
  control: 'control',
  meta: 'meta',
  alt: 'alt',
  shift: 'shift',
  mod: 'mod',
};

/** Modifier keys by `KeyboardEvent.key` and by `KeyboardEvent.code`, for bindings that name a modifier itself. */
const MODIFIER_KEYS: Record<string, KeyboardModifierFlag | 'mod'> = {
  ...MODIFIER_TOKENS,
  controlleft: 'control',
  controlright: 'control',
  metaleft: 'meta',
  metaright: 'meta',
  osleft: 'meta',
  osright: 'meta',
  altleft: 'alt',
  altright: 'alt',
  shiftleft: 'shift',
  shiftright: 'shift',
};

function onMac(mac?: boolean) {
  if (mac !== undefined) return mac;
  const os = getOS();
  return os === 'macos' || os === 'ios';
}

/**
 * Reads `[<Modifier>+]*<Key>`, for example `Enter`, `Mod+Shift+a`, `+` or `NumpadAdd`. Modifier tokens are `Mod`,
 * `Control`, `Meta`, `Alt` and `Shift`. The key is either a `KeyboardEvent.key` value, which names the character a
 * layout produces, or a `KeyboardEvent.code` value, which names a position on the keyboard; the event matches when
 * either of its own values equals it. Everything is compared without case. Returns `null` for a binding that names
 * something other than a modifier before its key.
 */
export function parseBinding(binding: string): ParsedBinding | null {
  if (typeof binding !== 'string') return null;
  // A binding may be the spacebar itself, which trimming would erase.
  let rest = binding === ' ' ? ' ' : binding.trim();
  if (!rest) return null;

  let rawKey: string;
  if (rest.endsWith('+')) {
    // The key is `+`; `Shift++` names it with a modifier, while a lone trailing `+` is an unfinished binding.
    rawKey = '+';
    rest = rest.slice(0, -1);
    if (rest.endsWith('+')) rest = rest.slice(0, -1);
    else if (rest !== '') return null;
  } else {
    const separator = rest.lastIndexOf('+');
    rawKey = separator === -1 ? rest : rest.slice(separator + 1);
    rest = separator === -1 ? '' : rest.slice(0, separator);
    if (separator !== -1 && rest === '') return null;
  }

  const modifiers: KeyboardModifierFlag[] = [];
  let mod = false;
  for (const token of rest === '' ? [] : rest.split('+')) {
    const flag = MODIFIER_TOKENS[token.trim().toLowerCase()];
    if (!flag) return null;
    if (flag === 'mod') mod = true;
    else if (!modifiers.includes(flag)) modifiers.push(flag);
  }

  const key = rawKey.toLowerCase();
  if (!key) return null;

  return { key, modifiers, mod };
}

/** The key the binding compares against, with `Mod` resolved for the platform. */
export function resolveBindingKey(binding: ParsedBinding, mac?: boolean): string {
  if (binding.key !== 'mod') return binding.key;
  return onMac(mac) ? 'meta' : 'control';
}

/**
 * Whether the event carries the key of the binding, ignoring every modifier. The binding names either the character
 * or the physical key, so both values of the event are compared against it.
 */
export function matchesBindingKey(binding: ParsedBinding, event: KeyboardEvent, mac?: boolean): boolean {
  const wanted = resolveBindingKey(binding, mac);
  return event.key?.toLowerCase() === wanted || event.code?.toLowerCase() === wanted;
}

/**
 * Whether the event runs the binding. Control, Meta and Alt must match exactly, so a binding that names none of them
 * never fires while one is held and browser and system shortcuts keep working. Shift is checked only when the
 * binding names it, because Shift both accelerates movement and produces the characters that bindings name.
 */
export function matchesBinding(
  binding: ParsedBinding,
  event: KeyboardEvent,
  options: MatchBindingOptions = {},
): boolean {
  const mac = onMac(options.mac);
  if (!matchesBindingKey(binding, event, mac)) return false;

  const required = new Set<KeyboardModifierFlag>(binding.modifiers);
  if (binding.mod) required.add(mac ? 'meta' : 'control');
  const ignored = new Set<KeyboardModifierFlag>(options.ignoreModifiers ?? []);
  if (!required.has('shift')) ignored.add('shift');

  const held: Record<KeyboardModifierFlag, boolean> = {
    control: event.ctrlKey,
    meta: event.metaKey,
    alt: event.altKey,
    shift: event.shiftKey,
  };
  return FLAGS.every((flag) => ignored.has(flag) || held[flag] === required.has(flag));
}

/** The modifier a binding stands for when it names a modifier key itself, or `null` for an ordinary key. */
export function bindingModifierFlag(binding: ParsedBinding, mac?: boolean): KeyboardModifierFlag | null {
  const flag = MODIFIER_KEYS[binding.key];
  if (!flag) return null;
  return flag === 'mod' ? (onMac(mac) ? 'meta' : 'control') : flag;
}

/** A stable spelling of a binding, for comparing two entries. */
export function canonicalBinding(binding: ParsedBinding): string {
  const modifiers = [...binding.modifiers].sort();
  if (binding.mod) modifiers.unshift('mod' as KeyboardModifierFlag);
  return `${modifiers.join('+')}|${binding.key}`;
}
