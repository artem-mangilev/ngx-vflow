import { ChangeDetectionStrategy, Component, Provider, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { Curve, createEdges } from '../../interfaces/edge.interface';
import { CurveFactory } from '../../interfaces/curve-factory.interface';
import { CurveKey } from '../../interfaces/curves.interface';
import { FlowEntitiesService } from '../../services/flow-entities.service';
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
  template: `<vflow [view]="[500, 300]" [nodes]="nodes" [edges]="edges" [connection]="{ curve: 'custom' }">
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
  readonly curve = signal<Curve>('custom');
  readonly edges = createEdges([{ id: 'ab', source: 'a', target: 'b', curve: 'custom' }]);
}

describe('curves of vflow through withCurves', () => {
  let fixture: ComponentFixture<HostComponent>;

  async function render(rootProviders: Provider[] = [], hostProviders: Provider[] = []) {
    TestBed.configureTestingModule({ providers: rootProviders });
    TestBed.overrideComponent(HostComponent, { set: { providers: hostProviders } });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const edgeModel = () =>
    fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FlowEntitiesService).edges()[0];
  const path = () => edgeModel().path().path;

  afterEach(() => fixture?.destroy());

  it('lays out an edge with the factory registered under its key and follows a change of the key', async () => {
    await render(provideVflow(withCurves({ custom: horizontal, other: diagonal })));
    expect(path()).toMatch(/^M .* H .* V .*$/);

    fixture.componentInstance.edges[0].curve.set('other');
    expect(path()).toMatch(/^M .* L .*$/);
    fixture.componentInstance.edges[0].curve.set('bezier');
    expect(path()).toMatch(/C/);
    fixture.componentInstance.edges[0].curve.set('custom');
    expect(path()).toMatch(/^M .* H .* V .*$/);
  });

  it('adds the keys of a host-level registration to those of the root', async () => {
    await render(provideVflow(withCurves({ other: diagonal })), provideVflow(withCurves({ custom: horizontal })));

    expect(path()).toMatch(/^M .* H .* V .*$/);
    fixture.componentInstance.edges[0].curve.set('other');
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

  it('types a key as any string until the registry interface is augmented, with the built-in names kept', () => {
    const key: CurveKey = 'anything';
    const curves: Curve[] = [key, 'bezier', 'smooth-step', diagonal];

    expect(curves.length).toBe(4);
  });
});
