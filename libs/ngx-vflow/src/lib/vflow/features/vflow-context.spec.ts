import { ChangeDetectionStrategy, Component, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../components/vflow/vflow.component';
import { createNode, Node } from '../interfaces/node.interface';
import { FeatureRegistryService } from '../services/feature-registry.service';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowStatusService } from '../services/flow-status.service';
import { injectNode } from '../utils/inject-node';
import { provideVflow, vflowFeature } from './feature';
import { GeometryTransform } from './geometry-intent.interface';
import { provideGeometryTransform } from './provide-geometry-transform';
import { VflowContext } from './vflow-context';

/** A node presentation that reads its own box from the context, without any internal service. */
@Component({
  template: `<div style="width: 120px; height: 60px">{{ id }}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ContextNodeComponent {
  public readonly context = inject(VflowContext);
  public readonly id = injectNode().node.id;

  public ownGeometry() {
    return this.context.getNodeGeometry(this.id);
  }
}

/** A feature entry that writes through the context. */
class MoverTransform implements GeometryTransform {
  public readonly id = 'mover';
  public readonly context = inject(VflowContext);

  public transform() {
    return undefined;
  }

  public move(id: string, x: number, y: number) {
    return this.context.propose('move', [{ id, point: { x, y } }], { origin: 'test:mover' });
  }
}

@Component({
  template: `<vflow [nodes]="nodes()" [edges]="[]" [view]="[400, 300]" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: provideVflow(vflowFeature('test:mover', provideGeometryTransform(MoverTransform))),
})
class HostComponent {
  public readonly nodes = signal<Node[]>([
    createNode({ id: 'parent', point: { x: 100, y: 100 }, width: 300, height: 200 }),
    createNode({ id: 'child', point: { x: 10, y: 20 }, parentId: 'parent', component: ContextNodeComponent }),
    createNode({ id: 'free', point: { x: 30, y: 40 }, component: ContextNodeComponent }),
  ]);
}

describe('VflowContext', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent));
    const context = flow.injector.get(VflowContext);
    const nodeComponents = fixture.debugElement
      .queryAll(By.directive(ContextNodeComponent))
      .map((element) => element.componentInstance as ContextNodeComponent);
    return { fixture, flow, context, nodeComponents };
  }

  it('is injectable by a node presentation, which reads its own live geometry', async () => {
    const { context, nodeComponents } = await setup();
    const child = nodeComponents.find((component) => component.id === 'child')!;

    expect(child.context).toBe(context);
    expect(child.ownGeometry()).toEqual({
      id: 'child',
      x: 110,
      y: 120,
      width: 120,
      height: 60,
      point: { x: 10, y: 20 },
      parentId: 'parent',
      measured: true,
    });
    expect(context.getNodeGeometry('missing')).toBeNull();
    expect(Object.values(child.ownGeometry()!).some((value) => typeof value === 'function')).toBeFalse();
  });

  it('is injectable by a feature entry, whose proposal reaches the application node and bumps the revision', async () => {
    const { fixture, flow, context } = await setup();
    const mover = flow.injector.get(FeatureRegistryService).geometryTransforms[0] as MoverTransform;
    const node = fixture.componentInstance.nodes().find((n) => n.id === 'free')!;

    expect(mover.context).toBe(context);
    expect(context.revision()).toBe(0);
    expect(mover.move('free', 50, 60)).toBeTrue();
    expect(node.point()).toEqual({ x: 50, y: 60 });
    expect(context.revision()).toBe(1);
  });

  it('drops a proposal for an unknown node or a non-finite value and reports it in dev mode', async () => {
    const { context } = await setup();
    const error = spyOn(console, 'error');

    expect(context.propose('move', [{ id: 'missing', point: { x: 1, y: 1 } }])).toBeFalse();
    expect(context.propose('resize', [{ id: 'free', width: Number.NaN }])).toBeFalse();
    expect(error).toHaveBeenCalledTimes(2);
    expect(context.revision()).toBe(0);
  });

  it('makes a node explicitly sized when a proposal writes its size', async () => {
    const { fixture, context } = await setup();
    const entities = fixture.debugElement.query(By.directive(VflowComponent)).injector.get(FlowEntitiesService);

    expect(entities.getNode('free')!.sizeMode()).toBe('auto');
    expect(context.propose('resize', [{ id: 'free', width: 200, height: 80 }])).toBeTrue();
    expect(entities.getNode('free')!.sizeMode()).toBe('explicit');
    expect(context.getNodeGeometry('free')).toEqual(jasmine.objectContaining({ width: 200, height: 80 }));
  });

  it('reports the interaction and tracks the pointer in viewport pixels only while a gesture is active', async () => {
    const { fixture, flow, context } = await setup();
    const status = flow.injector.get(FlowStatusService);
    const model = flow.injector.get(FlowEntitiesService).getNode('free')!;
    const pane = fixture.nativeElement.querySelector('.vflow-pane') as HTMLElement;
    const rect = pane.getBoundingClientRect();
    const move = (x: number, y: number) =>
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + x, clientY: rect.top + y }));

    expect(context.interaction()).toBeNull();
    move(5, 5);
    expect(context.pointer()).toBeNull();

    status.setNodeDragStartStatus(model);
    fixture.detectChanges();
    expect(context.interaction()).toBe('node-drag');
    move(15, 25);
    expect(context.pointer()).toEqual({ x: 15, y: 25 });

    status.setNodeDragEndStatus(model);
    fixture.detectChanges();
    expect(context.interaction()).toBeNull();
    expect(context.pointer()).toBeNull();
    move(1, 1);
    expect(context.pointer()).toBeNull();
  });

  it('exposes the viewport and size and pans by a delta', async () => {
    const { fixture, context } = await setup();

    expect(context.size()).toEqual({ width: 400, height: 300 });
    expect(context.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });

    context.panBy({ x: 10, y: -5 });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(context.viewport()).toEqual({ x: 10, y: -5, zoom: 1 });
  });

  it('converts between client, flow and node space against this flow', async () => {
    const { fixture, context } = await setup();
    const rect = (fixture.nativeElement.querySelector('.vflow-pane') as HTMLElement).getBoundingClientRect();

    expect(context.nodeSpaceToFlowPosition({ x: 1, y: 2 }, 'child')).toEqual({ x: 111, y: 122 });
    expect(context.flowToNodeSpacePosition({ x: 111, y: 122 }, 'parent')).toEqual({ x: 11, y: 22 });
    expect(context.nodeSpaceToFlowPosition({ x: 0, y: 0 }, 'missing')).toBeUndefined();
    expect(context.clientToFlowPosition({ x: rect.left + 7, y: rect.top + 9 })).toEqual({ x: 7, y: 9 });
    expect(context.flowToClientPosition({ x: 7, y: 9 })).toEqual({ x: rect.left + 7, y: rect.top + 9 });
  });
});
