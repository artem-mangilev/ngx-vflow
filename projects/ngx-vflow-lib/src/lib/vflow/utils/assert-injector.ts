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

/* eslint-disable @typescript-eslint/ban-types */
import { Injector, assertInInjectionContext, inject, runInInjectionContext } from '@angular/core';

/**
 * `assertInjector` extends `assertInInjectionContext` with an optional `Injector`
 * After assertion, `assertInjector` runs the `runner` function with the guaranteed `Injector`
 * whether it is the default `Injector` within the current **Injection Context**
 * or the custom `Injector` that was passed in.
 *
 * @template {() => any} Runner - Runner is a function that can return anything
 * @param {Function} fn - the Function to pass in `assertInInjectionContext`
 * @param {Injector | undefined | null} injector - the optional "custom" Injector
 * @param {Runner} runner - the runner fn
 * @returns {ReturnType<Runner>} result - returns the result of the Runner
 *
 * @example
 * ```ts
 * function injectValue(injector?: Injector) {
 *  return assertInjector(injectValue, injector, () => 'value');
 * }
 *
 * injectValue(); // string
 * ```
 */
export function assertInjector<Runner extends () => any>(
  fn: Function,
  injector: Injector | undefined | null,
  runner: Runner,
): ReturnType<Runner>;
/**
 * `assertInjector` extends `assertInInjectionContext` with an optional `Injector`
 * After assertion, `assertInjector` returns a guaranteed `Injector` whether it is the default `Injector`
 * within the current **Injection Context** or the custom `Injector` that was passed in.
 *
 * @param {Function} fn - the Function to pass in `assertInInjectionContext`
 * @param {Injector | undefined | null} injector - the optional "custom" Injector
 * @returns Injector
 *
 * @example
 * ```ts
 * function injectDestroy(injector?: Injector) {
 *  injector = assertInjector(injectDestroy, injector);
 *
 *  return runInInjectionContext(injector, () => {
 *    // code
 *  })
 * }
 * ```
 */
export function assertInjector(fn: Function, injector: Injector | undefined | null): Injector;
export function assertInjector(fn: Function, injector: Injector | undefined | null, runner?: () => any) {
  !injector && assertInInjectionContext(fn);
  const assertedInjector = injector ?? inject(Injector);

  if (!runner) return assertedInjector;
  return runInInjectionContext(assertedInjector, runner);
}
