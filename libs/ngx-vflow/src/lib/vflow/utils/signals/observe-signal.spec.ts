import { EnvironmentInjector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { observeSignal } from './observe-signal';

describe('observeSignal', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = TestBed.inject(EnvironmentInjector);
  });

  it('emits the current value on subscription', () => {
    const values: number[] = [];

    observeSignal(signal(7), injector).subscribe((value) => values.push(value));

    expect(values).toEqual([7]);
  });

  it('does not repeat the current value when its effect first runs', () => {
    const values: number[] = [];
    observeSignal(signal(7), injector).subscribe((value) => values.push(value));

    TestBed.tick();

    expect(values).toEqual([7]);
  });

  it('emits every change of the signal', () => {
    const source = signal(1);
    const values: number[] = [];
    observeSignal(source, injector).subscribe((value) => values.push(value));
    TestBed.tick();

    source.set(2);
    TestBed.tick();
    source.set(3);
    TestBed.tick();

    expect(values).toEqual([1, 2, 3]);
  });

  it('emits the value read at creation and then a change made before the effect first ran', () => {
    const source = signal('initial');
    const values: string[] = [];
    const observable = observeSignal(source, injector);

    source.set('changed');
    observable.subscribe((value) => values.push(value));
    TestBed.tick();

    expect(values).toEqual(['initial', 'changed']);
  });

  it('completes when the injector is destroyed', () => {
    let completed = false;
    observeSignal(signal(1), injector).subscribe({ complete: () => (completed = true) });

    TestBed.resetTestingModule();

    expect(completed).toBe(true);
  });
});
