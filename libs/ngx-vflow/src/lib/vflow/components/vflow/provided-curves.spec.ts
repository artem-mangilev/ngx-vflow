import { ChangeDetectionStrategy, Component, Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Curve, createEdges } from '../../interfaces/edge.interface';
import { CurveFactory } from '../../interfaces/curve-factory.interface';
import { BuiltInCurve, CurveKey } from '../../interfaces/curves.interface';
import { provideVflow } from '../../features/feature';
import { withCurves } from '../../features/with-curves';

const horizontal: CurveFactory = ({ sourcePoint, targetPoint }) => ({
  path: `M ${sourcePoint.x} ${sourcePoint.y} H ${targetPoint.x} V ${targetPoint.y}`,
});
const diagonal: CurveFactory = ({ sourcePoint, targetPoint }) => ({
  path: `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`,
});

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    style="width: 500px; height: 300px"
    [nodes]="nodes"
    [edges]="edges"
    [connection]="{ curve: 'custom' }">
    <div *vNode style="width: 60px; height: 30px">
      <span vHandle handleType="target" position="left"></span
      ><span vHandle handleType="source" position="right"></span>
    </div>
  </vflow>`,
})
class HostComponent {
  readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 100 } },
  ]);
  readonly edges = createEdges([{ id: 'ab', source: 'a', target: 'b', curve: 'custom' }]);
}

describe('curves of vflow through withCurves', () => {
  let fixture: ComponentFixture<HostComponent>;

  async function render(rootProviders: Provider[] = [], hostProviders: Provider[] = []) {
    TestBed.configureTestingModule({ providers: rootProviders });
    TestBed.overrideComponent(HostComponent, { set: { providers: hostProviders } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
    await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function setCurve(curve: Curve) {
    fixture.componentInstance.edges[0].curve.set(curve);
    fixture.detectChanges();
  }

  /** The rendered path of the edge, which its interaction stroke follows. */
  const path = () =>
    (fixture.nativeElement as HTMLElement).querySelector('svg[edge] path[data-v-interactive-edge]')!.getAttribute('d');

  afterEach(() => fixture?.destroy());

  it('lays out an edge with the factory registered under its key', async () => {
    await render(provideVflow(withCurves({ custom: horizontal, other: diagonal })));

    expect(path()).toMatch(/^M .* H .* V .*$/);
  });

  it('follows a change of the key to another registered one', async () => {
    await render(provideVflow(withCurves({ custom: horizontal, other: diagonal })));

    setCurve('other');

    expect(path()).toMatch(/^M .* L .*$/);
  });

  it('follows a change of the key to a built-in name', async () => {
    await render(provideVflow(withCurves({ custom: horizontal, other: diagonal })));

    setCurve('bezier');

    expect(path()).toMatch(/C/);
  });

  it('adds the keys of a host-level registration to those of the root', async () => {
    await render(provideVflow(withCurves({ other: diagonal })), provideVflow(withCurves({ custom: horizontal })));
    expect(path()).toMatch(/^M .* H .* V .*$/);

    setCurve('other');

    expect(path()).toMatch(/^M .* L .*$/);
  });

  it('throws for a key no level registers, with the key in the message', () => {
    TestBed.configureTestingModule({ providers: provideVflow(withCurves({ other: diagonal })) });
    fixture = TestBed.createComponent(HostComponent);

    expect(() => fixture.detectChanges()).toThrowError(
      /No curve is registered as "custom".*withCurves\(\{ custom: … \}\)/,
    );
  });

  it('refuses to register a built-in name', () => {
    expect(() => withCurves({ bezier: diagonal } as Record<string, CurveFactory>)).toThrowError(
      /"bezier" is a built-in curve/,
    );
  });

  it('checks types: a key is any string until the registry interface is augmented, the built-in names stay', () => {
    expectTypeOf<CurveKey>().toEqualTypeOf<string & {}>();
    expectTypeOf<BuiltInCurve>().toExtend<Curve>();
    expectTypeOf<'anything'>().toExtend<Curve>();
  });
});
