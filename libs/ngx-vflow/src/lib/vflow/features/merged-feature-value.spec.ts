import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  InjectionToken,
  Provider,
  Signal,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMergedFeatureValue } from './merged-feature-value';

interface Labels {
  flow: string;
  node: string;
  edge: string;
}

const LABELS = new InjectionToken<Signal<Partial<Labels>>>('LABELS');

@Injectable({ providedIn: 'root' })
class Translations {
  public readonly labels = signal<Partial<Labels>>({ flow: 'Схема' });
}

@Component({
  template: `<ng-content />`,
  selector: 'host-reader',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ReaderComponent {
  public readonly labels = inject(LABELS, { optional: true });
}

function readerWith(providers: Provider[]): ReaderComponent {
  TestBed.overrideComponent(ReaderComponent, { set: { providers } });
  return TestBed.createComponent(ReaderComponent).componentInstance;
}

describe('provideMergedFeatureValue', () => {
  it('reads the keys of the nearest level over those of the levels above', () => {
    TestBed.configureTestingModule({
      providers: [provideMergedFeatureValue(LABELS, { flow: 'Graph', node: 'Node' })],
    });
    const reader = readerWith([provideMergedFeatureValue(LABELS, { node: 'Step', edge: undefined })]);

    expect(reader.labels?.()).toEqual({ flow: 'Graph', node: 'Step' });
  });

  it('is the value itself without a level above', () => {
    const reader = readerWith([provideMergedFeatureValue(LABELS, { edge: 'Link' })]);

    expect(reader.labels?.()).toEqual({ edge: 'Link' });
  });

  it('runs a factory in the injector and follows the signal it returns', () => {
    const reader = readerWith([provideMergedFeatureValue(LABELS, () => inject(Translations).labels)]);
    expect(reader.labels?.()).toEqual({ flow: 'Схема' });

    TestBed.inject(Translations).labels.set({ flow: 'Диаграмма', node: 'Шаг' });
    expect(reader.labels?.()).toEqual({ flow: 'Диаграмма', node: 'Шаг' });
  });

  it('follows a signal given directly and a plain object returned by a factory', () => {
    const own: WritableSignal<Partial<Labels>> = signal({ node: 'Node' });
    TestBed.configureTestingModule({ providers: [provideMergedFeatureValue(LABELS, own)] });
    const reader = readerWith([provideMergedFeatureValue(LABELS, () => ({ edge: 'Edge' }))]);
    expect(reader.labels?.()).toEqual({ node: 'Node', edge: 'Edge' });

    own.set({ node: 'Step', flow: 'Flow' });
    expect(reader.labels?.()).toEqual({ node: 'Step', flow: 'Flow', edge: 'Edge' });
  });
});
