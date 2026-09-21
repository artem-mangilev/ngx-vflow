import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { VflowComponent } from '../../vflow/components/vflow/vflow.component';
import { Vflow } from '../../vflow/vflow';
import { provideVflow, vflowFeature, VflowFeature } from '../../vflow/features/feature';
import { provideGeometryTransform } from '../../vflow/features/provide-geometry-transform';
import { createNode, Node } from '../../vflow/interfaces/node.interface';
import { DraggableService } from '../../vflow/services/draggable.service';
import { FlowEntitiesService } from '../../vflow/services/flow-entities.service';
import { SnapGridSettings } from './snap-grid-settings';
import { withSnapGrid } from './with-snap-grid';

@Component({
  template: `<vflow [nodes]="nodes()" [edges]="[]" [view]="[400, 300]">
    <ng-template node><div class="box" resizable></div></ng-template>
  </vflow>`,
  styles: `
    .box {
      width: 60px;
      height: 40px;
    }
  `,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  public readonly nodes = signal<Node[]>([createNode({ id: 'free', point: { x: 20, y: 20 }, width: 60, height: 40 })]);
}

function mouse(target: EventTarget, type: 'mousedown' | 'mousemove' | 'mouseup', x: number, y: number) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, view: window, button: 0, clientX: x, clientY: y }));
}

describe('withSnapGrid', () => {
  async function setup(features: VflowFeature[]) {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    TestBed.overrideComponent(HostComponent, { set: { providers: provideVflow(...features) } });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await new Promise(requestAnimationFrame);
    fixture.detectChanges();
    const flow = fixture.debugElement.query(By.directive(VflowComponent));
    const origin = (fixture.nativeElement.querySelector('.vflow-pane') as HTMLElement).getBoundingClientRect();
    const model = flow.injector.get(FlowEntitiesService).getNode('free')!;
    const point = () => fixture.componentInstance.nodes()[0].point();
    const drag = (dx: number, dy: number) => {
      const start = { x: origin.left + 50, y: origin.top + 40 };
      mouse(model.nodeElement()!, 'mousedown', start.x, start.y);
      mouse(window, 'mousemove', start.x + dx, start.y + dy);
      mouse(window, 'mouseup', start.x + dx, start.y + dy);
    };
    const resize = (selector: string, dx: number, dy: number) => {
      const control = fixture.nativeElement.querySelector(selector) as HTMLElement;
      const rect = control.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      mouse(control, 'mousedown', x, y);
      mouse(window, 'mousemove', x + dx, y + dy);
      mouse(window, 'mouseup', x + dx, y + dy);
    };
    const press = (x: number, y: number, fast = false) => {
      model.selected.set(true);
      flow.injector.get(DraggableService).moveSelected(model, { x, y }, fast);
    };
    const size = () => ({
      width: fixture.componentInstance.nodes()[0].width!(),
      height: fixture.componentInstance.nodes()[0].height!(),
    });
    return { flow, point, drag, press, resize, size };
  }

  it('snaps a pointer drag to the nearest grid line', async () => {
    const { point, drag } = await setup([withSnapGrid([20, 20])]);
    drag(33, 7);
    expect(point()).toEqual({ x: 60, y: 20 });
  });

  it('leaves a flow without the feature with the raw point', async () => {
    const { point, drag } = await setup([]);
    drag(33, 7);
    expect(point()).toEqual({ x: 53, y: 27 });
  });

  it('leaves an axis alone that a higher transform claimed', async () => {
    const { point, drag } = await setup([
      withSnapGrid(20),
      vflowFeature(
        'test:claim',
        provideGeometryTransform({
          id: 'claim-x',
          precedence: 'high',
          transform: (intent) => {
            for (const change of intent.changes) change.claimed = { x: 'claim-x' };
          },
        }),
      ),
    ]);

    drag(33, 7);
    expect(point()).toEqual({ x: 53, y: 20 });
  });

  it('moves a keyboard press to the next grid line in the pressed direction', async () => {
    const { point, press } = await setup([withSnapGrid([20, 20])]);

    press(1, 0);
    expect(point()).toEqual({ x: 40, y: 20 });
    press(0, -1);
    expect(point()).toEqual({ x: 40, y: 0 });
    press(0, 1, true);
    expect(point()).toEqual({ x: 40, y: 80 });
  });

  it('moves a keyboard press one line on a grid smaller than the step', async () => {
    const { point, press } = await setup([withSnapGrid(2)]);

    press(1, 0);
    expect(point()).toEqual({ x: 22, y: 20 });
  });

  it('follows a grid changed through the settings while the flow runs', async () => {
    const { flow, point, drag } = await setup([withSnapGrid(1)]);

    drag(33, 7);
    expect(point()).toEqual({ x: 53, y: 27 });
    flow.injector.get(SnapGridSettings).grid.set([50, 50]);
    drag(10, 10);
    expect(point()).toEqual({ x: 50, y: 50 });
  });

  it('snaps the moving edge of a resize and keeps the anchored edge in place', async () => {
    const { point, size, resize } = await setup([withSnapGrid(20)]);

    resize('.handle.bottom.right', 33, 7);
    expect(point()).toEqual({ x: 20, y: 20 });
    expect(size()).toEqual({ width: 100, height: 40 });

    resize('.handle.top.left', -13, 0);
    expect(point()).toEqual({ x: 0, y: 20 });
    expect(size()).toEqual({ width: 120, height: 40 });
  });
});
