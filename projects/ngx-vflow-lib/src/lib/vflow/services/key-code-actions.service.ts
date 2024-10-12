import { Injectable, signal, WritableSignal } from '@angular/core';
import { KeyboardAction, KeyCodeActions } from '../types/keyboard-action.type';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { fromEvent, merge, switchMap, tap } from 'rxjs';

@Injectable()
export class KeyCodeActionsService {
  private actions: WritableSignal<KeyCodeActions> = signal({
    multiSelection: ['Meta']
  });

  private actionsActive: Record<KeyboardAction, boolean> = {
    multiSelection: false
  };

  constructor() {
    toObservable(this.actions).pipe(
      switchMap(() =>
        merge(
          fromEvent<KeyboardEvent>(document, 'keydown').pipe(
            tap(event => {
              for (const action in this.actions()) {
                const keyCodes = this.actions()[action as KeyboardAction] ?? [];

                if (keyCodes.includes(event.key)) {
                  this.actionsActive[action as KeyboardAction] = true;
                }
              }
            })
          ),

          fromEvent<KeyboardEvent>(document, 'keyup').pipe(
            tap(event => {
              for (const action in this.actions()) {
                const keyCodes = this.actions()[action as KeyboardAction] ?? [];

                if (keyCodes.includes(event.key)) {
                  this.actionsActive[action as KeyboardAction] = false;
                }
              }
            })
          )
        )
      ),
      takeUntilDestroyed()
    ).subscribe();
  }

  public setActions(newActions: KeyCodeActions) {
    this.actions.update((actions) => ({ ...actions, ...newActions }));
  }

  public isActive(action: KeyboardAction) {
    return this.actionsActive[action]
  }
}
