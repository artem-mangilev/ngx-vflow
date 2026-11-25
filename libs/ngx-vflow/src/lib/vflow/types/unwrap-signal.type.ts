import { Signal } from '@angular/core';

export type UnwrapSignal<T> = {
  [K in keyof T]: NonNullable<T[K]> extends Signal<infer U> ? (undefined extends T[K] ? U | undefined : U) : T[K];
};
