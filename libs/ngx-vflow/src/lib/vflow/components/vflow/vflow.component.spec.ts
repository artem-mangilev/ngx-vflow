import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Node, createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { NodeDragEvent } from '../../interfaces/node-drag-event.interface';
import { NodePositionChange } from '../../types/node-change.type';
import { dispatchMouse } from '../../gestures/pointer-events.testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes" />`,
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
    <vflow style="width: 800px; height: 600px" [nodes]="nodes">
      <div *vNode class="card"></div>
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
    <vflow style="width: 800px; height: 600px" [nodes]="nodes()">
      <div *vNode class="card"></div>
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
    <vflow style="width: 600px; height: 400px" [nodes]="nodes" [edges]="edges">
      <div *vNode style="width: 100px; height: 50px">
        <span vHandle handleType="target" position="left"></span>
        <span vHandle handleType="source" position="right"></span>
      </div>
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
      style="width: 600px; height: 400px"
      [nodes]="nodes"
      [snapGrid]="[20, 20]"
      [nodeDragThreshold]="0"
      [autoPan]="false"
      (nodeDragStart)="drags.push(['start', $event])"
      (nodeDrag)="drags.push(['drag', $event])"
      (nodeDragEnd)="drags.push(['end', $event])"
      (nodesChanges.position)="positions.push($event)">
      <div *vNode class="card"></div>
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

/** Renders the fixture and waits for the first layout of its flow. */
async function render<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  const flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance as VflowComponent;
  await new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
  await update(fixture);
  return fixture;
}

async function update<T>(fixture: ComponentFixture<T>) {
  fixture.detectChanges();
  await fixture.whenStable();
}

/** One animation frame: a browser delivers pointer events of a slow pointer in frames of their own. */
const frame = () => new Promise(requestAnimationFrame);

