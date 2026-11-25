import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { createNodes } from '../interfaces/node.interface';
import { SelectionMode } from '../types/selection-mode.type';
import { Vflow } from '../vflow';
import { SelectionBoxContextDirective } from './selection-box-context.directive';
import { dispatchPointer } from '../gestures/pointer-events.testing';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes" [selectionMode]="selectionMode()">
    <div *vNode style="width: 50px; height: 30px"></div>
  </vflow>`,
})
class SelectionBoxHostComponent {
  public readonly selectionMode = signal<SelectionMode>('default');
  public readonly nodes = createNodes([
    { id: 'eligible', point: { x: 10, y: 10 } },
    { id: 'ineligible', point: { x: 80, y: 10 }, selectable: false },
    { id: 'selected', point: { x: 300, y: 200 }, selected: true },
  ]);
}

describe('SelectionBoxContextDirective', () => {
  let fixture: ComponentFixture<SelectionBoxHostComponent>;
  let root: HTMLElement;
  let pane: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(SelectionBoxHostComponent);
    root = fixture.nativeElement;
    await stable();
    pane = fixture.debugElement.query(By.directive(SelectionBoxContextDirective)).nativeElement;
  });

  afterEach(() => {
    // Releases the held modifier.
    window.dispatchEvent(new Event('blur'));
  });

  async function stable() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const selected = () =>
    Array.from(root.querySelectorAll('[data-v-node][data-v-selected]')).map((node) => node.getAttribute('data-v-node'));
  const box = () => root.querySelector('[data-v-selection-box]');

  function holdSelectionModifier() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', code: 'ShiftLeft' }));
  }

  /** Presses the pane at flow (0, 0) and moves the pointer to flow (150, 100), around the first two nodes. */
  async function dragOverTheFirstNodes() {
    const { left, top } = pane.getBoundingClientRect();
    dispatchPointer(pane, 'pointerdown', { x: left, y: top });
    dispatchPointer(window, 'pointermove', { x: left + 150, y: top + 100 });
    await stable();
  }

  async function release() {
    const { left, top } = pane.getBoundingClientRect();
    dispatchPointer(window, 'pointerup', { x: left + 150, y: top + 100 });
    await stable();
  }

  it('draws the box while the selection modifier is held', async () => {
    holdSelectionModifier();

    await dragOverTheFirstNodes();

    expect(box()).not.toBeNull();
  });

  it('does not start without the selection modifier', async () => {
    await dragOverTheFirstNodes();

    expect(box()).toBeNull();
    expect(selected()).toEqual(['selected']);
  });

  it('does not start in the manual selection mode and keeps the selection', async () => {
    fixture.componentInstance.selectionMode.set('manual');
    await stable();
    holdSelectionModifier();

    await dragOverTheFirstNodes();
    await release();

    expect(box()).toBeNull();
    expect(selected()).toEqual(['selected']);
  });

  it('marks the selectable nodes inside the box as selected while dragging', async () => {
    holdSelectionModifier();

    await dragOverTheFirstNodes();

    expect(selected()).toEqual(['eligible', 'selected']);
  });

  it('selects only the selectable nodes inside the box on release, in place of the previous selection', async () => {
    holdSelectionModifier();
    await dragOverTheFirstNodes();

    await release();

    expect(box()).toBeNull();
    expect(selected()).toEqual(['eligible']);
  });
});
