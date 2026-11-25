import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { animationFrameScheduler } from 'rxjs';
import { AutoPanSettings } from '../../interfaces/auto-pan-settings.interface';
import { createEdge, Edge } from '../../interfaces/edge.interface';
import { createNode, Node } from '../../interfaces/node.interface';
import { ViewportState } from '../../interfaces/viewport.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { dispatchMouse } from '../../gestures/pointer-events.testing';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
  template: `<vflow
    [nodes]="nodes"
    [edges]="edges"
    style="width: 400px; height: 300px"
    [autoPan]="autoPan"
    (connect)="(undefined)"
    (reconnect)="(undefined)">
    <div *vNode style="width: 100px; height: 50px">
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
  </vflow>`,
})
class AutoPanHostComponent {
  @Input() autoPan: boolean | AutoPanSettings = true;
  @Input() nodes: Node[] = [];
  @Input() edges: Edge[] = [];
  @ViewChild(VflowComponent) flow!: VflowComponent;
}

type MouseType = 'mousedown' | 'mousemove' | 'mouseup';

describe('auto-pan', () => {
  let fixture: ComponentFixture<AutoPanHostComponent>;
  let frames: Map<number, FrameRequestCallback>;
  let now: number;
  let nextId: number;

  // Animation frames run on a mocked clock: a test advances it frame by frame.
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AutoPanHostComponent] });
    frames = new Map();
    now = 0;
    nextId = 0;
    vi.spyOn(animationFrameScheduler, 'now').mockImplementation(() => now);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(++nextId, callback);
      return nextId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => frames.delete(id));
  });

  afterEach(() => {
    mouse(window, 'mouseup', 0, 0);
    fixture?.destroy();
  });

  async function setup(autoPan: boolean | AutoPanSettings) {
    fixture = TestBed.createComponent(AutoPanHostComponent);
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'node', point: { x: 100, y: 100 } }),
      createNode({ id: 'target', point: { x: 250, y: 100 } }),
    ]);
    fixture.componentRef.setInput('edges', [
      createEdge({ id: 'edge', source: 'node', target: 'target', reconnectable: true }),
    ]);
    fixture.componentRef.setInput('autoPan', autoPan);
    fixture.detectChanges();
    await fixture.whenStable();
    // The flow reveals its nodes once it has measured itself and them.
    await expect
      .poll(() => getComputedStyle(fixture.nativeElement.querySelector('[data-v-node]')).visibility)
      .toBe('visible');
    frame(0);
  }

  function flow() {
    return fixture.componentInstance.flow;
  }

  function rootRect() {
    return (fixture.nativeElement.querySelector('[data-v-root]') as HTMLElement).getBoundingClientRect();
  }

  function mouse(target: EventTarget, type: MouseType, x: number, y: number) {
    dispatchMouse(target, type, { x, y });
  }

  function render() {
    fixture.detectChanges();
    TestBed.flushEffects();
  }

  /** Moves the pointer to a point of the flow, as the document sees it. */
  function pointTo(x: number, y: number) {
    const rect = rootRect();
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + x, clientY: rect.top + y }));
  }

  /** Presses `target` in the middle of the flow and moves the pointer to the flow point (x, y). */
  function press(target: Element, x: number, y: number) {
    const rect = rootRect();
    mouse(target, 'mousedown', rect.left + 200, rect.top + 150);
    render();
    pointTo(x, y);
  }

  /** Drags the first node to the flow point (x, y). */
  function drag(x = 0, y = 150) {
    const rect = rootRect();
    mouse(fixture.nativeElement.querySelector('[data-v-node]'), 'mousedown', rect.left + 110, rect.top + 110);
    mouse(window, 'mousemove', rect.left + x, rect.top + y);
    render();
    pointTo(x, y);
  }

  function release() {
    mouse(window, 'mouseup', 0, 150);
    render();
  }

  function frame(ms = 1000 / 60) {
    now += ms;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
    render();
  }

  it('reports the viewport change of an auto-pan once, when the drag ends', async () => {
    await setup(true);
    const ends: ViewportState[] = [];
    flow().viewportChangeEnd.subscribe((end) => ends.push(end));
    drag();
    frame();
    frame();
    frame();
    expect(ends).toEqual([]);
    release();
    expect(ends).toEqual([flow().viewport()]);
  });

  it('measures the edges from inside the border of the pane, as the pane gestures do', async () => {
    await setup({ speed: 120, margin: 50 });
    (fixture.nativeElement.querySelector('.v-pane') as HTMLElement).style.borderLeft = '30px solid';
    // 60 px from the outer edge of the pane is 30 px inside its border: within the margin.
    drag(60);
    frame(100);
    expect(flow().viewport().x).toBeGreaterThan(0);
  });

  it('pans by the configured speed in viewport pixels per second, eased by the depth into the margin', async () => {
    await setup({ speed: 120, margin: 100 });
    drag(50);
    frame(100);
    expect(flow().viewport().x).toBeCloseTo(3, 8);
  });

  it('keeps panning by elapsed time on later frames', async () => {
    await setup({ speed: 120, margin: 100 });
    drag(50);
    frame(100);
    frame(50);
    frame(50);
    expect(flow().viewport().x).toBeCloseTo(6, 8);
  });

  it.each([
    ...[-1, NaN, Infinity, -Infinity].map((value) => ({ field: 'speed', value })),
    ...[-1, NaN, Infinity, -Infinity].map((value) => ({ field: 'margin', value })),
  ])('falls back to the default for $field $value', async ({ field, value }) => {
    await setup({ [field]: value });
    drag(24);
    frame(100);
    expect(flow().viewport().x).toBeCloseTo(15, 8);
  });

  it.each<boolean | AutoPanSettings>([
    false,
    { speed: 0 },
    { margin: 0 },
    { nodeDrag: false },
    { nodeDrag: false, connectionDrag: false },
  ])('does not pan a node drag with %o', async (options) => {
    await setup(options);
    drag();
    frame(100);
    expect(flow().viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it.each([
    { x: 0, y: 150, expected: { x: 60, y: 0 } },
    { x: 400, y: 150, expected: { x: -60, y: 0 } },
    { x: 200, y: 0, expected: { x: 0, y: 60 } },
    { x: 200, y: 300, expected: { x: 0, y: -60 } },
    { x: 0, y: 0, expected: { x: 60, y: 60 } },
    { x: 48, y: 150, expected: { x: 0, y: 0 } },
    { x: 200, y: 150, expected: { x: 0, y: 0 } },
  ])('pans by $expected with the pointer at ($x, $y) and default options', async ({ x, y, expected }) => {
    await setup({});
    drag(x, y);
    frame(100);
    expect(flow().viewport()).toEqual({ ...expected, zoom: 1 });
  });

  describe.each([
    { name: 'connection creation', selector: '[data-v-handle][data-v-handle-type="source"]' },
    { name: 'reconnection', selector: '[data-v-reconnect-handle]' },
  ])('during $name', ({ selector }) => {
    it.each([
      { connectionDrag: true, x: 60 },
      { connectionDrag: false, x: 0 },
    ])('pans by $x with connectionDrag $connectionDrag', async ({ connectionDrag, x }) => {
      await setup({ nodeDrag: false, connectionDrag });
      press(fixture.nativeElement.querySelector(selector), 0, 150);
      frame(100);
      expect(flow().viewport().x).toBe(x);
    });

    it('stops panning once the drag ends', async () => {
      await setup({ nodeDrag: false, connectionDrag: true });
      press(fixture.nativeElement.querySelector(selector), 0, 150);
      frame(100);
      mouse(document, 'mouseup', rootRect().left, rootRect().top + 150);
      render();
      frame(100);
      expect(flow().viewport().x).toBe(60);
    });
  });

  it('reads the options object when it is bound, not when it mutates later', async () => {
    const options = { speed: 120, margin: 100 };
    await setup(options);
    options.speed = 600;
    drag(50);
    frame(100);
    expect(flow().viewport().x).toBeCloseTo(3, 8);
  });

  it('stops when the binding disables auto-pan during a drag', async () => {
    await setup(true);
    drag();
    frame(100);
    fixture.componentRef.setInput('autoPan', false);
    render();
    frame(100);
    frame(100);
    expect(flow().viewport().x).toBe(60);
  });

  it('starts when a later binding enables auto-pan during a drag', async () => {
    await setup(false);
    drag(50);
    frame(100);
    fixture.componentRef.setInput('autoPan', { speed: 120, margin: 100 });
    render();
    frame(0);
    pointTo(50, 150);
    frame(100);
    expect(flow().viewport().x).toBeCloseTo(3, 8);
  });

  it('pans by viewport pixels at a zoom other than 1', async () => {
    await setup(true);
    flow().setViewport({ x: 0, y: 0, zoom: 2 });
    frame(0);
    drag();
    frame(100);
    expect(flow().viewport()).toEqual({ x: 60, y: 0, zoom: 2 });
  });

  it('stops panning once the node drag ends', async () => {
    await setup(true);
    drag();
    frame(100);
    release();
    frame(100);
    expect(flow().viewport().x).toBe(60);
  });

  it('travels the same distance at 60 Hz and 120 Hz', async () => {
    await setup(true);
    drag();
    for (let i = 0; i < 4; i++) frame(1000 / 60);
    const at60Hz = flow().viewport().x;
    for (let i = 0; i < 8; i++) frame(1000 / 120);
    expect(at60Hz).toBeCloseTo(40, 8);
    expect(flow().viewport().x - at60Hz).toBeCloseTo(40, 8);
  });
});

describe('auto-pan with real browser frames', () => {
  it('moves stationary neighbouring nodes in one direction while a node is held at the left edge', async () => {
    TestBed.configureTestingModule({ imports: [AutoPanHostComponent] });
    const fixture = TestBed.createComponent(AutoPanHostComponent);
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'dragged', point: { x: 100, y: 100 } }),
      createNode({ id: 'neighbour', point: { x: 250, y: 100 } }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const nodes = fixture.nativeElement.querySelectorAll('[data-v-node]') as NodeListOf<HTMLElement>;
    // The nodes are revealed once measured.
    await expect.poll(() => getComputedStyle(nodes[1]).visibility).toBe('visible');
    const rect = (fixture.nativeElement.querySelector('[data-v-root]') as HTMLElement).getBoundingClientRect();
    const mouse = (target: EventTarget, type: MouseType, x: number) =>
      dispatchMouse(target, type, { x: rect.left + x, y: rect.top + 150 });
    const positions: number[] = [];
    try {
      mouse(nodes[0], 'mousedown', 110);
      mouse(window, 'mousemove', 4);
      fixture.detectChanges();
      TestBed.flushEffects();
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + 4, clientY: rect.top + 150 }));
      for (let i = 0; i < 90; i++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        positions.push(nodes[1].getBoundingClientRect().x);
      }
    } finally {
      mouse(window, 'mouseup', 4);
      fixture.destroy();
    }
    const reversals = positions.slice(1).filter((x, i) => x < positions[i] - 0.1);
    expect(positions.at(-1)! - positions[0]).toBeGreaterThan(100);
    expect(reversals, `Neighbour reversed ${reversals.length} times: ${positions.join(', ')}`).toEqual([]);
  });
});
