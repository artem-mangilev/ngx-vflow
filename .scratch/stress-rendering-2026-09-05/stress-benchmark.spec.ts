// Copied next to vflow sources by run.sh. Diagnostic benchmark, not a CI timing assertion.
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { FlowEntitiesService } from './services/flow-entities.service';
import { StressTestNodeComponent } from '../../../../ngx-vflow-demo/src/app/categories/performance/pages/stress-test/demo/stress-test-node.component';

const frame = () => new Promise<number>(requestAnimationFrame);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const stats = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    median: +sorted[Math.floor(sorted.length / 2)].toFixed(2),
    p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
    over25ms: values.filter((v) => v > 25).length,
  };
};

describe('Stress rendering measurement', () => {
  it('counts stationary node binding reads during pan and a single node move', async () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [800, 600]);
    fixture.componentRef.setInput(
      'nodes',
      Array.from({ length: 1024 }, (_, i) =>
        createNode({ id: String(i), type: 'default', point: { x: (i % 32) * 150, y: Math.floor(i / 32) * 100 } }),
      ),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    await delay(100);
    await fixture.whenStable();
    const models = fixture.debugElement.injector.get(FlowEntitiesService).nodes();
    const reads = models.map((model) => spyOn(model, 'pointTransformCss').and.callThrough());
    fixture.componentInstance.panTo({ x: -10, y: -10 });
    await fixture.whenStable();
    const panVisited = reads.filter((spy) => spy.calls.any()).length;
    reads.forEach((spy) => spy.calls.reset());
    models[0].point.set({ x: 10, y: 10 });
    await fixture.whenStable();
    const moveVisited = reads.filter((spy) => spy.calls.any()).length;
    console.log('STRESS-FANOUT ' + JSON.stringify({ nodes: models.length, panVisited, moveVisited }));
    fixture.destroy();
  });
  for (const mode of ['full', 'virtual', 'contain', 'will-change', 'custom-full', 'custom-virtual']) {
    it(
      mode,
      async () => {
        TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
        const nodes = Array.from({ length: 1024 }, (_, i) =>
          createNode<{ label: string }>({
            id: String(i),
            ...(mode.startsWith('custom')
              ? { type: StressTestNodeComponent, data: { label: `Node ${i}` }, ariaLabel: `Node ${i}` }
              : { type: 'default', text: `Node ${i}` }),
            point: { x: (i % 32) * 150, y: Math.floor(i / 32) * 100 },
          }),
        );
        const edges = nodes.slice(1).map((n, i) => createEdge({ id: String(i), source: String(i), target: n.id }));
        const fixture = TestBed.createComponent(VflowComponent);
        fixture.componentRef.setInput('view', [800, 600]);
        fixture.componentRef.setInput('minZoom', 0.1);
        fixture.componentRef.setInput('nodes', nodes);
        fixture.componentRef.setInput('edges', edges);
        fixture.componentRef.setInput('optimization', { virtualization: mode.endsWith('virtual') });
        const start = performance.now();
        fixture.detectChanges();
        await fixture.whenStable();
        await delay(100);
        await fixture.whenStable();
        const ready = performance.now() - start - 100;
        const host = fixture.nativeElement as HTMLElement;
        const viewport = host.querySelector('.vflow-viewport') as HTMLElement;
        if (mode === 'contain') (host.querySelector('.vflow-root') as HTMLElement).style.contain = 'layout paint';
        if (mode === 'will-change') viewport.style.willChange = 'transform';
        const initialDom = host.querySelectorAll('*').length;
        const event = (target: EventTarget, type: string, x: number, y: number) =>
          target.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              view: window,
              clientX: x,
              clientY: y,
              buttons: type === 'mouseup' ? 0 : 1,
              button: 0,
            }),
          );
        const measure = async (target: Element, x: number, y: number) => {
          const times: number[] = [];
          const work: number[] = [];
          event(target, 'mousedown', x, y);
          let previous = await frame();
          for (let i = 0; i < 60; i++) {
            const started = performance.now();
            event(window, 'mousemove', x - i * 3, y - i);
            fixture.detectChanges();
            work.push(performance.now() - started);
            const now = await frame();
            times.push(now - previous);
            previous = now;
          }
          event(window, 'mouseup', x - 177, y - 59);
          await fixture.whenStable();
          return { frame: stats(times), eventAndDetect: stats(work) };
        };
        const pane = host.querySelector('.vflow-pane')!;
        const rect = pane.getBoundingClientRect();
        const zoomFrames: number[] = [];
        const zoomWork: number[] = [];
        let previousZoomFrame = await frame();
        for (let i = 0; i < 60; i++) {
          const started = performance.now();
          pane.dispatchEvent(
            new WheelEvent('wheel', {
              bubbles: true,
              cancelable: true,
              view: window,
              clientX: rect.left + 400,
              clientY: rect.top + 300,
              deltaY: 2,
              ctrlKey: true,
            }),
          );
          fixture.detectChanges();
          zoomWork.push(performance.now() - started);
          const now = await frame();
          zoomFrames.push(now - previousZoomFrame);
          previousZoomFrame = now;
        }
        const zoom = {
          frame: stats(zoomFrames),
          eventAndDetect: stats(zoomWork),
          finalScale: fixture.componentInstance.viewport().zoom,
        };
        expect(zoom.finalScale).toBeLessThan(0.5);
        await delay(200);
        fixture.componentInstance.viewportTo({ x: 0, y: 0, zoom: 1 });
        fixture.detectChanges();
        await fixture.whenStable();
        await delay(60);
        const pan = await measure(pane, rect.left + 775, rect.top + 575);
        expect(fixture.componentInstance.viewport().x).toBeLessThan(0);
        fixture.componentInstance.panTo({ x: 0, y: 0 });
        fixture.detectChanges();
        await fixture.whenStable();
        await delay(60);
        const node = host.querySelector('.vflow-node')!;
        const nodeRect = node.getBoundingClientRect();
        const drag = await measure(node, nodeRect.left + 50, nodeRect.top + 25);
        expect(nodes[0].point().x).toBeLessThan(0);
        console.log('STRESS-BENCH ' + JSON.stringify({ mode, ready: +ready.toFixed(1), initialDom, zoom, pan, drag }));
        fixture.destroy();
      },
      15000,
    );
  }
});
