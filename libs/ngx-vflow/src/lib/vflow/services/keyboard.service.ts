import { ElementRef, Injectable, inject, signal } from '@angular/core';
import { KeyboardAction, KeyboardCommand, KeyboardShortcuts } from '../types/keyboard-action.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, fromEvent, merge } from 'rxjs';
import { DeleteRequest } from '../interfaces/delete-request.interface';
import { getOS } from '../utils/get-os';

@Injectable()
export class KeyboardService {
  private host = inject(ElementRef<HTMLElement>, { optional: true })?.nativeElement;
  private shortcuts = signal<KeyboardShortcuts>({
    selection: ['ShiftLeft', 'ShiftRight'],
    multiSelection: [
      getOS() === 'macos' ? 'MetaLeft' : 'ControlLeft',
      getOS() === 'macos' ? 'MetaRight' : 'ControlRight',
    ],
    pan: null,
    zoom: null,
    delete: ['Delete', 'Backspace'],
  });
  /** Keyboard deletion requests from focused entity wrappers; the flow exposes them as an output. */
  public deleteRequest$ = new Subject<DeleteRequest>();
  private pressed = new Set<string>();
  private gestureKeys = new Set<string>();
  #actionsActive$ = new BehaviorSubject<Record<KeyboardAction, boolean>>({
    multiSelection: false,
    selection: false,
    pan: false,
    zoom: false,
  });
  public actionsActive$ = this.#actionsActive$.asObservable();

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
            this.isActiveAction('pan') &&
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
    const active = { ...this.#actionsActive$.value };
    for (const action of Object.keys(active) as KeyboardAction[]) {
      const pressed = action === 'pan' || action === 'zoom' ? this.gestureKeys : this.pressed;
      active[action] = (this.shortcuts()[action] ?? []).some((code) => pressed.has(code));
    }
    this.#actionsActive$.next(active);
  }

  public setShortcuts(newActions: KeyboardShortcuts) {
    this.shortcuts.update((shortcuts) => ({ ...shortcuts, ...newActions }));
    this.updateActive();
  }

  public isActiveAction(action: KeyboardAction) {
    return this.#actionsActive$.value[action];
  }

  /** Whether a physical key is bound to any action, so entity commands leave it to the gesture layer. */
  public hasShortcut(code: string) {
    return Object.values(this.shortcuts()).some((codes) => codes?.includes(code));
  }

  /** Whether a physical key is bound to the command. Reactive, so descriptions follow the configuration. */
  public isCommand(command: KeyboardCommand, code: string) {
    return (this.shortcuts()[command] ?? []).includes(code);
  }

  /** Whether the command has any key. Reactive. */
  public hasCommand(command: KeyboardCommand) {
    return (this.shortcuts()[command] ?? []).length > 0;
  }
}
