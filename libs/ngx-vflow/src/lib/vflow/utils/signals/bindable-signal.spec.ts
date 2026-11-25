import { computed, signal } from '@angular/core';
import { bindableSignal } from './bindable-signal';

describe('bindableSignal', () => {
  it('reads the initial value until a source is bound', () => {
    expect(bindableSignal(5)()).toBe(5);
  });

  it('reads the source after it is bound', () => {
    const bindable = bindableSignal(5);

    bindable.bind(signal(9));

    expect(bindable()).toBe(9);
  });

  it('follows the changes of the bound source', () => {
    const source = signal(1);
    const bindable = bindableSignal(0);
    bindable.bind(source);

    source.set(2);

    expect(bindable()).toBe(2);
  });

  it('switches to another source when it is bound again', () => {
    const bindable = bindableSignal(0);
    bindable.bind(signal(1));

    bindable.bind(signal(2));

    expect(bindable()).toBe(2);
  });

  it('notifies a reader that already holds it when a source is bound', () => {
    const bindable = bindableSignal('initial');
    const reader = computed(() => bindable().toUpperCase());
    expect(reader()).toBe('INITIAL');

    bindable.bind(signal('bound'));

    expect(reader()).toBe('BOUND');
  });
});
