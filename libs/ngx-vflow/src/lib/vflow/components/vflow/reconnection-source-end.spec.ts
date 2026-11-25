import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { ReconnectEvent } from '../../interfaces/connection-events.interface';
import { dispatchMouse } from '../../gestures/pointer-events.testing';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    style="width: 700px; height: 300px"
    [nodes]="nodes"
    [edges]="edges"
    (reconnect)="reconnects.push($event)">
    <div *vNode style="width: 100px; height: 40px">
      <span vHandle handleType="target" position="left" handleId="in"></span>
      <span vHandle handleType="source" position="right" handleId="out"></span>
    </div>
    <ng-template vEdge let-ctx>
      <svg:path fill="none" [attr.d]="ctx.path()" />
      <span *vEdgeLabel class="label">Label</span>
    </ng-template>
  </vflow>`,
})
class ReconnectionHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly nodes = createNodes(['a', 'b', 'c'].map((id, i) => ({ id, point: { x: i * 250, y: i === 2 ? 150 : 0 } })));
  readonly edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', targetHandle: 'in', reconnectable: 'source' },
  ]);
  readonly reconnects: ReconnectEvent[] = [];
}

describe('reconnection from the source end of an edge', () => {
  let fixture: ComponentFixture<ReconnectionHostComponent>;
  let root: HTMLElement;

  async function stable() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(ReconnectionHostComponent);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise<void>((resolve) => fixture.componentInstance.flow().initialized.subscribe(() => resolve()));
    await stable();
  });

  const reconnectHandle = () => root.querySelector('[data-v-reconnect-handle]')!;
  const edge = () => root.querySelector('[data-v-edge="a-b"]')!;
  const label = () => root.querySelector('.label')!.closest('[edgeLabelHost]')!;

  async function press() {
    dispatchMouse(reconnectHandle(), 'mousedown', { x: 0, y: 0 });
    await stable();
  }

  async function releaseOn(node: string, handleId: string) {
    const handle = root.querySelector(`[data-v-node="${node}"] [vHandle][handleId="${handleId}"]`)!;
    handle.dispatchEvent(new PointerEvent('pointerenter'));
    // The release of the pointer that pressed: the gesture follows it by pointer id.
    handle.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await stable();
  }

  it('offers the reconnect handle at the source handle', () => {
    const { x, y } = fixture.componentInstance.flow().getNodeRect('a')!;

    // The source handle sits on the right side of node `a`, at its vertical middle.
    expect(Number(reconnectHandle().getAttribute('cx'))).toBeGreaterThanOrEqual(x + 100);
    expect(Number(reconnectHandle().getAttribute('cy'))).toBe(y + 20);
  });

  it('emits reconnect with a new source and the target that stays', async () => {
    await press();

    await releaseOn('c', 'out');

    expect(fixture.componentInstance.reconnects).toEqual([
      {
        connection: { source: 'c', target: 'b', sourceHandle: 'out', targetHandle: 'in' },
        edge: fixture.componentInstance.edges[0],
      },
    ]);
  });

  it.each([
    ['the edge', edge],
    ['its label', label],
  ])('marks %s pending while it is reconnected', async (_, element) => {
    await press();

    expect(element().hasAttribute('data-v-pending')).toBe(true);
  });

  it.each([
    ['the edge', edge],
    ['its label', label],
  ])('shows %s again once the reconnection ends', async (_, element) => {
    await press();

    await releaseOn('c', 'out');

    expect(element().hasAttribute('data-v-pending')).toBe(false);
  });
});
