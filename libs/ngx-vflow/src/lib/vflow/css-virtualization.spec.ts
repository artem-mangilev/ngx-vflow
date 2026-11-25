import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode, Node } from './interfaces/node.interface';
import { createEdge, Edge } from './interfaces/edge.interface';
import { EdgeDetachedChange } from './types/edge-change.type';
import { VflowHandleDirective } from './public-directives/handle.directive';
import { VflowNodeToolbarComponent } from './public-components/node-toolbar/node-toolbar.component';
import { VflowResizableComponent } from './public-components/resizable/resizable.component';
import { VflowEdgeLabelTemplateDirective } from './public-directives/template.directive';
import { dispatchMouse, dispatchPointer } from './gestures/pointer-events.testing';

/** An edge presentation that declares a center label, so the flow renders it in the label layer. */
@Component({
  template: `<span *vEdgeLabel>Label</span>`,
  imports: [VflowEdgeLabelTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelEdgeComponent {}

@Component({
  template: `<div [style.width.px]="width()" [style.height.px]="height()">
    <input [value]="draft" (input)="draft = $any($event.target).value" />
    <span vHandle handleType="target" position="left"></span><span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StatefulNodeComponent {
  width = signal(240);
  height = signal(80);
  draft = '';
}

@Component({
  template: `<div class="card" style="width: 100px; height: 50px">
    Drag me<span vHandle handleType="source" position="right"></span><v-node-toolbar>Tools</v-node-toolbar>
  </div>`,
  imports: [VflowHandleDirective, VflowNodeToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DragNodeComponent {}

@Component({
  template: `<div class="card" style="width: 100px; height: 50px">
    <span vHandle handleType="target" position="left"></span><span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainNodeComponent {}

@Component({
  template: `<div class="card" style="width: 100px; height: 50px" vResizable>
    <span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [VflowHandleDirective, VflowResizableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResizableNodeComponent {}

/** `toEqual` compares DOM nodes structurally; the lists must keep the very same elements. */
function expectSameElements(actual: Element[], expected: Element[]) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((element, i) => expect(element).toBe(expected[i]));
}

/** A row of plain nodes at the given x positions, with ids '0', '1', … */
const row = (xs: number[], y = 0) =>
  xs.map((x, i) => createNode({ id: String(i), component: PlainNodeComponent, point: { x, y } }));

describe('CSS viewport virtualization', () => {
  let fixture: ComponentFixture<VflowComponent>;
  let flow: VflowComponent;
  let root: HTMLElement;

  afterEach(() => vi.useRealTimers());

  /** Renders a 400 × 300 flow with virtualization and waits for its first layout. */
  async function render(nodes: Node[], edges: Edge[] = [], inputs: Record<string, unknown> = {}) {
    fixture = TestBed.createComponent(VflowComponent);
    flow = fixture.componentInstance;
    root = fixture.nativeElement;
    Object.assign(root.style, { width: '400px', height: '300px' });
    fixture.componentRef.setInput('virtualization', true);
    fixture.componentRef.setInput('nodes', nodes);
    fixture.componentRef.setInput('edges', edges);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    const initialized = new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()));
    fixture.detectChanges();
    await initialized;
    await update();
  }

  async function update() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function moveViewport(x: number, y = 0, zoom = flow.viewport().zoom) {
    await flow.setViewport({ x, y, zoom });
    await update();
  }

  const nodeHosts = () => Array.from(root.querySelectorAll<HTMLElement>('[data-v-node]'));
  const edgeHosts = () => Array.from(root.querySelectorAll<SVGElement>('svg[edge]'));
  const graphElements = () => Array.from(root.querySelectorAll('[data-v-node], svg[edge]'));
  const display = (element: Element) => getComputedStyle(element).display;
  const inLayout = (element: Element) => display(element) !== 'none';

  describe('retained views', () => {
    it('keeps the node and edge elements while the viewport pans and zooms', async () => {
      await render(row([0, 1000]), [createEdge({ id: 'edge', source: '0', target: '1' })]);
      const before = graphElements();

      await moveViewport(-1000);
      flow.zoomTo(0.8);
      await update();

      expectSameElements(graphElements(), before);
    });

    it('keeps the node and edge elements while a node is dragged', async () => {
      await render(row([0, 200]), [createEdge({ id: 'edge', source: '0', target: '1' })], {
        nodeDragThreshold: 0,
        autoPan: false,
      });
      const before = graphElements();
      const card = root.querySelector('.card')!;

      dispatchMouse(card, 'mousedown', { x: 20, y: 20 });
      dispatchMouse(window, 'mousemove', { x: 60, y: 20 });
      await update();

      expectSameElements(graphElements(), before);
      dispatchMouse(window, 'mouseup', { x: 60, y: 20 });
    });

    it('keeps the node and edge elements when a node is selected', async () => {
      await render(row([0, 200]), [createEdge({ id: 'edge', source: '0', target: '1' })]);
      const before = graphElements();

      root.querySelector('.card')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await update();

      expectSameElements(graphElements(), before);
    });

    it('keeps the node and edge elements while a connection is dragged', async () => {
      await render(row([0, 200]));
      const before = graphElements();

      dispatchMouse(nodeHosts()[0].querySelector('[data-v-handle-type="source"]')!, 'mousedown', { x: 0, y: 0 });
      await update();

      expectSameElements(graphElements(), before);
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
    });

    it('keeps the elements of nodes and edges that the viewport leaves and reaches again', async () => {
      await render(row([10, 250]), [createEdge({ id: 'a-b', source: '0', target: '1' })]);
      const before = graphElements();

      await moveViewport(1000);
      expect(graphElements().map(display)).toEqual(['none', 'none', 'none']);
      await moveViewport(0);

      expectSameElements(graphElements(), before);
    });

    it('reports no detached edge when the viewport leaves its nodes and comes back', async () => {
      await render(row([10, 250]), [createEdge({ id: 'a-b', source: '0', target: '1' })]);
      const detached: EdgeDetachedChange[][] = [];
      flow.edgesChangesDetached.subscribe((changes) => detached.push(changes));
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });

      await flow.setViewport({ x: 1000, y: 0, zoom: 1 });
      TestBed.tick();
      await flow.setViewport({ x: 0, y: 0, zoom: 1 });
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(300);

      expect(detached).toEqual([]);
    });
  });

  describe('a node drag', () => {
    beforeEach(async () => {
      await render(
        [
          createNode({ id: '0', component: DragNodeComponent, point: { x: 0, y: 50 } }),
          ...row([200, 1000], 50).map((node, i) => ({ ...node, id: String(i + 1) })),
        ],
        [createEdge({ id: 'edge', source: '0', target: '1', component: LabelEdgeComponent })],
        { autoPan: false, nodeDragThreshold: 0 },
      );
    });

    /** Drags the first node by 60px to the right, one pointer move per frame. */
    async function drag() {
      const card = root.querySelector('.card')!;
      dispatchMouse(card, 'mousedown', { x: 20, y: 70 });
      for (const x of [40, 60, 80]) {
        dispatchMouse(window, 'mousemove', { x, y: 70 });
        await update();
      }
    }

    afterEach(() => dispatchMouse(window, 'mouseup', { x: 80, y: 70 }));

    it('moves the dragged node', async () => {
      await drag();

      expect(nodeHosts()[0].style.transform).toBe('translate(60px, 50px)');
    });

    it('redraws the edge of the dragged node', async () => {
      const path = () => root.querySelector('svg[edge] path[data-v-interactive-edge]')!.getAttribute('d');
      const before = path();

      await drag();

      expect(path()).not.toBe(before);
    });

    it('moves the label of the edge of the dragged node', async () => {
      const label = root.querySelector<HTMLElement>('[edgeLabelHost]')!;
      const before = label.getBoundingClientRect().x;

      await drag();

      expect(label.getBoundingClientRect().x).not.toBe(before);
    });

    it('moves the toolbar with the dragged node', async () => {
      const toolbar = root.querySelector('v-node-toolbar')!;
      const before = toolbar.getBoundingClientRect().x;

      await drag();

      expect(toolbar.getBoundingClientRect().x - before).toBeCloseTo(60);
    });
  });

  describe('nodes outside the first viewport', () => {
    beforeEach(() =>
      render(
        [-400, 800].map((x, i) => createNode({ id: String(i), component: StatefulNodeComponent, point: { x, y: 0 } })),
        [createEdge({ id: 'edge', source: '0', target: '1' })],
        { lazyLoadTrigger: 'viewport', minZoom: 0.1 },
      ),
    );

    it('measures custom nodes that start outside the viewport', () => {
      expect([flow.getNodeRect('0'), flow.getNodeRect('1')]).toEqual([
        { x: -400, y: 0, width: 240, height: 80 },
        { x: 800, y: 0, width: 240, height: 80 },
      ]);
    });

    it('takes nodes outside the viewport out of layout', () => {
      expect(nodeHosts().map(display)).toEqual(['none', 'none']);
    });

    it.each([1, 0.1])('shows an edge that crosses the viewport between them at zoom %s', async (zoom) => {
      flow.zoomTo(zoom);
      await update();

      const [edge] = edgeHosts();
      // Nodes the zoom brings into the viewport are measured again before the edge between them is shown.
      await expect.poll(() => getComputedStyle(edge).visibility).toBe('visible');
      expect(inLayout(edge)).toBe(true);
    });
  });

  describe('an edge with a custom curve between offscreen nodes', () => {
    async function renderCurve(path: string) {
      await render(row([-1000, -1000], -1000), [
        createEdge({ id: 'edge', source: '0', target: '1', curve: () => ({ path }) }),
      ]);
      return edgeHosts()[0];
    }

    it('is shown when the curve makes a detour through the viewport', async () => {
      expect(inLayout(await renderCurve('M -1000,-1000 Q 2000,1500 -900,-1000'))).toBe(true);
    });

    it('is hidden when the whole curve stays outside the viewport', async () => {
      expect(inLayout(await renderCurve('M -1000,-1000 l 100,0'))).toBe(false);
    });
  });

  describe('a node hidden by virtualization', () => {
    let component: StatefulNodeComponent;
    let input: HTMLInputElement;
    let host: HTMLElement;

    beforeEach(async () => {
      await render([createNode({ id: 'a', component: StatefulNodeComponent, point: { x: 0, y: 0 } })]);
      component = fixture.debugElement.query(By.directive(StatefulNodeComponent)).componentInstance;
      host = nodeHosts()[0];
      input = host.querySelector('input')!;
      input.value = 'unsaved draft';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await moveViewport(1000);
    });

    it('is out of layout', () => {
      expect(display(host)).toBe('none');
    });

    it('keeps its measured size while its content changes', async () => {
      component.width.set(320);
      component.height.set(120);
      await update();

      expect(flow.getNodeRect('a')).toEqual({ x: 0, y: 0, width: 240, height: 80 });
    });

    it('is shown when it comes back only once it is remeasured, so its first visible frame has the new size', async () => {
      component.width.set(320);
      component.height.set(120);
      await update();

      flow.setViewport({ x: 0, y: 0, zoom: 1 });
      fixture.detectChanges();
      await expect.poll(() => getComputedStyle(host).visibility).toBe('visible');

      expect(flow.getNodeRect('a')).toEqual({ x: 0, y: 0, width: 320, height: 120 });
      expect(host.querySelector<HTMLElement>('[data-v-handle][data-v-handle-position="right"]')!.style.top).toBe(
        '60px',
      );
    });

    it('keeps its component, its elements and the unsaved input when it comes back', async () => {
      await moveViewport(0);

      expect(fixture.debugElement.query(By.directive(StatefulNodeComponent)).componentInstance).toBe(component);
      expect(host.querySelector('input')).toBe(input);
      expect([component.draft, input.value]).toEqual(['unsaved draft', 'unsaved draft']);
    });

    it('is shown again without being recreated when virtualization is turned off', async () => {
      fixture.componentRef.setInput('virtualization', false);
      await update();

      expect(inLayout(host)).toBe(true);
      expect(fixture.debugElement.query(By.directive(StatefulNodeComponent)).componentInstance).toBe(component);
    });
  });

  describe('a pan', () => {
    let pane: HTMLElement;

    beforeEach(async () => {
      await render(row([0, 1000]), [
        createEdge({ id: 'near', source: '0', target: '0' }),
        createEdge({ id: 'far', source: '1', target: '1' }),
      ]);
      pane = root.querySelector('.v-pane')!;
    });

    /** Presses on the pane and moves the pointer by `dx`, without releasing it. */
    async function panBy(dx: number) {
      dispatchPointer(pane, 'pointerdown', { x: 100, y: 100 });
      dispatchPointer(window, 'pointermove', { x: 100 + dx, y: 100 });
      await update();
    }

    async function release() {
      dispatchPointer(window, 'pointerup', { x: 0, y: 100 });
      await update();
    }

    it('starts with the entities outside the viewport out of layout', () => {
      expect([nodeHosts()[1], edgeHosts()[1]].map(inLayout)).toEqual([false, false]);
    });

    it('shows the entities it brings into the viewport while it goes on', async () => {
      await panBy(-1000);

      expect([nodeHosts()[1], edgeHosts()[1]].map(inLayout)).toEqual([true, true]);
      await release();
    });

    it('keeps the entities it moves out of the viewport in layout while it goes on', async () => {
      await panBy(-1000);

      expect([nodeHosts()[0], edgeHosts()[0]].map(inLayout)).toEqual([true, true]);
      await release();
    });

    it('takes the entities it moved out of the viewport out of layout when it ends', async () => {
      await panBy(-1000);
      await release();

      expect([nodeHosts()[0], edgeHosts()[0]].map(inLayout)).toEqual([false, false]);
    });

    it('takes the entities it moved out of the viewport out of layout when the viewport rests', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      dispatchPointer(pane, 'pointerdown', { x: 100, y: 100 });
      dispatchPointer(window, 'pointermove', { x: -900, y: 100 });
      TestBed.tick();
      expect([nodeHosts()[0], edgeHosts()[0]].map(inLayout)).toEqual([true, true]);

      vi.advanceTimersByTime(300);
      TestBed.tick();

      expect([nodeHosts()[0], edgeHosts()[0]].map(inLayout)).toEqual([false, false]);
      vi.useRealTimers();
      await release();
    });
  });

  describe('a node that moves without a viewport change', () => {
    beforeEach(() => render(row([0])));

    it('is taken out of layout when it leaves the viewport', async () => {
      flow.nodes()[0].point.set({ x: 5000, y: 5000 });
      await update();

      expect(inLayout(nodeHosts()[0])).toBe(false);
    });

    it('is shown when it comes back into the viewport', async () => {
      flow.nodes()[0].point.set({ x: 5000, y: 5000 });
      await update();
      flow.nodes()[0].point.set({ x: 10, y: 10 });
      await update();

      expect(inLayout(nodeHosts()[0])).toBe(true);
    });
  });

  describe('a selected node with focus outside the viewport', () => {
    let input: HTMLInputElement;

    beforeEach(async () => {
      await render([createNode({ id: 'a', component: StatefulNodeComponent, point: { x: 0, y: 0 }, selected: true })]);
      input = nodeHosts()[0].querySelector('input')!;
      input.focus();
      await moveViewport(1000);
    });

    it('stays in layout and keeps the focus', () => {
      expect(document.activeElement).toBe(input);
      expect(inLayout(nodeHosts()[0])).toBe(true);
    });

    it('is taken out of layout once it loses focus, although it is selected', async () => {
      input.blur();
      await update();

      expect(inLayout(nodeHosts()[0])).toBe(false);
    });
  });

  describe('a drag of selected nodes out of the viewport', () => {
    beforeEach(async () => {
      await render(
        [0, 150].map((x, i) =>
          createNode({ id: String(i), component: PlainNodeComponent, point: { x, y: 0 }, selected: true }),
        ),
        [],
        { nodeDragThreshold: 0, autoPan: false },
      );
      dispatchMouse(root.querySelector('.card')!, 'mousedown', { x: 20, y: 20 });
      dispatchMouse(window, 'mousemove', { x: -1000, y: 20 });
      await update();
    });

    it('keeps every dragged node in layout until the drag ends', async () => {
      expect(nodeHosts().map(inLayout)).toEqual([true, true]);
      dispatchMouse(window, 'mouseup', { x: -1000, y: 20 });
    });

    it('takes the dragged nodes out of layout when the drag ends', async () => {
      dispatchMouse(window, 'mouseup', { x: -1000, y: 20 });
      await update();

      expect(nodeHosts().map(inLayout)).toEqual([false, false]);
    });
  });

  describe('a node being resized', () => {
    beforeEach(async () => {
      await render([createNode({ id: 'a', component: ResizableNodeComponent, point: { x: 0, y: 0 } })]);
      const control = root.querySelector('[data-v-resize-control-position="right"]')!;
      const { x, y } = control.getBoundingClientRect();
      dispatchPointer(control, 'pointerdown', { x, y });
      dispatchPointer(window, 'pointermove', { x: x + 10, y });
      await moveViewport(1000);
    });

    it('stays in layout outside the viewport', () => {
      expect(inLayout(nodeHosts()[0])).toBe(true);
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
    });

    it('is taken out of layout when the resize ends', async () => {
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
      await update();

      expect(inLayout(nodeHosts()[0])).toBe(false);
    });
  });

  describe('a node a connection is dragged from', () => {
    beforeEach(async () => {
      await render(row([0]));
      dispatchMouse(nodeHosts()[0].querySelector('[data-v-handle-type="source"]')!, 'mousedown', { x: 0, y: 0 });
      await moveViewport(1000);
    });

    it('stays in layout outside the viewport', () => {
      expect(inLayout(nodeHosts()[0])).toBe(true);
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
    });

    it('is taken out of layout when the connection ends', async () => {
      dispatchPointer(window, 'pointerup', { x: 0, y: 0 });
      await update();

      expect(inLayout(nodeHosts()[0])).toBe(false);
    });
  });
});
