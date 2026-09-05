import { ElementRef, Injectable, inject } from '@angular/core';
import { KeyboardAction, KeyboardShortcuts } from '../types/keyboard-action.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { getOS } from '../utils/get-os';

@Injectable()
export class KeyboardService {
  private host = inject(ElementRef<HTMLElement>, { optional: true })?.nativeElement;
  private actions: KeyboardShortcuts = {
    selection: ['ShiftLeft', 'ShiftRight'],
    multiSelection: [
      getOS() === 'macos' ? 'MetaLeft' : 'ControlLeft',
      getOS() === 'macos' ? 'MetaRight' : 'ControlRight',
    ],
    pan: null,
    zoom: null,
  };
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
      active[action] = (this.actions[action] ?? []).some((code) => pressed.has(code));
    }
    this.#actionsActive$.next(active);
  }

  public setShortcuts(newActions: KeyboardShortcuts) {
    this.actions = { ...this.actions, ...newActions };
    this.updateActive();
  }

  public isActiveAction(action: KeyboardAction) {
    return this.#actionsActive$.value[action];
  }
}
