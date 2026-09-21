import { ChangeDetectionStrategy, Component, DestroyRef, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../components/vflow/vflow.component';
import { FeatureRegistryService } from '../services/feature-registry.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { ConnectionPolicy } from './connection-policy.interface';
import { provideVflow, vflowFeature, VflowFeature } from './feature';
import { GeometryTransform } from './geometry-intent.interface';
import { provideConnectionPolicy } from './provide-connection-policy';
import { provideGeometryTransform } from './provide-geometry-transform';

const transform = (id: string, rest: Partial<GeometryTransform> = {}): GeometryTransform => ({
  id,
  transform: () => undefined,
  ...rest,
});

/** A transform written as a class: created by the flow, so it reaches the flow's services and lifecycle. */
class ClassTransform implements GeometryTransform {
  public readonly id = 'class';
  public readonly settings = inject(FlowSettingsService);
  public destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => (this.destroyed = true));
  }

  public transform() {
    return undefined;
  }
}

class DenyPolicy implements ConnectionPolicy {
  public readonly id = 'deny';
  public decide() {
    return false;
  }
}

@Component({
  template: `<vflow [nodes]="[]" [edges]="[]" [view]="[200, 200]" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

function registryOf(features: VflowFeature[]) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  TestBed.overrideComponent(HostComponent, { set: { providers: provideVflow(...features) } });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const registry = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FeatureRegistryService);
  return { fixture, registry };
}

describe('provideVflow', () => {
  it('shows a flow the features provided on its host component', () => {
    const { registry } = registryOf([
      vflowFeature('test:snap', provideGeometryTransform(transform('snap'))),
      vflowFeature('test:deny', provideConnectionPolicy(new DenyPolicy())),
    ]);

    expect(registry.geometryTransforms.map((t) => t.id)).toEqual(['snap']);
    expect(registry.connectionPolicies.map((p) => p.id)).toEqual(['deny']);
  });

  it('runs same-precedence entries in array order and higher categories first regardless of it', () => {
    const { registry } = registryOf([
      vflowFeature('test:a', provideGeometryTransform(transform('a'))),
      vflowFeature('test:b', provideGeometryTransform(transform('b', { precedence: 'lowest' }))),
      vflowFeature('test:c', provideGeometryTransform(transform('c'))),
      vflowFeature('test:d', provideGeometryTransform(transform('d', { precedence: 'high' }))),
    ]);

    expect(registry.geometryTransforms.map((t) => t.id)).toEqual(['d', 'a', 'c', 'b']);
  });

  it('filters transforms by kind and phase once per pair', () => {
    const { registry } = registryOf([
      vflowFeature('test:all', provideGeometryTransform(transform('all'))),
      vflowFeature(
        'test:move-end',
        provideGeometryTransform(transform('move-end', { kinds: ['move'], phases: ['end'] })),
      ),
      vflowFeature('test:resize', provideGeometryTransform(transform('resize', { kinds: ['resize'] }))),
    ]);

    expect(registry.transformsFor('move', 'end').map((t) => t.id)).toEqual(['all', 'move-end']);
    expect(registry.transformsFor('move', 'update').map((t) => t.id)).toEqual(['all']);
    expect(registry.transformsFor('resize', 'update').map((t) => t.id)).toEqual(['all', 'resize']);
    expect(registry.transformsFor('move', 'end')).toBe(registry.transformsFor('move', 'end'));
  });

  it('creates class entries in the flow injector and destroys them with the flow', () => {
    const { fixture, registry } = registryOf([vflowFeature('test:class', provideGeometryTransform(ClassTransform))]);
    const entry = registry.geometryTransforms[0] as ClassTransform;
    const flowSettings = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FlowSettingsService);

    expect(entry).toBeInstanceOf(ClassTransform);
    expect(entry.settings).toBe(flowSettings);

    fixture.destroy();
    expect(entry.destroyed).toBeTrue();
  });

  it('leaves a flow without provideVflow with empty registries', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const registry = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FeatureRegistryService);

    expect(registry.geometryTransforms).toEqual([]);
    expect(registry.connectionPolicies).toEqual([]);
  });

  it('rejects a duplicate entry id when the flow resolves its entries', () => {
    expect(() =>
      registryOf([
        vflowFeature('test:a', provideGeometryTransform(transform('same'))),
        vflowFeature('test:b', provideGeometryTransform(transform('same'))),
      ]),
    ).toThrowError(/"same" is registered twice/);
  });

  it('rejects two features of one kind and anything that is not a feature', () => {
    expect(() => provideVflow(vflowFeature('test:a', []), vflowFeature('test:a', []))).toThrowError(
      /"test:a" was provided twice/,
    );
    expect(() => provideVflow({ kind: 'test:a', providers: [] } as unknown as VflowFeature)).toThrowError(
      /vflowFeature\(\)/,
    );
  });

  it('rejects provideVflow called twice in one injector', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...provideVflow(vflowFeature('test:a', [])),
        ...provideVflow(vflowFeature('test:b', [])),
        FeatureRegistryService,
      ],
    });

    expect(() => TestBed.inject(FeatureRegistryService)).toThrowError(/called twice in one injector/);
  });
});
