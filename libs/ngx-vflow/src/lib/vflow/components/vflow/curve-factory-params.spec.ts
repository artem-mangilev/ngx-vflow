import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from './vflow.component';
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

async function update(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('curve factory parameters', () => {
  async function createFixture(curve: CurveFactory) {
    const fixture = TestBed.createComponent(CurveFactoryHostComponent);
    fixture.componentInstance.edges().forEach((edge) => edge.curve.set(curve));
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
    await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    await update(fixture);
    return fixture;
  }

  async function lastParams() {
    let params: CurveFactoryParams | undefined;
    await createFixture((p) => {
      params = p;
      return { path: '' };
    });
    return params!;
  }

  it('gives every node in allNodes, in input order', async () => {
    expect((await lastParams()).allNodes.map((node) => node.id)).toEqual(['a', 'b', 'c']);
  });

  it('gives the rendered geometry of every node, with its parent, in the order of allNodes', async () => {
    expect((await lastParams()).nodeGeometries).toEqual([
      { id: 'a', parentId: null, x: 0, y: 0, width: 200, height: 100 },
      { id: 'b', parentId: null, x: 400, y: 0, width: 200, height: 100 },
      { id: 'c', parentId: 'b', x: 410, y: 20, width: 200, height: 100 },
    ]);
  });

  it('gives the geometry of the source node', async () => {
    expect((await lastParams()).sourceNode).toEqual({ id: 'a', parentId: null, x: 0, y: 0, width: 200, height: 100 });
  });

  it('does not run a factory that ignores nodeGeometries again when an unrelated node moves', async () => {
    let calls = 0;
    const fixture = await createFixture((params) => {
      calls++;
      return { path: `M ${params.sourcePoint.x},${params.sourcePoint.y}` };
    });
    const before = calls;

    fixture.componentInstance.nodes[2].point.set({ x: 50, y: 20 });
    await update(fixture);

    expect(calls).toBe(before);
  });

  it('runs a factory that reads nodeGeometries again when an unrelated node moves', async () => {
    let calls = 0;
    const fixture = await createFixture((params) => {
      calls++;
      return { path: `M ${params.sourcePoint.x},${params.sourcePoint.y}`, bounds: params.nodeGeometries[2] };
    });
    const before = calls;

    fixture.componentInstance.nodes[2].point.set({ x: 90, y: 20 });
    await update(fixture);

    expect(calls).toBeGreaterThan(before);
  });
});
