// MIT License

// Copyright (c) 2023 Chau Tran

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { computed, untracked, type Signal } from '@angular/core';
import { toSignal, type ToSignalOptions } from '@angular/core/rxjs-interop';
import type { Observable, Subscribable } from 'rxjs';
import { assertInjector } from '../assert-injector';

type ReturnType<T, U> = (T | U) | (T | undefined) | (T | null) | T;

export function toLazySignal<T>(source: Observable<T> | Subscribable<T>): Signal<T | undefined>;

export function toLazySignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: ToSignalOptions<T> & {
    initialValue?: undefined;
    requireSync?: false;
  },
): Signal<T | undefined>;

export function toLazySignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: ToSignalOptions<T> & { initialValue?: null; requireSync?: false },
): Signal<T | null>;

export function toLazySignal<T>(
  source: Observable<T> | Subscribable<T>,
  options: ToSignalOptions<T> & { initialValue?: undefined; requireSync: true },
): Signal<T>;

export function toLazySignal<T, const U extends T>(
  source: Observable<T> | Subscribable<T>,
  options: ToSignalOptions<T> & { initialValue: U; requireSync?: false },
): Signal<T | U>;

/**
 * Function `toLazySignal()` is a proxy function that will call the original
 * `toSignal()` function when the returned signal is read for the first time.
 */
export function toLazySignal<T, U = undefined>(
  source: Observable<T> | Subscribable<T>,
  options?: ToSignalOptions<T> & { initialValue?: U },
): Signal<ReturnType<T, U>> {
  const injector = assertInjector(toLazySignal, options?.injector);
  let s: Signal<ReturnType<T, U>>;

  return computed<ReturnType<T, U>>(() => {
    if (!s) {
      s = untracked(() => toSignal(source, { ...options, injector } as any));
    }
    return s();
  });
}
