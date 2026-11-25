import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { dispatchMouse, dispatchPointer } from '../../gestures/pointer-events.testing';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 400px; height: 200px" [nodes]="nodes">
    <div *vNode style="width: 100px; height: 40px">
      <span vHandle handleType="source" position="right"></span>
    </div>
  </vflow>`,
})
class DestroyHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly nodes = createNodes([{ id: 'a', point: { x: 20, y: 20 } }]);
}

describe('a destroyed flow', () => {
  let fixture: ComponentFixture<DestroyHostComponent>;
  let errors: ErrorEvent[];
  const collect = (event: ErrorEvent) => errors.push(event);

  beforeEach(async () => {
    fixture = TestBed.createComponent(DestroyHostComponent);
    fixture.detectChanges();
    await new Promise<void>((resolve) => fixture.componentInstance.flow().initialized.subscribe(() => resolve()));
    await fixture.whenStable();
    // An exception in an event listener does not reach the dispatcher; the window reports it.
    errors = [];
    window.addEventListener('error', collect);
  });

  afterEach(() => window.removeEventListener('error', collect));

  const node = () => fixture.nativeElement.querySelector('[data-v-node="a"]') as HTMLElement;

  it('does not move a node it was dragging', async () => {
    const { left, top } = node().getBoundingClientRect();
    dispatchMouse(node(), 'mousedown', { x: left + 10, y: top + 10 });
    dispatchMouse(window, 'mousemove', { x: left + 30, y: top + 10 });
    await fixture.whenStable();
    const before = fixture.componentInstance.nodes[0].point();
    // The drag is under way before the flow goes.
    expect(before).not.toEqual({ x: 20, y: 20 });

    fixture.destroy();
    dispatchMouse(window, 'mousemove', { x: left + 80, y: top + 60 });
    dispatchMouse(window, 'mouseup', { x: left + 80, y: top + 60 });

    expect(fixture.componentInstance.nodes[0].point()).toEqual(before);
    expect(errors).toEqual([]);
  });

  it('ends a connection it was drawing without an error', () => {
    const handle = fixture.nativeElement.querySelector('[data-v-handle-type="source"]') as HTMLElement;
    dispatchMouse(handle, 'mousedown', { x: 0, y: 0 });
    dispatchPointer(window, 'pointermove', { x: 50, y: 50 });

    fixture.destroy();
    dispatchPointer(window, 'pointermove', { x: 80, y: 80 });
    dispatchPointer(window, 'pointerup', { x: 80, y: 80 });

    expect(errors).toEqual([]);
  });

  it('ignores keys and window focus changes without an error', () => {
    fixture.destroy();

    for (const type of ['keydown', 'keyup']) {
      document.dispatchEvent(new KeyboardEvent(type, { key: 'Shift', code: 'ShiftLeft', bubbles: true }));
    }
    window.dispatchEvent(new Event('blur'));

    expect(errors).toEqual([]);
  });
});
