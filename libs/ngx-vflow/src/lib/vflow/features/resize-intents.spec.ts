import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../components/vflow/vflow.component';
import { createNode, Node } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { Vflow } from '../vflow';
import { provideVflow, vflowFeature, VflowFeature } from './feature';
import { GeometryIntent, IntentPhase } from './geometry-intent.interface';
import { provideGeometryTransform } from './provide-geometry-transform';

@Component({
  template: `<vflow [nodes]="nodes()" [edges]="[]" [view]="[400, 300]">
    <ng-template node><div class="card" resizable></div></ng-template>
  </vflow>`,
  styles: `
    .card {
      width: 100px;
      height: 60px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  public readonly nodes = signal<Node[]>([
    createNode({ id: 'box', point: { x: 50, y: 50 }, width: 100, height: 60 }),
    createNode({ id: 'inner', point: { x: 10, y: 10 }, parentId: 'box', width: 20, height: 20 }),
  ]);
}

function mouse(target: EventTarget, type: 'mousedown' | 'mousemove' | 'mouseup', x: number, y: number) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, view: window, button: 0, clientX: x, clientY: y }));
}

describe('Resize intents', () => {
  async function setup(features: VflowFeature[]) {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    TestBed.overrideComponent(HostComponent, { set: { providers: provideVflow(...features) } });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent));
    const model = flow.injector.get(FlowEntitiesService).getNode('box')!;
    const node = (id: string) => fixture.componentInstance.nodes().find((n) => n.id === id)!;
    const dragControl = (selector: string, dx: number, dy: number) => {
      // Both nodes render the resizable template; take the control of the node under test.
      const control = model.nodeElement()!.querySelector(selector) as HTMLElement;
      const rect = control.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      mouse(control, 'mousedown', x, y);
      mouse(window, 'mousemove', x + dx / 2, y + dy / 2);
      mouse(window, 'mousemove', x + dx, y + dy);
      mouse(window, 'mouseup', x + dx, y + dy);
    };
    return { fixture, model, node, dragControl };
  }

  const transform = (id: string, fn: (intent: GeometryIntent) => void | false): VflowFeature =>
    vflowFeature(`test:${id}`, provideGeometryTransform({ id, kinds: ['resize'], transform: fn }));

  it('writes the size a resize transform capped, and the inline size follows it', async () => {
    const { fixture, model, node, dragControl } = await setup([
      transform('cap', (intent) => {
        for (const change of intent.changes) if (change.width !== undefined) change.width = Math.min(change.width, 120);
      }),
    ]);

    dragControl('.handle.bottom.right', 60, 0);
    await fixture.whenStable();

    expect(node('box').width!()).toBe(120);
    expect(model.resizing()).toBeFalse();
    expect((fixture.nativeElement.querySelector('.card') as HTMLElement).style.width).toBe('120px');
  });

  it('carries the resized node and its children in one session and restores both when the end is vetoed', async () => {
    const phases: IntentPhase[] = [];
    const sessions = new Set<string>();
    const { node, dragControl } = await setup([
      transform('veto-end', (intent) => {
        phases.push(intent.phase);
        sessions.add(intent.session.id);
        expect(intent.session.nodes).toEqual(['box', 'inner']);
        return intent.phase === 'end' ? false : undefined;
      }),
    ]);

    dragControl('.handle.top.left', -20, -10);

    expect(node('box').point()).toEqual({ x: 50, y: 50 });
    expect(node('box').width!()).toBe(100);
    expect(node('box').height!()).toBe(60);
    expect(node('inner').point()).toEqual({ x: 10, y: 10 });
    expect(sessions.size).toBe(1);
    expect(phases[phases.length - 1]).toBe('end');
    expect(phases.filter((phase) => phase === 'update').length).toBeGreaterThan(0);
  });
});