describe('VflowComponent', () => {
  describe('rendered node rectangles', () => {
    const createFixture = () => render(TestBed.createComponent(NodeRectHostComponent));

    it('returns the measured size of a content-sized node', async () => {
      const fixture = await createFixture();

      expect(fixture.componentInstance.vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 200, height: 100 });
    });

    it('does not write the measured size into the node', async () => {
      const fixture = await createFixture();
      const [a] = fixture.componentInstance.nodes;

      expect([a.width, a.height]).toEqual([undefined, undefined]);
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

    it.each([
      ['the given nodes', ['a', 'b'], { x: 0, y: 0, width: 600, height: 100 }],
      ['every node by default', undefined, { x: 0, y: 0, width: 610, height: 120 }],
      ['no unknown node', ['missing'], { x: 0, y: 0, width: 0, height: 0 }],
    ])('bounds %s', async (_, ids, bounds) => {
      const fixture = await createFixture();

      expect(fixture.componentInstance.vflow().getNodesBounds(ids)).toEqual(bounds);
    });
  });

  describe('a size signal added to a node object', () => {
    async function addWidth() {
      const fixture = await render(TestBed.createComponent(LateSignalHostComponent));
      const { node, nodes } = fixture.componentInstance;
      const card = fixture.nativeElement.querySelector('.card');
      node.width = signal(320);
      nodes.update((list) => [...list]);
      await update(fixture);
      return { fixture, card };
    }

    it('is read once the same object comes in a new array', async () => {
      const { fixture } = await addWidth();

      expect(fixture.componentInstance.vflow().getNodeRect('a')).toEqual({ x: 0, y: 0, width: 320, height: 100 });
    });

    it('keeps the view of the node', async () => {
      const { fixture, card } = await addWidth();

      expect(fixture.nativeElement.querySelector('.card')).toBe(card);
    });

    it('is followed afterwards', async () => {
      const { fixture } = await addWidth();

      fixture.componentInstance.node.width!.set(260);
      await update(fixture);

      expect(fixture.componentInstance.vflow().getNodeRect('a')?.width).toBe(260);
    });
  });

  describe('nodes at a point', () => {
    const createFixture = () => render(TestBed.createComponent(VflowTestHostComponent));

    it('returns the application nodes, topmost first, with points in node space', async () => {
      const fixture = await createFixture();
      const { child, parent, vflow } = fixture.componentInstance;

      const hits = vflow().getNodesAtPoint({ x: 115, y: 125 });

      expect(hits).toEqual([
        { node: child, nodeSpacePoint: { x: 5, y: 5 } },
        { node: parent, nodeSpacePoint: { x: 15, y: 25 } },
      ]);
      expect(hits[0].node).toBe(child);
    });

    it('returns a snapshot that does not follow a later move of the node', async () => {
      const fixture = await createFixture();
      const { child, vflow } = fixture.componentInstance;
      const [hit] = vflow().getNodesAtPoint({ x: 115, y: 125 });

      child.point.set({ x: 20, y: 30 });

      expect(hit.nodeSpacePoint).toEqual({ x: 5, y: 5 });
    });

    it('is not changed by a write to a point it returned', async () => {
      const fixture = await createFixture();
      const { vflow } = fixture.componentInstance;

      vflow().getNodesAtPoint({ x: 115, y: 125 })[0].nodeSpacePoint.x = 999;

      expect(vflow().getNodesAtPoint({ x: 115, y: 125 })[0].nodeSpacePoint).toEqual({ x: 5, y: 5 });
    });
  });

  describe('viewport and coordinates', () => {
    async function createFixture() {
      const fixture = TestBed.createComponent(NodeRectHostComponent);
      // An offset of the flow on the page must not shift the conversions.
      fixture.nativeElement.style.cssText = 'display: block; margin: 37px 0 0 23px';
      return render(fixture);
    }

    async function zoomedCard() {
      const fixture = await createFixture();
      const vflow = fixture.componentInstance.vflow();
      await vflow.setViewport({ x: 50, y: 20, zoom: 2 });
      await update(fixture);
      // Node b is at (400, 0) and 200 × 100 in flow units.
      const card = fixture.nativeElement.querySelectorAll('.card')[1].getBoundingClientRect() as DOMRect;
      return { vflow, card };
    }

    it('converts a flow point to the client point where it is drawn', async () => {
      const { vflow, card } = await zoomedCard();

      expect(vflow.flowToClientPosition({ x: 400, y: 0 })).toEqual({ x: card.left, y: card.top });
    });

    it('converts a client point to the flow point drawn there', async () => {
      const { vflow, card } = await zoomedCard();

      expect(vflow.clientToFlowPosition({ x: card.right, y: card.bottom })).toEqual({ x: 600, y: 100 });
    });

    function clientCenter(vflow: VflowComponent, rect: { x: number; y: number; width: number; height: number }) {
      return vflow.flowToClientPosition({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
    }

    it('fits the nodes into the view, centered and inside the padding', async () => {
      const fixture = await createFixture();
      const vflow = fixture.componentInstance.vflow();
      const root = (fixture.nativeElement.querySelector('[data-v-root]') as HTMLElement).getBoundingClientRect();

      expect(await vflow.fitView({ padding: 0.2 })).toBe(true);
      const bounds = vflow.getNodesBounds();
      const topLeft = vflow.flowToClientPosition(bounds);
      const bottomRight = vflow.flowToClientPosition({ x: bounds.x + bounds.width, y: bounds.y + bounds.height });
      const center = clientCenter(vflow, bounds);

      expect(center.x).toBeCloseTo(root.left + root.width / 2, 0);
      expect(center.y).toBeCloseTo(root.top + root.height / 2, 0);
      expect(topLeft.x).toBeGreaterThanOrEqual(root.left);
      expect(bottomRight.x).toBeLessThanOrEqual(root.right);
    });

    it('zooms out further for a greater padding', async () => {
      const fixture = await createFixture();
      const vflow = fixture.componentInstance.vflow();
      await vflow.fitView({ padding: 0.2 });
      const zoom = vflow.viewport().zoom;

      await vflow.fitView({ padding: 0.5 });

      expect(vflow.viewport().zoom).toBeLessThan(zoom);
    });

    it('centers the given nodes', async () => {
      const fixture = await createFixture();
      const vflow = fixture.componentInstance.vflow();
      const root = (fixture.nativeElement.querySelector('[data-v-root]') as HTMLElement).getBoundingClientRect();

      await vflow.fitView({ nodes: ['a'] });
      const center = clientCenter(vflow, vflow.getNodeRect('a')!);

      expect(center.x).toBeCloseTo(root.left + root.width / 2, 0);
      expect(center.y).toBeCloseTo(root.top + root.height / 2, 0);
    });
  });

  describe('graph queries', () => {
    it('returns the application object of a node that another node overlaps partially', async () => {
      const fixture = await render(TestBed.createComponent(NodeRectHostComponent));
      const [, b] = fixture.componentInstance.nodes;

      // The child is at (410, 20) in the flow and sticks out of its parent b at (400, 0).
      const [overlapped] = fixture.componentInstance.vflow().getIntersectingNodes('child');

      expect(overlapped).toBe(b);
    });

    it('returns no node that overlaps only partially when partial overlaps are excluded', async () => {
      const fixture = await render(TestBed.createComponent(NodeRectHostComponent));

      expect(fixture.componentInstance.vflow().getIntersectingNodes('child', { partially: false })).toEqual([]);
    });

    it('returns no node for a node that overlaps none', async () => {
      const fixture = await render(TestBed.createComponent(NodeRectHostComponent));

      expect(fixture.componentInstance.vflow().getIntersectingNodes('a')).toEqual([]);
    });

    it('returns the nodes that wholly contain a node when partial overlaps are excluded', async () => {
      const fixture = await render(TestBed.createComponent(VflowTestHostComponent));
      const { parent, vflow } = fixture.componentInstance;

      expect(vflow().getIntersectingNodes('child', { partially: false })).toEqual([parent]);
      expect(vflow().getIntersectingNodes('parent', { partially: false })).toEqual([]);
    });

    it('returns the application objects of the edges that lost a node or a handle', async () => {
      const fixture = await render(TestBed.createComponent(HandlesHostComponent));
      const { vflow, edges } = fixture.componentInstance;

      const detached = vflow().detachedEdges();

      expect(detached).toHaveLength(1);
      expect(detached[0]).toBe(edges[1]);
    });
  });

  describe('pointer drag of a node', () => {
    async function drag(selectAll = false) {
      const fixture = await render(TestBed.createComponent(DragHostComponent));
      const host = fixture.componentInstance;
      if (selectAll) {
        host.nodes.forEach((node) => node.selected?.set(true));
        await update(fixture);
      }
      const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
      const { left, top } = card.getBoundingClientRect();

      dispatchMouse(card, 'mousedown', { x: left + 5, y: top + 5 });
      await frame();
      for (const dx of [10, 25, 33]) {
        dispatchMouse(window, 'mousemove', { x: left + 5 + dx, y: top + 5 });
        await frame();
      }
      const release = dispatchMouse(window, 'mouseup', { x: left + 38, y: top + 5 });
      await update(fixture);
      return { host, release };
    }

    it('reports the start, every move and the end of the drag', async () => {
      const { host } = await drag();

      expect(host.drags.map(([kind]) => kind)).toEqual(['start', 'drag', 'drag', 'drag', 'end']);
    });

    it('reports the dragged node and the pointer events in the drag events', async () => {
      const { host, release } = await drag();
      const [a] = host.nodes;

      expect(
        host.drags.every(([, event]) => event.node === a && event.nodes.length === 1 && event.nodes[0] === a),
      ).toBe(true);
      expect(host.drags.every(([, event]) => event.sourceEvent.type.startsWith('pointer'))).toBe(true);
      expect(host.drags.at(-1)?.[1].sourceEvent).toBe(release);
    });

    it('snaps the dragged node to the grid, up to the next cell', async () => {
      const { host } = await drag();

      // Moved by 33 on a 20 grid.
      expect(host.nodes[0].point()).toEqual({ x: 40, y: 0 });
      expect(host.nodes[1].point()).toEqual({ x: 200, y: 0 });
    });

    it('reports the snapped point in nodesChanges.position', async () => {
      const { host } = await drag();

      await expect
        .poll(() => host.positions.flat().at(-1))
        .toEqual({ type: 'position', id: 'a', point: { x: 40, y: 0 } });
    });

    it('reports every node that a drag of a selection moves', async () => {
      const { host } = await drag(true);
      const [a, b] = host.nodes;

      expect(host.drags.length).toBeGreaterThan(0);
      expect(
        host.drags.every(
          ([, event]) =>
            event.node === a && event.nodes.length === 2 && event.nodes.includes(a) && event.nodes.includes(b),
        ),
      ).toBe(true);
    });

    it('reports every drag event when pointer events come within one frame', async () => {
      const fixture = await render(TestBed.createComponent(DragHostComponent));
      const host = fixture.componentInstance;
      const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
      const { left, top } = card.getBoundingClientRect();

      // No frame between the events: a fast pointer or an automated drag.
      dispatchMouse(card, 'mousedown', { x: left + 5, y: top + 5 });
      dispatchMouse(window, 'mousemove', { x: left + 15, y: top + 5 });
      dispatchMouse(window, 'mousemove', { x: left + 25, y: top + 5 });
      dispatchMouse(window, 'mouseup', { x: left + 25, y: top + 5 });
      await update(fixture);

      expect(host.drags.map(([kind]) => kind)).toEqual(['start', 'drag', 'drag', 'end']);
    });
  });
});
