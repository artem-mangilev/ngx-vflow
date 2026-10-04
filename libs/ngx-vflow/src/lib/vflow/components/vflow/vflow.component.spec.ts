import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Node, createNodes } from '../../interfaces/node.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';

@Component({
  template: `<vflow [view]="[400, 300]" [nodes]="nodes" />`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class VflowTestHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly parent: Node = {
    id: 'parent',
    point: signal({ x: 100, y: 100 }),
    parentId: signal(null),
    width: signal(200),
    height: signal(200),
  };
  public readonly child: Node = {
    id: 'child',
    point: signal({ x: 10, y: 20 }),
    parentId: signal('parent'),
    // Without a presentation the node renders an empty wrapper, so its hit area comes from an explicit size.
    width: signal(100),
    height: signal(50),
  };
  public readonly nodes = [this.parent, this.child];
}

@Component({
  template: `
    <vflow [view]="[800, 600]" [nodes]="nodes">
      <ng-template vNode>
        <div class="card"></div>
      </ng-template>
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
class NodeRectHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 400, y: 0 } },
    { id: 'child', point: { x: 10, y: 20 }, parentId: 'b' },
  ]);
}

@Component({
  template: `
    <vflow [view]="[800, 600]" [nodes]="nodes()">
      <ng-template vNode>
        <div class="card"></div>
      </ng-template>
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
class LateSignalHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly node: Node = { id: 'a', point: signal({ x: 0, y: 0 }) };
  public readonly nodes = signal([this.node]);
}

async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
  fixture.detectChanges();
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('VflowComponent', () => {
  describe('rendered node rectangles', () => {
    async function createFixture() {
      TestBed.configureTestingModule({
        imports: [NodeRectHostComponent],
        providers: [provideZonelessChangeDetection()],
      });
      const fixture = TestBed.createComponent(NodeRectHostComponent);
      await settle(fixture);
      return fixture;
    }

    it('returns the measured size of a content-sized node without writing it into the node', async () => {
      const fixture = await createFixture();
      const { vflow, nodes } = fixture.componentInstance;

      expect(vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 200, height: 100 });
      expect(nodes[0].width).toBeUndefined();
      expect(nodes[0].height).toBeUndefined();
    });

    it('returns a nested node in flow space', async () => {
      const fixture = await createFixture();

      expect(fixture.componentInstance.vflow().getNodeRect('child')).toEqual({
        x: 410,
        y: 20,
        width: 200,
        height: 100,
      });
    });

    it('returns undefined for an unknown node', async () => {
      const fixture = await createFixture();

      expect(fixture.componentInstance.vflow().getNodeRect('missing')).toBeUndefined();
    });

    it('bounds the measured nodes, all of them by default', async () => {
      const fixture = await createFixture();
      const { vflow } = fixture.componentInstance;

      expect(vflow().getNodesBounds(['a', 'b'])).toEqual({ x: 0, y: 0, width: 600, height: 100 });
      expect(vflow().getNodesBounds()).toEqual({ x: 0, y: 0, width: 610, height: 120 });
      expect(vflow().getNodesBounds(['missing'])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });
  });

  it('reads a size signal added to a node object once the same object comes in a new array', async () => {
    TestBed.configureTestingModule({
      imports: [LateSignalHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(LateSignalHostComponent);
    await settle(fixture);
    const { vflow, node, nodes } = fixture.componentInstance;
    const card = fixture.nativeElement.querySelector('.card');
    expect(vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 200, height: 100 });

    node.width = signal(320);
    nodes.update((list) => [...list]);
    await settle(fixture);

    expect(vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 320, height: 100 });
    // The same object keeps its model and its view.
    expect(fixture.nativeElement.querySelector('.card')).toBe(card);

    node.width.set(260);
    await settle(fixture);
    expect(vflow().getNodeRect('a')?.width).toBe(260);
  });

  it('returns shallow node copies with snapshot node-space points in topmost-first order', async () => {
    TestBed.configureTestingModule({
      imports: [VflowTestHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(VflowTestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const { child, parent } = fixture.componentInstance;
    const hits = fixture.componentInstance.vflow().getNodesAtPoint({ x: 115, y: 125 });

    expect(hits.map(({ id }) => id)).toEqual(['child', 'parent']);
    expect(hits[0] === child).toBeFalse();
    expect(hits[0].point).toBe(child.point);
    expect(hits[0].parentId).toBe(child.parentId);
    expect(hits[0].nodeSpacePoint).toEqual({ x: 5, y: 5 });
    expect(hits[1].point).toBe(parent.point);
    expect(hits[1].nodeSpacePoint).toEqual({ x: 15, y: 25 });

    child.point.set({ x: 20, y: 30 });
    expect(hits[0].nodeSpacePoint).toEqual({ x: 5, y: 5 });

    hits[0].nodeSpacePoint.x = 999;
    expect(fixture.componentInstance.vflow().getNodesAtPoint({ x: 125, y: 135 })[0].nodeSpacePoint).toEqual({
      x: 5,
      y: 5,
    });
  });
});
