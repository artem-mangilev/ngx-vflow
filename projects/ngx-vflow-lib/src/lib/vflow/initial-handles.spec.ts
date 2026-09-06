import { ChangeDetectionStrategy, Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { createNode } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { FlowStatusService } from './services/flow-status.service';
import { FlowEntitiesService } from './services/flow-entities.service';
import { CustomNodeComponent } from './public-components/custom-node/custom-node.component';
import { RequestAnimationFrameBatchingService } from './services/request-animation-frame-batching.service';
import { HandleComponent } from './public-components/handle/handle.component';

@Component({
  template: `<div style="width:100px;height:48px;display:flex;align-items:center;justify-content:center">
    Custom node
    <handle type="target" position="left" />
    <handle type="source" position="right" />
  </div>`,
  imports: [HandleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SmallCustomNodeComponent extends CustomNodeComponent {}

describe('Initial handle placement', () => {
  for (const count of [1, 1024]) {
    it(`never shows unpositioned custom handles on initial mount or restore (${count} nodes)`, async () => {
      TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
      const fixture = TestBed.createComponent(VflowComponent);
      fixture.componentRef.setInput('view', [400, 300]);
      fixture.componentRef.setInput(
        'nodes',
        Array.from({ length: count }, (_, i) =>
          createNode({
            id: String(i),
            type: SmallCustomNodeComponent,
            point: { x: (i % 32) * 150, y: Math.floor(i / 32) * 100 },
          }),
        ),
      );
      fixture.detectChanges();
      const capture = async (phase: string) => {
        const frames: { visibility: string; top: string }[] = [];
        for (let i = 0; i < 8; i++) {
          await new Promise(requestAnimationFrame);
          const node = fixture.nativeElement.querySelector('.vflow-node') as HTMLElement;
          const handle = node?.querySelector('.handle--right') as HTMLElement | null;
          if (handle) frames.push({ visibility: getComputedStyle(node).visibility, top: handle.style.top });
        }
        const visible = frames.filter((frame) => frame.visibility === 'visible');
        expect(visible.length).toBeGreaterThan(0);
        expect(visible.filter((frame) => frame.top !== '24px'))
          .withContext(phase + ': ' + JSON.stringify(frames))
          .toEqual([]);
      };
      await capture('initial mount');
      fixture.componentRef.setInput('optimization', { virtualization: true });
      fixture.componentInstance.panTo({ x: 10000, y: 10000 });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelectorAll('.vflow-node').length).toBe(count);
      expect(
        [...fixture.nativeElement.querySelectorAll('.vflow-node')].every(
          (node) => getComputedStyle(node).display === 'none',
        ),
      ).toBeTrue();
      fixture.componentInstance.panTo({ x: 0, y: 0 });
      await capture('CSS restore');
    }, 10000);
  }

  it('does not show an edge before its custom endpoints are measured', async () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput(
      'nodes',
      ['a', 'b'].map((id, i) => createNode({ id, type: SmallCustomNodeComponent, point: { x: i * 150, y: 0 } })),
    );
    fixture.componentRef.setInput('edges', [
      createEdge({
        id: 'ab',
        source: 'a',
        target: 'b',
        edgeLabels: { center: { type: 'default', text: 'Connection' } },
      }),
    ]);
    fixture.detectChanges();
    const sample = () => {
      const nodes = Array.from(fixture.nativeElement.querySelectorAll('.vflow-node')) as HTMLElement[];
      const paths = Array.from(fixture.nativeElement.querySelectorAll('svg[edge] .edge, [edgeLabel]')) as Element[];
      if (nodes.some((node) => getComputedStyle(node).visibility === 'hidden')) {
        expect(paths.filter((path) => getComputedStyle(path).visibility === 'visible'))
          .withContext('visible edge while an endpoint is hidden')
          .toEqual([]);
      }
    };
    sample();
    for (let i = 0; i < 8; i++) {
      await new Promise(requestAnimationFrame);
      sample();
    }
    expect(fixture.nativeElement.querySelector('svg[edge] .edge')?.getAttribute('d')).toBeTruthy();
    // An offscreen endpoint retains measured geometry for an edge crossing the viewport.
    fixture.componentRef.setInput('optimization', { virtualization: true });
    fixture.componentInstance.panTo({ x: -120, y: 0 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.vflow-node').length).toBe(2);
    expect(getComputedStyle(fixture.nativeElement.querySelector('.vflow-node')).display).toBe('none');
    const edge = fixture.nativeElement.querySelector('svg[edge] .edge');
    expect(edge).not.toBeNull();
    expect(getComputedStyle(edge).visibility).toBe('visible');
  });

  it('keeps custom handles centered when zoom changes before a queued measurement', async () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'a', type: SmallCustomNodeComponent, point: { x: 0, y: 0 } }),
    ]);
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    const batching = fixture.debugElement.injector.get(RequestAnimationFrameBatchingService);
    const batch = batching.batchAnimationFrame.bind(batching);
    let zoomed = false;
    spyOn(batching, 'batchAnimationFrame').and.callFake((callback) =>
      batch(() => {
        if (!zoomed) {
          zoomed = true;
          fixture.nativeElement.querySelector('.vflow-pane').dispatchEvent(
            new WheelEvent('wheel', {
              deltaY: -200,
              clientX: 100,
              clientY: 100,
              bubbles: true,
              cancelable: true,
            }),
          );
        }
        callback();
      }),
    );
    const anchor = fixture.nativeElement.querySelector('handle').parentElement as HTMLElement;
    anchor.style.height = '96px';
    for (let i = 0; i < 8; i++) await new Promise(requestAnimationFrame);
    expect(zoomed).toBeTrue();
    const handle = fixture.nativeElement.querySelector('.handle--right') as HTMLElement;
    expect(parseFloat(handle.style.top)).toBeCloseTo(48, 1);
  });

  it('positions handles before the first frame without waiting for DOM measurement', () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [createNode({ id: 'a', type: 'default', point: { x: 0, y: 0 } })]);
    fixture.detectChanges();
    const source = fixture.nativeElement.querySelector('.handle--right') as HTMLElement;
    const target = fixture.nativeElement.querySelector('.handle--left') as HTMLElement;
    expect(source.style.top).toBe('25px');
    expect(source.style.right).toBe('0px');
    expect(target.style.top).toBe('25px');
    expect(target.style.left).toBe('0px');
  });

  it('does not rewrite unchanged custom handle accessibility during node movement', async () => {
    TestBed.configureTestingModule({ providers: [provideExperimentalZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('view', [400, 300]);
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'a', type: SmallCustomNodeComponent, point: { x: 0, y: 0 } }),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 40));
    const handle = fixture.nativeElement.querySelector('.handle--right') as HTMLElement;
    const attributes = spyOn(handle, 'setAttribute').and.callThrough();
    const model = fixture.debugElement.injector.get(FlowEntitiesService).nodes()[0];
    const status = fixture.debugElement.injector.get(FlowStatusService);
    status.setNodeDragStartStatus(model);
    fixture.detectChanges();
    status.setNodeDragStatus(model);
    fixture.detectChanges();
    expect(attributes.calls.allArgs().filter(([name]) => name === 'aria-label')).toEqual([]);
  });
});
