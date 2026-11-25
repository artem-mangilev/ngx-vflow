import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { dispatchPointer, pointerDrag } from '../../gestures/pointer-events.testing';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (nodes of graphs; track $index) {
    <vflow style="display: block; width: 400px; height: 200px" [nodes]="nodes">
      <div *vNode style="width: 100px; height: 40px"></div>
    </vflow>
  }`,
})
class TwoFlowsHostComponent {
  readonly flows = viewChildren(VflowComponent);
  readonly graphs = [0, 1].map(() => createNodes([{ id: 'a', point: { x: 20, y: 20 }, selected: true }]));
}

describe('two flows on one page', () => {
  let fixture: ComponentFixture<TwoFlowsHostComponent>;
  let roots: HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(TwoFlowsHostComponent);
    fixture.detectChanges();
    const flows = fixture.componentInstance.flows();
    await Promise.all(flows.map((flow) => new Promise<void>((resolve) => flow.initialized.subscribe(() => resolve()))));
    await fixture.whenStable();
    roots = Array.from(fixture.nativeElement.querySelectorAll('vflow'));
  });

  afterEach(() => {
    // Releases a held modifier.
    window.dispatchEvent(new Event('blur'));
  });

  const pane = (index: number) => roots[index].querySelector('.v-pane') as HTMLElement;
  const node = (index: number) => roots[index].querySelector('[data-v-node="a"]') as HTMLElement;
  const viewport = (index: number) => fixture.componentInstance.flows()[index].viewport();
  const point = (index: number) => fixture.componentInstance.graphs[index][0].point();

  function press(index: number, key: string) {
    node(index).focus();
    node(index).dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true }));
  }

  it('pans only the flow whose pane is dragged', () => {
    const { left, top } = pane(0).getBoundingClientRect();

    pointerDrag(pane(0), { x: left + 300, y: top + 150 }, [{ x: left + 340, y: top + 150 }]);

    expect(viewport(0)).toEqual({ x: 40, y: 0, zoom: 1 });
    expect(viewport(1)).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('moves only the nodes of the flow that has focus on an arrow key', () => {
    press(0, 'ArrowRight');

    expect(point(0).x).toBeGreaterThan(20);
    expect(point(1)).toEqual({ x: 20, y: 20 });
  });

  it('zooms only the flow that has focus on a zoom key', () => {
    press(0, '+');

    expect(viewport(0).zoom).toBeGreaterThan(1);
    expect(viewport(1).zoom).toBe(1);
  });

  it('draws the selection box only in the flow whose pane is dragged', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }));
    const { left, top } = pane(0).getBoundingClientRect();

    dispatchPointer(pane(0), 'pointerdown', { x: left + 200, y: top + 100 });
    dispatchPointer(window, 'pointermove', { x: left + 300, y: top + 150 });
    fixture.detectChanges();

    expect(roots[0].querySelector('[data-v-selection-box]')).not.toBeNull();
    expect(roots[1].querySelector('[data-v-selection-box]')).toBeNull();
    dispatchPointer(window, 'pointerup', { x: left + 300, y: top + 150 });
  });
});
