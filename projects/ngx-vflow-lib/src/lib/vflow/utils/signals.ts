import { Signal } from '@angular/core';

export function readSignalOrPlain<T>(signalOrPlain: Signal<T> | T): T {
  if (isSignal(signalOrPlain)) {
    return signalOrPlain();
  }

  return signalOrPlain;
}

function isSignal<T>(signalOrPlain: Signal<T> | T): signalOrPlain is Signal<T> {
  return typeof signalOrPlain === 'function';
}
