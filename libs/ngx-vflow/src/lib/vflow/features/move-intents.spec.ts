import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../components/vflow/vflow.component';
import { createNode, Node } from '../interfaces/node.interface';
import { DraggableService } from '../services/draggable.service';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowStatusService } from '../services/flow-status.service';
import { provideVflow, vflowFeature, VflowFeature } from './feature';
import { GeometryIntent, GeometryTransform, IntentPhase } from './geometry-intent.interface';
import { provideGeometryTransform } from './provide-geometry-transform';

@Component({
  template: `<vflow [nodes]="nodes()" [edges]="[]" [view]="[400, 300]" />`,
  imports: [VflowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  public readonly nodes = signal<Node[]>([
    createNode({ id: 'parent', point: { x: 100, y: 100 }, width: 200, height: 150 }),
    createNode({ id: 'child', point: { x: 10, y: 10 }, parentId: 'parent', width: 50, height: 30 }),
    createNode({ id: 'free', point: { x: 20, y: 20 }, width: 60, height: 40 }),
  ]);
}

function mouse(target: EventTarget, type: 'mousedown' | 'mousemove' | 'mouseup', x: number, y: number) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, view: window, button: 0, clientX: x, clientY: y }));
}

describe('Move intents', () => {
  async function setup(features: VflowFeature[] = []) {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    TestBed.overrideComponent(HostComponent, { set: { providers: provideVflow(...features) } });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent));
    const pane = fixture.nativeElement.querySelector('.vflow-pane') as HTMLElement;
    const origin = pane.getBoundingClientRect();
    const node = (id: string) => fixture.componentInstance.nodes().find((n) => n.id === id)!;
    const element = (id: string) =>
      Array.from(fixture.nativeElement.querySelectorAll('.vflow-node') as NodeListOf<HTMLElement>).find(
        (el) => el.getAttribute('data-vflow-node-id') === id || el.textContent?.trim() === id,
      ) ?? flow.injector.get(FlowEntitiesService).getNode(id)!.nodeElement()!;
    /** Drags a node by a client-space delta in the given number of moves. */
    const drag = (id: string, dx: number, dy: number, steps = 1) => {
      const start = { x: origin.left + 150, y: origin.top + 150 };
      mouse(element(id), 'mousedown', start.x, start.y);
      for (let i = 1; i <= steps; i++) {
        mouse(window, 'mousemove', start.x + (dx * i) / steps, start.y + (dy * i) / steps);
      }
      mouse(window, 'mouseup', start.x + dx, start.y + dy);
    };
    return { fixture, flow, node, drag, status: flow.injector.get(FlowStatusService) };
  }

  const transform = (
    id: string,
    fn: (intent: GeometryIntent) => void | false,
    rest: Partial<GeometryTransform> = {},
  ): VflowFeature => vflowFeature(`test:${id}`, provideGeometryTransform({ id, transform: fn, ...rest }));

  it('writes the candidate point as computed, clamped only where extent asks for it', async () => {
    const { node, drag } = await setup();

    drag('free', 30, 15);
    expect(node('free').point()).toEqual({ x: 50, y: 35 });

    drag('child', 500, 500);
    expect(node('child').point()).toEqual({ x: 150, y: 120 });
  });

  it('reflects an offset applied by a high transform in the written position', async () => {
    const { node, drag } = await setup([
      transform(
        'shift',
        (intent) => {
          for (const change of intent.changes) if (change.point) change.point.x += 100;
        },
        { precedence: 'high', phases: ['update'] },
      ),
    ]);

    drag('free', 30, 15);
    expect(node('free').point()).toEqual({ x: 150, y: 35 });
  });

  it('keeps the gesture inactive when a transform vetoes the start phase', async () => {
    const seen: IntentPhase[] = [];
    const { node, drag, status } = await setup([
      transform('block', (intent) => {
        seen.push(intent.phase);
        return intent.phase === 'start' ? false : undefined;
      }),
    ]);

    drag('free', 30, 15, 3);
    expect(node('free').point()).toEqual({ x: 20, y: 20 });
    expect(status.status().state).toBe('idle');
    expect(seen).toEqual(['start']);
  });

  it('restores the initial positions when a transform vetoes the end phase', async () => {
    const { node, drag, status } = await setup([
      transform('drop', (intent) => (intent.phase === 'end' ? false : undefined)),
    ]);

    drag('free', 30, 15, 2);
    expect(node('free').point()).toEqual({ x: 20, y: 20 });
    expect(status.status().state).toBe('node-drag-end');
  });

  it('lets a transform grow the parent so the child clamps against the new size in the same frame', async () => {
    const { node, drag } = await setup([
      transform(
        'grow',
        (intent) => {
          const child = intent.changes.find((change) => change.id === 'child');
          if (child?.point) intent.changes.push({ id: 'parent', width: child.point.x + 50 + 20 });
        },
        { precedence: 'low', phases: ['update'] },
      ),
    ]);

    drag('child', 300, 0);
    expect(node('child').point()).toEqual({ x: 310, y: 10 });
    expect(node('parent').width!()).toBe(380);
  });

  it('runs the same transforms for a keyboard move as a one-shot session', async () => {
    const sources: string[] = [];
    const phases: IntentPhase[] = [];
    const { flow, node } = await setup([
      transform('trace', (intent) => {
        sources.push(intent.session.source);
        phases.push(intent.phase);
        if (intent.phase === 'update') for (const change of intent.changes) if (change.point) change.point.y += 100;
      }),
    ]);
    const model = flow.injector.get(FlowEntitiesService).getNode('free')!;
    model.selected.set(true);

    const moved = flow.injector.get(DraggableService).moveSelected(model, { x: 1, y: 0 }, false);

    expect(moved).toEqual([model]);
    expect(node('free').point()).toEqual({ x: 25, y: 120 });
    expect(new Set(sources)).toEqual(new Set(['keyboard']));
    expect(phases).toEqual(['start', 'update', 'end']);
  });

  it('allocates one intent with one change per dragged node per frame', async () => {
    const intents: GeometryIntent[] = [];
    const { drag } = await setup([transform('count', (intent) => void intents.push(intent), { phases: ['update'] })]);

    drag('free', 30, 15, 4);
    expect(intents.length).toBe(4);
    expect(intents.every((intent) => intent.changes.length === 1 && intent.session === intents[0].session)).toBeTrue();
    expect(new Set(intents).size).toBe(4);
  });
});
