import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from './components/vflow/vflow.component';
import { Node, createNode } from './interfaces/node.interface';
import { createEdge } from './interfaces/edge.interface';
import { VflowHandleDirective } from './public-directives/handle.directive';
import { VflowEdgeLabelTemplateDirective } from './public-directives/template.directive';
import { dispatchMouse } from './gestures/pointer-events.testing';

/** An edge presentation that declares a center label, so the flow renders it in the label layer. */
@Component({
  template: `<span *vEdgeLabel>Connection</span>`,
  imports: [VflowEdgeLabelTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelEdgeComponent {}

@Component({
  template: `<div style="width:100px;height:48px;display:flex;align-items:center;justify-content:center">
    Custom node
    <span vHandle handleType="target" position="left"></span>
    <span vHandle handleType="source" position="right"></span>
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SmallCustomNodeComponent {}

/** A node whose second handle appears later, like a row added to a table. */
const extraHandle = signal(false);

@Component({
  template: `<div style="width:100px;height:48px">
    <span vHandle handleType="target" position="left"></span>
    @if (extra()) {
      <span vHandle handleType="source" position="right" handleId="extra"></span>
    }
  </div>`,
  imports: [VflowHandleDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GrowingNodeComponent {
  readonly extra = extraHandle;
}

/** The vertical center of the 48px tall nodes, where a handle on the right side is placed. */
const CENTER = '24px';

const frame = () => new Promise(requestAnimationFrame);

/** Records one sample per animation frame: what the browser paints in each of them. */
async function sampleFrames<T>(count: number, sample: () => T): Promise<T[]> {
  const samples: T[] = [];
  for (let i = 0; i < count; i++) {
    samples.push(sample());
    await frame();
  }
  return samples;
}

function createFlow(nodes: Node[]): ComponentFixture<VflowComponent> {
  const fixture = TestBed.createComponent(VflowComponent);
  Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
  fixture.componentRef.setInput('nodes', nodes);
  return fixture;
}

async function initialized(fixture: ComponentFixture<VflowComponent>) {
  const done = new Promise<void>((resolve) => fixture.componentInstance.initialized.subscribe(() => resolve()));
  fixture.detectChanges();
  await done;
  await fixture.whenStable();
}

const rightHandle = (node: Element) =>
  node.querySelector<HTMLElement>('[data-v-handle][data-v-handle-position="right"]');

describe('Initial handle placement', () => {
  beforeEach(() => extraHandle.set(false));

  describe('a handle added to a shown node', () => {
    async function addHandle() {
      const fixture = createFlow([createNode({ id: 'a', component: GrowingNodeComponent, point: { x: 0, y: 0 } })]);
      await initialized(fixture);
      const node = fixture.nativeElement.querySelector('[data-v-node]') as HTMLElement;

      extraHandle.set(true);
      fixture.detectChanges();

      return sampleFrames(6, () => {
        const handle = rightHandle(node);
        return {
          node: getComputedStyle(node).visibility,
          handle: handle ? getComputedStyle(handle).visibility : 'absent',
          top: handle?.style.top ?? '',
        };
      });
    }

    it('keeps the node visible', async () => {
      const frames = await addHandle();

      expect(frames.map((frame) => frame.node)).toEqual(Array(6).fill('visible'));
    });

    it('shows the new handle only once it is placed', async () => {
      const frames = await addHandle();

      expect(frames.filter((frame) => frame.handle === 'visible' && frame.top !== CENTER)).toEqual([]);
      expect(frames.at(-1)).toEqual({ node: 'visible', handle: 'visible', top: CENTER });
    });
  });

  it('keeps an edge visible when another handle is added to one of its nodes', async () => {
    const fixture = createFlow([
      createNode({ id: 'a', component: SmallCustomNodeComponent, point: { x: 0, y: 0 } }),
      createNode({ id: 'b', component: GrowingNodeComponent, point: { x: 150, y: 0 } }),
    ]);
    fixture.componentRef.setInput('edges', [
      createEdge({ id: 'ab', source: 'a', target: 'b', component: LabelEdgeComponent }),
    ]);
    await initialized(fixture);
    const edge = fixture.nativeElement.querySelector('svg[edge]') as SVGElement;

    extraHandle.set(true);
    fixture.detectChanges();
    const frames = await sampleFrames(6, () => getComputedStyle(edge).visibility);

    expect(frames).toEqual(Array(6).fill('visible'));
  });

  function grid(count: number) {
    return createFlow(
      Array.from({ length: count }, (_, i) =>
        createNode({
          id: String(i),
          component: SmallCustomNodeComponent,
          point: { x: (i % 32) * 150, y: Math.floor(i / 32) * 100 },
        }),
      ),
    );
  }

  /** The frames in which the first node is visible, with the place of its right handle. */
  async function visibleFrames(fixture: ComponentFixture<VflowComponent>) {
    const frames = await sampleFrames(8, () => {
      const node = fixture.nativeElement.querySelector('[data-v-node]') as HTMLElement;
      return { visibility: getComputedStyle(node).visibility, top: rightHandle(node)?.style.top ?? '' };
    });
    return frames.filter((frame) => frame.visibility === 'visible');
  }

  it.each([1, 1024])('never shows an unplaced custom handle on the first render of %i nodes', async (count) => {
    const fixture = grid(count);
    fixture.detectChanges();

    const visible = await visibleFrames(fixture);

    expect(visible.length).toBeGreaterThan(0);
    expect(visible.filter((frame) => frame.top !== CENTER)).toEqual([]);
  });

  it.each([1, 1024])(
    'never shows an unplaced custom handle when %i nodes come back from virtualization',
    async (count) => {
      const fixture = grid(count);
      await initialized(fixture);
      fixture.componentRef.setInput('virtualization', true);
      fixture.componentInstance.setViewport({ x: 10000, y: 10000, zoom: 1 });
      fixture.detectChanges();
      await fixture.whenStable();
      const hosts = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[data-v-node]'));
      expect(hosts.map((host) => getComputedStyle(host).display)).toEqual(Array(count).fill('none'));

      fixture.componentInstance.setViewport({ x: 0, y: 0, zoom: 1 });
      const visible = await visibleFrames(fixture);

      expect(visible.length).toBeGreaterThan(0);
      expect(visible.filter((frame) => frame.top !== CENTER)).toEqual([]);
    },
  );

  function connectedPair() {
    const fixture = createFlow(
      ['a', 'b'].map((id, i) => createNode({ id, component: SmallCustomNodeComponent, point: { x: i * 150, y: 0 } })),
    );
    fixture.componentRef.setInput('edges', [
      createEdge({ id: 'ab', source: 'a', target: 'b', component: LabelEdgeComponent }),
    ]);
    return fixture;
  }

  it('does not show an edge or its label before its custom endpoints are measured', async () => {
    const fixture = connectedPair();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const frames = await sampleFrames(8, () => ({
      endpointHidden: Array.from(root.querySelectorAll('[data-v-node]')).some(
        (node) => getComputedStyle(node).visibility === 'hidden',
      ),
      edgeShown: Array.from(root.querySelectorAll('svg[edge], [edgeLabelHost]')).some(
        (edge) => getComputedStyle(edge).visibility === 'visible',
      ),
    }));

    expect(frames.filter((frame) => frame.endpointHidden && frame.edgeShown)).toEqual([]);
    expect(frames.at(-1)).toEqual({ endpointHidden: false, edgeShown: true });
  });

  it('draws the edge and its label once the endpoints are measured', async () => {
    const fixture = connectedPair();
    await initialized(fixture);
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('svg[edge] path[data-v-interactive-edge]')!.getAttribute('d')).toMatch(/^M/);
    expect(root.querySelector('[edgeLabelHost]')?.textContent).toContain('Connection');
  });

  it('keeps an edge visible when virtualization hides one of its measured endpoints', async () => {
    const fixture = connectedPair();
    await initialized(fixture);

    fixture.componentRef.setInput('virtualization', true);
    fixture.componentInstance.setViewport({ x: -120, y: 0, zoom: 1 });
    fixture.detectChanges();
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(getComputedStyle(root.querySelector('[data-v-node]')!).display).toBe('none');
    expect(getComputedStyle(root.querySelector('svg[edge]')!).visibility).toBe('visible');
  });

  it('keeps a custom handle centered when the zoom changes while its new place is being measured', async () => {
    const fixture = createFlow([createNode({ id: 'a', component: SmallCustomNodeComponent, point: { x: 0, y: 0 } })]);
    await initialized(fixture);
    const handle = rightHandle(fixture.nativeElement)!;

    handle.parentElement!.style.height = '96px';
    // The wheel zoom is eased over the next frames, the same frames that measure the taller node.
    fixture.nativeElement
      .querySelector('.v-pane')
      .dispatchEvent(
        new WheelEvent('wheel', { deltaY: -200, clientX: 100, clientY: 100, bubbles: true, cancelable: true }),
      );

    await expect.poll(() => fixture.componentInstance.viewport().zoom).toBeGreaterThan(1);
    await expect.poll(() => parseFloat(handle.style.top)).toBeCloseTo(48, 1);
  });

  it('does not rewrite the attributes of a custom handle while its node is dragged', async () => {
    const fixture = createFlow([createNode({ id: 'a', component: SmallCustomNodeComponent, point: { x: 0, y: 0 } })]);
    fixture.componentRef.setInput('nodeDragThreshold', 0);
    fixture.componentRef.setInput('autoPan', false);
    await initialized(fixture);
    const node = fixture.nativeElement.querySelector('[data-v-node]') as HTMLElement;
    const handle = rightHandle(node)!;
    const writes: MutationRecord[] = [];
    const observer = new MutationObserver((records) => writes.push(...records));
    observer.observe(handle, { attributes: true });
    const card = handle.parentElement!;
    const { left, top } = card.getBoundingClientRect();

    dispatchMouse(card, 'mousedown', { x: left + 20, y: top + 20 });
    for (const dx of [10, 20, 30]) {
      dispatchMouse(window, 'mousemove', { x: left + 20 + dx, y: top + 20 });
      fixture.detectChanges();
      await frame();
    }
    dispatchMouse(window, 'mouseup', { x: left + 50, y: top + 20 });
    fixture.detectChanges();
    await fixture.whenStable();
    writes.push(...observer.takeRecords());
    observer.disconnect();

    expect(fixture.componentInstance.nodes()[0].point()).not.toEqual({ x: 0, y: 0 });
    expect(writes.map((record) => record.attributeName)).toEqual([]);
  });
});
