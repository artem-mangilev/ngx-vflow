import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { forwardSignal } from './forward-signal';

describe('forwardSignal', () => {
  it('reads the value of the signal the target returns', () => {
    const target = signal(5);

    expect(forwardSignal(() => target)()).toBe(5);
  });

  it('follows a change of the target signal', () => {
    const target = signal(5);
    const forward = forwardSignal(() => target);

    target.set(6);

    expect(forward()).toBe(6);
  });

  it('follows the switch to another target signal', () => {
    const first = signal('first');
    const second = signal('second');
    const current = signal(first);
    const forward = forwardSignal(() => current());

    current.set(second);

    expect(forward()).toBe('second');
  });

  it('writes to the current target signal', () => {
    const first = signal(1);
    const second = signal(2);
    const current = signal(first);
    const forward = forwardSignal(() => current());
    current.set(second);

    forward.set(20);

    expect(second()).toBe(20);
    expect(first()).toBe(1);
  });

  it('updates the current target signal', () => {
    const target = signal(2);
    const forward = forwardSignal(() => target);

    forward.update((value) => value * 5);

    expect(target()).toBe(10);
  });

  it('returns a reader that follows the target', () => {
    const target = signal(1);
    const readonly = forwardSignal(() => target).asReadonly();

    target.set(2);

    expect(readonly()).toBe(2);
  });

  it('does not make a writing effect depend on the switch of the target', () => {
    const current = signal(signal(0));
    const forward = forwardSignal(() => current());
    let runs = 0;
    TestBed.runInInjectionContext(() =>
      effect(() => {
        runs++;
        forward.set(1);
      }),
    );
    TestBed.tick();

    current.set(signal(0));
    TestBed.tick();

    expect(runs).toBe(1);
  });
});
