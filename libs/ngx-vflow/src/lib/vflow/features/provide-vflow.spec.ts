import { ChangeDetectionStrategy, Component, InjectionToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../vflow';
import { VflowComponent } from '../components/vflow/vflow.component';
import { provideVflow, vflowFeature, type VflowFeature } from './feature';

const TOKEN = new InjectionToken<string>('TOKEN');

@Component({
  template: `<vflow [nodes]="[]"><div *vNode></div></vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  public readonly value = inject(TOKEN, { optional: true });
}

describe('provideVflow', () => {
  it('flattens the providers of its features in order', () => {
    const a = { provide: TOKEN, useValue: 'a' };
    const b = { provide: TOKEN, useValue: 'b' };

    expect(provideVflow()).toEqual([]);
    expect(provideVflow(vflowFeature('test:a', [a]), vflowFeature('test:b', [b]))).toEqual([a, b]);
  });

  it('shows the host component and the flow below it a feature provided on the host', () => {
    TestBed.overrideComponent(HostComponent, {
      set: { providers: provideVflow(vflowFeature('test:value', [{ provide: TOKEN, useValue: 'host' }])) },
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent));

    expect(fixture.componentInstance.value).toBe('host');
    expect(flow.injector.get(TOKEN)).toBe('host');
  });

  it('shows the flow a feature provided at the root', () => {
    TestBed.configureTestingModule({
      providers: provideVflow(vflowFeature('test:value', [{ provide: TOKEN, useValue: 'root' }])),
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent));

    expect(flow.injector.get(TOKEN)).toBe('root');
  });

  it('rejects two features of one kind in one call and anything that is not a feature', () => {
    expect(() => provideVflow(vflowFeature('test:a', []), vflowFeature('test:a', []))).toThrowError(
      /"test:a" was provided twice/,
    );
    expect(() => provideVflow({ kind: 'test:a', providers: [] } as unknown as VflowFeature)).toThrowError(
      /with\*\(\) function/,
    );
  });

  it('types the kind of a feature', () => {
    const feature = vflowFeature('acme:proximity', []);
    const kind: 'acme:proximity' = feature.kind;

    expect(kind).toBe('acme:proximity');
    expect(provideVflow(feature)).toEqual([]);
  });
});
