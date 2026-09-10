import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { CustomNodeComponent } from './public-components/custom-node/custom-node.component';
import { HandleComponent } from './public-components/handle/handle.component';
import { createNode } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';

@Component({
  template: `<div style="position:relative;width:100px;height:100px">
    <div class="anchor" style="position:absolute;top:20px;width:100px;height:0">
      <handle type="source" position="right" />
      <handle type="target" position="left" />
    </div>
  </div>`,
  imports: [HandleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MovingPortNode extends CustomNodeComponent {}

async function frames() {
  for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
}

function mount() {
  const fixture = TestBed.createComponent(VflowComponent);
  fixture.componentRef.setInput('view', [500, 400]);
  fixture.componentRef.setInput('nodes', [
    createNode({ id: 'a', type: MovingPortNode, point: { x: 0, y: 0 } }),
    createNode({ id: 'b', type: MovingPortNode, point: { x: 200, y: 0 } }),
  ]);
  fixture.componentRef.setInput('edges', [createEdge({ id: 'ab', source: 'a', target: 'b' })]);
  fixture.detectChanges();
  return fixture;
}

function endpointError(root: HTMLElement) {
  const edge = root.querySelector<SVGPathElement>('svg[edge] .edge')!;
  const port = root.querySelector('.handle--right')!.getBoundingClientRect();
  const start = edge.getPointAtLength(0).matrixTransform(edge.getScreenCTM()!);
  return Math.max(Math.abs(start.x - port.right), Math.abs(start.y - port.y - port.height / 2));
}

describe('refreshNodeHandles', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }));

  it('refreshes position-only CSS changes after DOM writes without scrolling or resizing', async () => {
    const fixture = mount();
    await frames();
    const root = fixture.nativeElement as HTMLElement;
    const scroll = jasmine.createSpy('scroll');
    root.addEventListener('scroll', scroll, true);
    const anchor = root.querySelector<HTMLElement>('.anchor')!;
    const port = root.querySelector('.handle--right')!;
    expect(endpointError(root)).toBeLessThan(0.1);
    anchor.style.top = '70px';
    // No Angular state change or resize: this must be able to catch a stale cache.
    await frames();
    expect(endpointError(root)).toBeGreaterThan(40);
    fixture.componentInstance.refreshNodeHandles(['a', 'a', 'missing']);
    expect(endpointError(root)).toBeGreaterThan(40); // Request, not synchronous layout.
    await frames();
    expect(endpointError(root)).toBeLessThan(0.1);
    expect(root.querySelector('.handle--right')).toBe(port);
    expect(scroll).not.toHaveBeenCalled();
  });

  it('scopes requests to this editor and tolerates deletion before the queued frame', async () => {
    const first = mount();
    const second = mount(); // Same node IDs, independent renderer.
    await frames();
    for (const fixture of [first, second]) {
      (fixture.nativeElement.querySelector('.anchor') as HTMLElement).style.top = '70px';
    }
    first.componentInstance.refreshNodeHandles(['a']);
    second.componentInstance.refreshNodeHandles([]);
    await frames();
    expect(endpointError(first.nativeElement)).toBeLessThan(0.1);
    expect(endpointError(second.nativeElement)).toBeGreaterThan(40);

    second.componentInstance.refreshNodeHandles(['a']);
    second.componentRef.setInput('nodes', []);
    second.detectChanges();
    await frames();
    expect(second.nativeElement.querySelector('.vflow-node')).toBeNull();
    first.componentInstance.refreshNodeHandles(['a']);
    first.destroy();
    await frames(); // Destroyed renderer must not execute a stale DOM measurement.
  });

  it('retains culled geometry and refreshes the actual port after restoration', async () => {
    const fixture = mount();
    await frames();
    fixture.componentRef.setInput('optimization', { virtualization: true });
    fixture.componentInstance.panTo({ x: 10000, y: 10000 });
    fixture.detectChanges();
    await frames();
    const root = fixture.nativeElement as HTMLElement;
    expect(getComputedStyle(root.querySelector('.vflow-node')!).display).toBe('none');
    root.querySelector<HTMLElement>('.anchor')!.style.top = '70px';
    fixture.componentInstance.refreshNodeHandles(['a']);
    await frames();
    fixture.componentInstance.panTo({ x: 0, y: 0 });
    await frames();
    expect(getComputedStyle(root.querySelector('.vflow-node')!).display).not.toBe('none');
    expect(endpointError(root)).toBeLessThan(0.1);
  });
});
