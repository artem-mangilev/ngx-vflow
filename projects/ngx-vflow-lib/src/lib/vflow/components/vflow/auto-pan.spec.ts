import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { animationFrameScheduler } from 'rxjs';
import { AutoPanSettings } from '../../interfaces/auto-pan-settings.interface';
import { createEdge, Edge } from '../../interfaces/edge.interface';
import { createNode, Node } from '../../interfaces/node.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Vflow],
  template: `<vflow
    [nodes]="nodes"
    [edges]="edges"
    [view]="view"
    [autoPan]="autoPan"
    (connect)="(undefined)"
    (reconnect)="(undefined)" />`,
})
class AutoPanHostComponent {
  @Input() autoPan: boolean | AutoPanSettings = true;
  @Input() nodes: Node[] = [];
  @Input() edges: Edge[] = [];
  @Input() view: [number, number] = [400, 300];
  @ViewChild(VflowComponent) flow!: VflowComponent;
}

describe('public auto-pan settings', () => {
  let fixture: ComponentFixture<AutoPanHostComponent>;
  let frames: Map<number, FrameRequestCallback>;
  let now: number;
  let nextId: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AutoPanHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    frames = new Map();
    now = 0;
    nextId = 0;
    spyOn(animationFrameScheduler, 'now').and.callFake(() => now);
    spyOn(window, 'requestAnimationFrame').and.callFake((callback) => {
      frames.set(++nextId, callback);
      return nextId;
    });
    spyOn(window, 'cancelAnimationFrame').and.callFake((id) => frames.delete(id));
  });

  afterEach(() => {
    mouse(window, 'mouseup', 0, 0);
    fixture?.destroy();
  });

  async function setup(autoPan: boolean | AutoPanSettings) {
    fixture = TestBed.createComponent(AutoPanHostComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'node', point: { x: 100, y: 100 }, type: 'default', text: 'Node' }),
      createNode({ id: 'target', point: { x: 250, y: 100 }, type: 'default', text: 'Target' }),
    ]);
    fixture.componentRef.setInput('edges', [
      createEdge({ id: 'edge', source: 'node', target: 'target', reconnectable: true }),
    ]);
    fixture.componentRef.setInput('autoPan', autoPan);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();
    TestBed.flushEffects();
    await frame(0);
  }

  function mouse(target: EventTarget, type: string, x: number, y: number) {
    target.dispatchEvent(
      new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }),
    );
  }

  function drag(x = 0, y = 150) {
    const root = fixture.nativeElement.querySelector('.vflow-root') as HTMLElement;
    const rect = root.getBoundingClientRect();
    mouse(fixture.nativeElement.querySelector('[node]'), 'mousedown', rect.left + 110, rect.top + 110);
    mouse(window, 'mousemove', rect.left + x, rect.top + y);
    fixture.detectChanges();
    TestBed.flushEffects();
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + x, clientY: rect.top + y }));
  }

  async function frame(ms = 1000 / 60) {
    now += ms;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(now));
    fixture.detectChanges();
    TestBed.flushEffects();
    await new Promise((resolve) => setTimeout(resolve, 30));
    fixture.detectChanges();
    TestBed.flushEffects();
  }

  it('pans while dragging with boolean true', async () => {
    await setup(true);
    drag();
    await frame();
    await frame();
    expect(fixture.componentInstance.flow.viewport().x).toBeGreaterThan(0);
  });

  it('can disable node dragging auto-pan independently', async () => {
    await setup({ nodeDrag: false });
    drag();
    await frame();
    expect(fixture.componentInstance.flow.viewport().x).toBe(0);
  });
  it('uses elapsed time and configured speed and margin in viewport pixels', async () => {
    await setup({ speed: 120, margin: 100 });
    drag(50);
    await frame(100);
    expect(fixture.componentInstance.flow.viewport().x).toBeCloseTo(3, 8);
    await frame(50);
    await frame(50);
    expect(fixture.componentInstance.flow.viewport().x).toBeCloseTo(6, 8);
  });

  for (const field of ['speed', 'margin']) {
    for (const value of [-1, NaN, Infinity, -Infinity]) {
      it(`falls back and warns for invalid ${field}: ${value}`, async () => {
        const warn = spyOn(console, 'warn');
        await setup({ [field]: value });
        drag(24);
        await frame(100);
        expect(fixture.componentInstance.flow.viewport().x).toBeCloseTo(15, 8);
        expect(warn).toHaveBeenCalled();
      });
    }
  }

  for (const options of [false, { speed: 0 }, { margin: 0 }, { nodeDrag: false, connectionDrag: false }]) {
    it(`disables auto-pan for ${JSON.stringify(options)}`, async () => {
      await setup(options);
      drag();
      await frame(100);
      expect(fixture.componentInstance.flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  }

  for (const [x, y, expectedX, expectedY] of [
    [0, 150, 60, 0],
    [400, 150, -60, 0],
    [200, 0, 0, 60],
    [200, 300, 0, -60],
    [0, 0, 60, 60],
    [48, 150, 0, 0],
    [200, 150, 0, 0],
  ]) {
    it(`pans at viewport point (${x}, ${y}) with omitted options`, async () => {
      await setup({});
      drag(x, y);
      await frame(100);
      expect(fixture.componentInstance.flow.viewport()).toEqual({ x: expectedX, y: expectedY, zoom: 1 });
    });
  }

  for (const reconnect of [false, true]) {
    for (const enabled of [false, true]) {
      it(`${enabled ? 'enables' : 'disables'} auto-pan for ${reconnect ? 'reconnection' : 'connection creation'}`, async () => {
        await setup({ nodeDrag: false, connectionDrag: enabled });
        const target = fixture.nativeElement.querySelector(
          reconnect ? '.reconnect-handle' : 'handle[type="source"] .handle',
        );
        expect(target).not.toBeNull();
        const rect = fixture.nativeElement.querySelector('.vflow-root').getBoundingClientRect();
        mouse(target, 'mousedown', rect.left + 200, rect.top + 150);
        fixture.detectChanges();
        TestBed.flushEffects();
        document.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left, clientY: rect.top + 150 }));
        await frame(100);
        expect(fixture.componentInstance.flow.viewport().x).toBe(enabled ? 60 : 0);
        mouse(document, 'mouseup', rect.left, rect.top + 150);
        fixture.detectChanges();
        TestBed.flushEffects();
        await frame(100);
        expect(fixture.componentInstance.flow.viewport().x).toBe(enabled ? 60 : 0);
      });
    }
  }

  it('captures settings at creation, including values of a mutable options object', async () => {
    const options = { speed: 120, margin: 100 };
    await setup(options);
    options.speed = 600;
    fixture.componentRef.setInput('autoPan', false);
    fixture.detectChanges();
    drag(50);
    await frame(100);
    expect(fixture.componentInstance.flow.viewport().x).toBeCloseTo(3, 8);
  });

  it('keeps viewport-pixel speed at non-unit zoom and stops after drag ends', async () => {
    await setup({ connectionDrag: false });
    fixture.componentInstance.flow.viewportTo({ x: 0, y: 0, zoom: 2 });
    await frame(0);
    drag();
    await frame(100);
    expect(fixture.componentInstance.flow.viewport()).toEqual({ x: 60, y: 0, zoom: 2 });
    mouse(window, 'mouseup', 0, 150);
    fixture.detectChanges();
    TestBed.flushEffects();
    await frame(100);
    expect(fixture.componentInstance.flow.viewport()).toEqual({ x: 60, y: 0, zoom: 2 });
  });
  it('travels the same distance at 60 Hz and 120 Hz', async () => {
    await setup(true);
    drag();
    for (let i = 0; i < 4; i++) await frame(1000 / 60);
    expect(fixture.componentInstance.flow.viewport().x).toBeCloseTo(40, 8);
    for (let i = 0; i < 8; i++) await frame(1000 / 120);
    expect(fixture.componentInstance.flow.viewport().x).toBeCloseTo(80, 8);
  });
});

describe('auto-pan with real browser frames', () => {
  it('moves stationary neighbouring nodes in one direction while a node is held at the left edge', async () => {
    TestBed.configureTestingModule({
      imports: [AutoPanHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AutoPanHostComponent);
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'dragged', type: 'default', point: { x: 100, y: 100 }, text: 'Dragged' }),
      createNode({ id: 'neighbour', type: 'default', point: { x: 250, y: 100 }, text: 'Neighbour' }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const root = fixture.nativeElement.querySelector('.vflow-root') as HTMLElement;
    const nodes = fixture.nativeElement.querySelectorAll('[node]') as NodeListOf<HTMLElement>;
    const rect = root.getBoundingClientRect();
    const mouse = (target: EventTarget, type: string, x: number) =>
      target.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: rect.left + x,
          clientY: rect.top + 150,
          view: window,
        }),
      );
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
    expect(reversals)
      .withContext(`Neighbour reversed ${reversals.length} times: ${positions.join(', ')}`)
      .toEqual([]);
  });
});
