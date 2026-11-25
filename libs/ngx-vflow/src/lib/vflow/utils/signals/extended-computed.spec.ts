import { signal } from '@angular/core';
import { extendedComputed } from './extended-computed';

describe('extendedComputed', () => {
  it('receives no previous value on the first run', () => {
    const previous: (number | undefined)[] = [];

    extendedComputed<number>((value) => {
      previous.push(value);
      return 1;
    })();

    expect(previous).toEqual([undefined]);
  });

  it('receives the value of the last run', () => {
    const source = signal(1);
    const previous: (number | undefined)[] = [];
    const total = extendedComputed<number>((value) => {
      previous.push(value);
      return (value ?? 0) + source();
    });

    total();
    source.set(10);
    const result = total();

    expect(previous).toEqual([undefined, 1]);
    expect(result).toBe(11);
  });

  it('runs again only when a dependency changed', () => {
    const source = signal(1);
    let runs = 0;
    const doubled = extendedComputed<number>(() => {
      runs++;
      return source() * 2;
    });

    doubled();
    doubled();
    source.set(2);
    doubled();

    expect(runs).toBe(2);
  });

  it('keeps the same value for an equal result by default', () => {
    const source = signal(1);
    const object = {};
    const computedObject = extendedComputed<object>(() => (source(), object));
    const first = computedObject();

    source.set(2);

    expect(computedObject()).toBe(first);
  });

  it('uses the equality of the options', () => {
    const source = signal(1);
    let changes = 0;
    const parity = extendedComputed<number>(() => source() % 2, { equal: (a, b) => a === b });
    const watcher = extendedComputed<number>(() => (changes++, parity()));
    watcher();

    source.set(3);
    watcher();

    expect(changes).toBe(1);
  });
});
