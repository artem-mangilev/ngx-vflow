import { ElementRef, Injectable, inject, isDevMode, signal } from '@angular/core';
import { KeyboardCommandName, KeyboardModifierName, KeyboardShortcuts } from '../types/keyboard-shortcuts.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, fromEvent, merge } from 'rxjs';
import { DeleteRequest } from '../interfaces/delete-request.interface';
import { getOS } from '../utils/get-os';

interface ResolvedShortcuts {
  modifiers: Record<KeyboardModifierName, string[]>;
  commands: Record<KeyboardCommandName, string[]>;
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

function defaultShortcuts(): ResolvedShortcuts {
  const primary = getOS() === 'macos' ? ['MetaLeft', 'MetaRight'] : ['ControlLeft', 'ControlRight'];

  return {
    modifiers: {
      selection: ['ShiftLeft', 'ShiftRight'],
      multiSelection: primary,
      panActivation: [],
      zoomActivation: [],
    },
    commands: {
      select: ['Enter', 'NumpadEnter', 'Space'],
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
      zoomIn: ['Equal', 'NumpadAdd'],
      zoomOut: ['Minus', 'NumpadSubtract'],
      fitView: ['Digit0', 'Numpad0'],
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

@Injectable()
export class KeyboardService {
  private host = inject(ElementRef<HTMLElement>, { optional: true })?.nativeElement;
  private shortcuts = signal<ResolvedShortcuts>(defaultShortcuts());
  /** Keyboard deletion requests from focused entity wrappers; the flow exposes them as an output. */
  public deleteRequest$ = new Subject<DeleteRequest>();
  private pressed = new Set<string>();
  private gestureKeys = new Set<string>();
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
          if (event.type === 'keydown') {
            this.pressed.add(event.code);
            if (!editable) this.gestureKeys.add(event.code);
            else this.gestureKeys.clear();
          } else {
            this.pressed.delete(event.code);
            this.gestureKeys.delete(event.code);
          }
          this.updateActive();
          if (
            event.type === 'keydown' &&
            event.code === 'Space' &&
            this.isActiveModifier('panActivation') &&
            (this.host?.contains(target as Node) || this.host?.matches(':hover')) &&
            !(target instanceof Element && target.closest('button, a'))
          ) {
            event.preventDefault();
          }
        } else {
          this.pressed.clear();
          this.gestureKeys.clear();
          this.updateActive();
        }
      });
  }

  private updateActive() {
    const { modifiers } = this.shortcuts();
    const active = { ...this.#modifiersActive$.value };
    for (const name of Object.keys(active) as KeyboardModifierName[]) {
      const pressed = GESTURE_MODIFIERS.includes(name) ? this.gestureKeys : this.pressed;
      active[name] = modifiers[name].some((code) => pressed.has(code));
    }
    this.#modifiersActive$.next(active);
  }

  public setShortcuts(shortcuts: KeyboardShortcuts) {
    if (isDevMode()) reportMovedEntries(shortcuts);
    this.shortcuts.update((current) => ({
      modifiers: { ...current.modifiers, ...suppliedEntries(shortcuts?.modifiers) },
      commands: { ...current.commands, ...suppliedEntries(shortcuts?.commands) },
    }));
    this.updateActive();
  }

  public isActiveModifier(name: KeyboardModifierName) {
    return this.#modifiersActive$.value[name];
  }

  /** Whether a physical key is bound as a modifier, so entity commands leave it to the gesture layer. */
  public isModifierKey(code: string) {
    return Object.values(this.shortcuts().modifiers).some((codes) => codes.includes(code));
  }

  /** Whether a physical key runs the command. Reactive, so descriptions follow the configuration. */
  public isCommand(command: KeyboardCommandName, code: string) {
    return this.shortcuts().commands[command].includes(code);
  }

  /** Whether the command has any key. Reactive. */
  public hasCommand(command: KeyboardCommandName) {
    return this.shortcuts().commands[command].length > 0;
  }
}
