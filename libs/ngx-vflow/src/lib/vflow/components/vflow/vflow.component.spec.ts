import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Node, createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { NodeDragEvent } from '../../directives/node-drag-controller.directive';
import { NodePositionChange } from '../../types/node-change.type';
import { dispatchMouse } from '../../gestures/pointer-events.testing';
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

@Component({
  template: `
    <vflow [view]="[600, 400]" [nodes]="nodes" [edges]="edges">
      <ng-template vNode>
        <div style="width: 100px; height: 50px">
          <span vHandle handleType="target" position="left"></span>
          <span vHandle handleType="source" position="right"></span>
        </div>
      </ng-template>
    </vflow>
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HandlesHostComponent {
  public readonly vflow = viewChild.required(VflowComponent);
  public readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
  ]);
  public readonly edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b' },
    { id: 'a-gone', source: 'a', target: 'gone' },
  ]);
}

@Component({
  template: `
    <vflow
      [view]="[600, 400]"
      [nodes]="nodes"
      [snapGrid]="[20, 20]"
      [nodeDragThreshold]="0"
      [autoPan]="false"
      (nodeDragStart)="drags.push(['start', $event])"
      (nodeDrag)="drags.push(['drag', $event])"
      (nodeDragEnd)="drags.push(['end', $event])"
      (nodesChanges.position)="positions.push($event)">
      <ng-template vNode>
        <div class="card"></div>
      </ng-template>
    </vflow>
  `,
  styles: `
    .card {
      width: 100px;
      height: 50px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DragHostComponent {
  public readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 200, y: 0 } },
  ]);
  public readonly drags: Array<[string, NodeDragEvent]> = [];
  public readonly positions: NodePositionChange[][] = [];
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
    });
    const fixture = TestBed.createComponent(VflowTestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const { child, parent } = fixture.componentInstance;
    const hits = fixture.componentInstance.vflow().getNodesAtPoint({ x: 115, y: 125 });

    expect(hits.map(({ id }) => id)).toEqual(['child', 'parent']);
    expect(hits[0] === child).toBe(false);
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

  describe('viewport and coordinates', () => {
    async function createFixture() {
      const fixture = TestBed.createComponent(NodeRectHostComponent);
      // An offset of the flow on the page must not shift the conversions.
      fixture.nativeElement.style.cssText = 'display: block; margin: 37px 0 0 23px';
      await settle(fixture);
      return fixture;
    }

    it('converts between client and flow coordinates where nodes are drawn', async () => {
      const fixture = await createFixture();
      const vflow = fixture.componentInstance.vflow();
      await vflow.setViewport({ x: 50, y: 20, zoom: 2 });
      await settle(fixture);
      const card = fixture.nativeElement.querySelectorAll('.card')[1].getBoundingClientRect();

      // Node b is at (400, 0) and 200 × 100 in flow units.
      expect(vflow.flowToClientPosition({ x: 400, y: 0 })).toEqual({ x: card.left, y: card.top });
      expect(vflow.clientToFlowPosition({ x: card.right, y: card.bottom })).toEqual({ x: 600, y: 100 });
    });

    it('fits the nodes into the view, centered and inside the padding', async () => {
      const fixture = await createFixture();
      const vflow = fixture.componentInstance.vflow();
      const root = (fixture.nativeElement.querySelector('.v-root') as HTMLElement).getBoundingClientRect();

      expect(await vflow.fitView({ padding: 0.2 })).toBe(true);
      const bounds = vflow.getNodesBounds();
      const topLeft = vflow.flowToClientPosition(bounds);
      const bottomRight = vflow.flowToClientPosition({ x: bounds.x + bounds.width, y: bounds.y + bounds.height });

      expect((topLeft.x + bottomRight.x) / 2).toBeCloseTo(root.left + root.width / 2, 0);
      expect((topLeft.y + bottomRight.y) / 2).toBeCloseTo(root.top + root.height / 2, 0);
      expect(topLeft.x).toBeGreaterThanOrEqual(root.left);
      expect(bottomRight.x).toBeLessThanOrEqual(root.right);

      const zoom = vflow.viewport().zoom;
      await vflow.fitView({ padding: 0.5 });
      expect(vflow.viewport().zoom).toBeLessThan(zoom);

      await vflow.fitView({ nodes: ['a'] });
      const a = vflow.getNodeRect('a')!;
      const center = vflow.flowToClientPosition({ x: a.x + a.width / 2, y: a.y + a.height / 2 });
      expect(center.x).toBeCloseTo(root.left + root.width / 2, 0);
      expect(center.y).toBeCloseTo(root.top + root.height / 2, 0);
    });
  });

  describe('graph queries', () => {
    it('returns the nodes of the application that a node overlaps partially', async () => {
      const fixture = TestBed.createComponent(NodeRectHostComponent);
      await settle(fixture);
      const vflow = fixture.componentInstance.vflow();
      const [, b] = fixture.componentInstance.nodes;

      // The child is at (410, 20) in the flow and sticks out of its parent b at (400, 0).
      expect(vflow.getIntersectingNodes('child')).toEqual([b]);
      expect(vflow.getIntersectingNodes('child')[0]).toBe(b);
      expect(vflow.getIntersectingNodes('child', { partially: false })).toEqual([]);
      expect(vflow.getIntersectingNodes('a')).toEqual([]);
    });

    it('returns the nodes that wholly contain a node', async () => {
      const fixture = TestBed.createComponent(VflowTestHostComponent);
      await settle(fixture);
      const { parent, vflow } = fixture.componentInstance;

      expect(vflow().getIntersectingNodes('child', { partially: false })).toEqual([parent]);
      expect(vflow().getIntersectingNodes('parent', { partially: false })).toEqual([]);
    });

    it('returns the edges of the application that lost a node or a handle', async () => {
      const fixture = TestBed.createComponent(HandlesHostComponent);
      await settle(fixture);
      const { vflow, edges } = fixture.componentInstance;

      expect(vflow().getDetachedEdges()).toEqual([edges[1]]);
      expect(vflow().getDetachedEdges()[0]).toBe(edges[1]);
    });
  });

  it('reports a pointer drag of a node and snaps the node to the grid', async () => {
    const fixture = TestBed.createComponent(DragHostComponent);
    await settle(fixture);
    const host = fixture.componentInstance;
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    const { left, top } = card.getBoundingClientRect();

    // Each pointer event comes in a frame of its own, as in a browser.
    dispatchMouse(card, 'mousedown', { x: left + 5, y: top + 5 });
    await settle(fixture);
    for (const dx of [10, 25, 33]) {
      dispatchMouse(window, 'mousemove', { x: left + 5 + dx, y: top + 5 });
      await settle(fixture);
    }
    dispatchMouse(window, 'mouseup', { x: left + 38, y: top + 5 });
    await settle(fixture);

    const [a] = host.nodes;
    const kinds = host.drags.map(([kind]) => kind);
    expect(kinds[0]).toBe('start');
    expect(kinds.at(-1)).toBe('end');
    expect(kinds.filter((kind) => kind === 'drag').length).toBeGreaterThan(0);
    expect(host.drags.every(([, event]) => event.node === a)).toBe(true);

    const { x, y } = a.point();
    expect(x % 20).toBe(0);
    expect(Math.abs(x - 33)).toBeLessThan(20);
    expect(y).toBe(0);
    expect(host.nodes[1].point()).toEqual({ x: 200, y: 0 });
    expect(host.positions.flat().at(-1)).toEqual({ type: 'position', id: 'a', point: { x, y } });
  });
});
