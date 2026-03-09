import { Injectable, signal, WritableSignal } from '@angular/core';
import { KeyboardAction, KeyboardShortcuts } from '../types/keyboard-action.type';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { getOS } from '../utils/get-os';

@Injectable()
export class KeyboardService {
  private actions: WritableSignal<KeyboardShortcuts> = signal({
    selection: ['ShiftLeft', 'ShiftRight'],
    multiSelection: [
      getOS() === 'macos' ? 'MetaLeft' : 'ControlLeft',
      getOS() === 'macos' ? 'MetaRight' : 'ControlRight',
    ],
  });

  #actionsActive$ = new BehaviorSubject<Record<KeyboardAction, boolean>>({
    multiSelection: false,
    selection: false,
  });

  actionsActive$ = this.#actionsActive$.asObservable();

  constructor() {
    toObservable(this.actions)
      .pipe(
        switchMap(() =>
          merge(
            fromEvent<KeyboardEvent>(document, 'keydown').pipe(
              tap((event) => {
                for (const action in this.actions()) {
                  const keyCodes = this.actions()[action as KeyboardAction] ?? [];

                  if (keyCodes.includes(event.code)) {
                    this.#actionsActive$.next({
                      ...this.#actionsActive$.value,
                      [action]: true,
                    });
                  }
                }
              }),
            ),

            fromEvent<KeyboardEvent>(document, 'keyup').pipe(
              tap((event) => {
                for (const action in this.actions()) {
                  const keyCodes = this.actions()[action as KeyboardAction] ?? [];

                  if (keyCodes.includes(event.code)) {
                    this.#actionsActive$.next({
                      ...this.#actionsActive$.value,
                      [action]: false,
                    });
                  }
                }
              }),
            ),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  public setShortcuts(newActions: KeyboardShortcuts) {
    this.actions.update((actions) => ({ ...actions, ...newActions }));
  }

  public isActiveAction(action: KeyboardAction) {
    return this.#actionsActive$.value[action];
  }
}
