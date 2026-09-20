import { ElementRef, Injectable, inject, isDevMode, signal } from '@angular/core';
import { KeyboardCommandName, KeyboardModifierName, KeyboardShortcuts } from '../types/keyboard-shortcuts.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, fromEvent, merge } from 'rxjs';
import { DeleteRequest } from '../interfaces/delete-request.interface';
import { getOS } from '../utils/get-os';
import {
  KeyboardModifierFlag,
  ParsedBinding,
  bindingModifierFlag,
  canonicalBinding,
  matchesBinding,
  matchesBindingKey,
  parseBinding,
  resolveBindingKey,
} from '../utils/keyboard-binding';

interface RawShortcuts {
  modifiers: Record<KeyboardModifierName, string[]>;
  commands: Record<KeyboardCommandName, string[]>;
}

interface ShortcutState {
  raw: RawShortcuts;
  modifiers: Record<KeyboardModifierName, ParsedBinding[]>;
  commands: Record<KeyboardCommandName, ParsedBinding[]>;
  /** Modifier flags the multiselection binding occupies, which the select command therefore tolerates. */
  selectTolerates: KeyboardModifierFlag[];
}

/** Modifiers armed only outside editable content, so typing in a field cannot start a viewport gesture. */
const GESTURE_MODIFIERS: KeyboardModifierName[] = ['panActivation', 'zoomActivation'];

/** Entries of the former flat object and where they moved, for the dev-mode report. */
const MOVED_ENTRIES: Record<string, string> = {
  selection: 'modifiers.selection',
  multiSelection: 'modifiers.multiSelection',
  pan: 'modifiers.panActivation',
  zoom: 'modifiers.zoomActivation',
  delete: 'commands.delete',
  zoomIn: 'commands.zoomIn',
  zoomOut: 'commands.zoomOut',
  fitView: 'commands.fitView',
};

function defaultShortcuts(): RawShortcuts {
  return {
    modifiers: {
      selection: ['Shift'],
      multiSelection: ['Mod'],
      panActivation: [],
      zoomActivation: [],
    },
    commands: {
      select: ['Enter', 'Space'],
      clearSelection: ['Escape'],
      delete: ['Delete', 'Backspace'],
      moveUp: ['ArrowUp'],
      moveDown: ['ArrowDown'],
      moveLeft: ['ArrowLeft'],
      moveRight: ['ArrowRight'],
      panUp: ['ArrowUp'],
      panDown: ['ArrowDown'],
      panLeft: ['ArrowLeft'],
      panRight: ['ArrowRight'],
      zoomIn: ['+', '=', 'NumpadAdd'],
      zoomOut: ['-', 'NumpadSubtract'],
      fitView: ['0', 'Numpad0'],
    },
  };
}

/** Keeps the supplied entries of one section, drops omitted ones and tolerates a non-array from JavaScript. */
function suppliedEntries(section: Partial<Record<string, string[]>> = {}): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(section)
      .filter(([, keys]) => keys !== undefined)
      .map(([name, keys]) => [name, Array.isArray(keys) ? keys : []]),
  );
}

function reportMovedEntries(shortcuts: KeyboardShortcuts) {
  for (const name of Object.keys(shortcuts ?? {})) {
    if (name === 'modifiers' || name === 'commands') continue;
    const moved = MOVED_ENTRIES[name];
    console.error(
      moved
        ? `[ngx-vflow] keyboardShortcuts.${name} moved to keyboardShortcuts.${moved}; an empty list now disables an entry.`
        : `[ngx-vflow] keyboardShortcuts.${name} is not a shortcut entry; supply the modifiers and commands sections.`,
    );
  }
}

/** Parses one entry, dropping bindings that do not read as `[<Modifier>+]*<Key>` and reporting them in dev mode. */
function parseEntry(section: string, name: string, bindings: string[], held: boolean, report: boolean) {
  return bindings.flatMap((binding) => {
    const parsed = parseBinding(binding);
    if (!parsed) {
      if (report) {
        console.warn(
          `[ngx-vflow] keyboardShortcuts.${section}.${name}: "${binding}" is not a binding; before the key only Mod, Control, Meta, Alt and Shift are allowed.`,
        );
      }
      return [];
    }
    if (held && (parsed.mod || parsed.modifiers.length > 0)) {
      // A modifier entry names one key that is held, so a prefix on it would have nothing to qualify.
      if (report) {
        console.warn(
          `[ngx-vflow] keyboardShortcuts.${section}.${name}: "${binding}" names a held key; its prefixes are ignored.`,
        );
      }
      return [{ ...parsed, mod: false, modifiers: [] }];
    }
    return [parsed];
  });
}

function mapSection<Name extends string>(
  section: Record<Name, string[]>,
  parse: (name: Name, bindings: string[]) => ParsedBinding[],
): Record<Name, ParsedBinding[]> {
  const entries = Object.entries(section) as [Name, string[]][];
  return Object.fromEntries(entries.map(([name, bindings]) => [name, parse(name, bindings)])) as Record<
    Name,
    ParsedBinding[]
  >;
}

