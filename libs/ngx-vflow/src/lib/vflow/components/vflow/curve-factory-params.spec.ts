import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createEdges } from '../../interfaces/edge.interface';
import { createNodes } from '../../interfaces/node.interface';
import { CurveFactory, CurveFactoryParams } from '../../interfaces/curve-factory.interface';
import { Vflow } from '../../vflow';

/** Content-sized cards: their size is measured, not written into the node. */
@Component({
  template: `
    <vflow style="width: 800px; height: 600px" [nodes]="nodes" [edges]="edges()">
      <div *vNode class="card">
        <span vHandle handleType="target" position="left"></span>
        <span vHandle handleType="source" position="right"></span>
      </div>
    </vflow>
  `,
  styles: `
    .card {
      width: 200px;
      height: 100px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CurveFactoryHostComponent {
  public readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 400, y: 0 } },
    { id: 'c', point: { x: 10, y: 20 }, parentId: 'b' },
  ]);
  public readonly edges = signal(createEdges([{ id: 'a-b', source: 'a', target: 'b', curve: () => ({ path: '' }) }]));
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('curve factory parameters', () => {
  async function createFixture(curve: CurveFactory) {
    TestBed.configureTestingModule({ imports: [CurveFactoryHostComponent] });
    const fixture = TestBed.createComponent(CurveFactoryHostComponent);
    fixture.componentInstance.edges().forEach((edge) => edge.curve.set(curve));
    await settle(fixture);
    return fixture;
  }

  it('gives the rendered geometry of every node, with its parent, in the order of allNodes', async () => {
    let params: CurveFactoryParams | undefined;
    await createFixture((p) => {
      params = p;
      return { path: '' };
    });

    expect(params!.allNodes.map((node) => node.id)).toEqual(['a', 'b', 'c']);
    expect(params!.nodeGeometries).toEqual([
      { id: 'a', parentId: null, x: 0, y: 0, width: 200, height: 100 },
      { id: 'b', parentId: null, x: 400, y: 0, width: 200, height: 100 },
      { id: 'c', parentId: 'b', x: 410, y: 20, width: 200, height: 100 },
    ]);
    expect(params!.sourceNode).toEqual(params!.nodeGeometries[0]);
  });

  it('recomputes the path of an unrelated node move only for a factory that reads nodeGeometries', async () => {
    let plainCalls = 0;
    let routingCalls = 0;
    const fixture = await createFixture((params) => {
      plainCalls++;
      return { path: `M ${params.sourcePoint.x},${params.sourcePoint.y}` };
    });
    const { nodes, edges } = fixture.componentInstance;
    const plainBefore = plainCalls;

    nodes[2].point.set({ x: 50, y: 20 });
    await settle(fixture);
    expect(plainCalls).toBe(plainBefore);

    edges()[0].curve.set((params) => {
      routingCalls++;
      return { path: `M ${params.sourcePoint.x},${params.sourcePoint.y}`, bounds: params.nodeGeometries[2] };
    });
    await settle(fixture);
    const routingBefore = routingCalls;
    expect(routingBefore).toBeGreaterThan(0);

    nodes[2].point.set({ x: 90, y: 20 });
    await settle(fixture);
    expect(routingCalls).toBeGreaterThan(routingBefore);
    expect(plainCalls).toBe(plainBefore);
  });
});