function resolveShortcuts(raw: RawShortcuts, mac: boolean): ShortcutState {
  const report = isDevMode();
  const modifiers = mapSection(raw.modifiers, (name, bindings) =>
    parseEntry('modifiers', name, bindings, true, report),
  );
  const commands = mapSection(raw.commands, (name, bindings) => parseEntry('commands', name, bindings, false, report));

  if (report) {
    const held = new Map<string, string>();
    for (const [name, bindings] of Object.entries(modifiers) as [string, ParsedBinding[]][]) {
      for (const binding of bindings) held.set(canonicalBinding(binding), name);
    }
    for (const [name, bindings] of Object.entries(commands) as [string, ParsedBinding[]][]) {
      for (const binding of bindings) {
        const owner = held.get(canonicalBinding(binding));
        if (owner) {
          console.warn(
            `[ngx-vflow] keyboardShortcuts: commands.${name} and modifiers.${owner} share a key; the modifier keeps it.`,
          );
        }
      }
    }
  }

  return {
    raw,
    modifiers,
    commands,
    selectTolerates: modifiers.multiSelection
      .map((binding) => bindingModifierFlag(binding, mac))
      .filter((flag): flag is KeyboardModifierFlag => flag !== null),
  };
}

@Injectable()
export class KeyboardService {
  private host = inject(ElementRef<HTMLElement>, { optional: true })?.nativeElement;
  private mac = getOS() === 'macos' || getOS() === 'ios';
  private state = signal<ShortcutState>(resolveShortcuts(defaultShortcuts(), this.mac));
  /** Keyboard deletion requests from focused entity wrappers; the flow exposes them as an output. */
  public deleteRequest$ = new Subject<DeleteRequest>();
  /** Keys currently down, as lowercased code to lowercased key. */
  private pressed = new Map<string, string>();
  /** Codes of the keys that may arm a viewport gesture, which excludes presses inside editable content. */
  private gesture = new Set<string>();
  #modifiersActive$ = new BehaviorSubject<Record<KeyboardModifierName, boolean>>({
    selection: false,
    multiSelection: false,
    panActivation: false,
    zoomActivation: false,
  });
  public modifiersActive$ = this.#modifiersActive$.asObservable();

  constructor() {
    merge(
      fromEvent<KeyboardEvent>(document, 'keydown'),
      fromEvent<KeyboardEvent>(document, 'keyup'),
      fromEvent(window, 'blur'),
    )
      .pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof KeyboardEvent) {
          const target = event.composedPath()[0] ?? event.target;
          const editable =
            target instanceof Element &&
            !!target.closest(
              'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-vflow-no-keyboard]',
            );
          const code = event.code?.toLowerCase() ?? '';
          if (event.type === 'keydown') {
            this.pressed.set(code, event.key?.toLowerCase() ?? '');
            if (!editable) this.gesture.add(code);
            else this.gesture.clear();
          } else {
            this.pressed.delete(code);
            this.gesture.delete(code);
          }
          this.updateActive();
          if (
            event.type === 'keydown' &&
            code === 'space' &&
            this.isActiveModifier('panActivation') &&
            (this.host?.contains(target as Node) || this.host?.matches(':hover')) &&
            !(target instanceof Element && target.closest('button, a'))
          ) {
            event.preventDefault();
          }
        } else {
          this.pressed.clear();
          this.gesture.clear();
          this.updateActive();
        }
      });
  }

  /** Whether a key bound as a modifier is down. Modifier entries name one held key and constrain nothing else. */
  private isHeld(binding: ParsedBinding, gestureOnly: boolean) {
    const wanted = resolveBindingKey(binding, this.mac);
    for (const [code, key] of this.pressed) {
      if (gestureOnly && !this.gesture.has(code)) continue;
      if (key === wanted || code === wanted) return true;
    }
    return false;
  }

  private updateActive() {
    const { modifiers } = this.state();
    const active = { ...this.#modifiersActive$.value };
    for (const name of Object.keys(active) as KeyboardModifierName[]) {
      active[name] = modifiers[name].some((binding) => this.isHeld(binding, GESTURE_MODIFIERS.includes(name)));
    }
    this.#modifiersActive$.next(active);
  }

  public setShortcuts(shortcuts: KeyboardShortcuts) {
    if (isDevMode()) reportMovedEntries(shortcuts);
    this.state.update(({ raw }) =>
      resolveShortcuts(
        {
          modifiers: { ...raw.modifiers, ...suppliedEntries(shortcuts?.modifiers) },
          commands: { ...raw.commands, ...suppliedEntries(shortcuts?.commands) },
        },
        this.mac,
      ),
    );
    this.updateActive();
  }

  public isActiveModifier(name: KeyboardModifierName) {
    return this.#modifiersActive$.value[name];
  }

  /** Whether the pressed key is bound as a modifier, so entity commands leave it to the gesture layer. */
  public isModifierKey(event: KeyboardEvent) {
    return Object.values(this.state().modifiers).some((bindings) =>
      bindings.some((binding) => matchesBindingKey(binding, event, this.mac)),
    );
  }

  /** Whether the event runs the command. Reactive, so descriptions follow the configuration. */
  public isCommand(command: KeyboardCommandName, event: KeyboardEvent) {
    const state = this.state();
    // Holding the multiselection modifier turns selection into a toggle, so it must not block the select command.
    const ignoreModifiers = command === 'select' ? state.selectTolerates : undefined;
    return state.commands[command].some((binding) =>
      matchesBinding(binding, event, { mac: this.mac, ignoreModifiers }),
    );
  }

  /** Whether the command has any key. Reactive. */
  public hasCommand(command: KeyboardCommandName) {
    return this.state().commands[command].length > 0;
  }
}
