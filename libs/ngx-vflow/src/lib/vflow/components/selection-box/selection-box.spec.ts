import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { SelectionBoxMode } from '../../types/selection-box-mode.type';
import { provideVflow } from '../../features/feature';
import { withShortcuts } from '../../features/with-shortcuts';
import { dispatchPointer } from '../../gestures/pointer-events.testing';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 500px; height: 300px" [nodes]="nodes" [edges]="edges" [selectionBoxMode]="mode()">
    <div *vNode style="width: 50px; height: 30px">
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
    <svg:path *vEdge="let ctx" [attr.d]="ctx.path()" />
  </vflow>`,
})
class SelectionBoxHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly mode = signal<SelectionBoxMode>('full');
  readonly nodes = createNodes([
    { id: 'left', point: { x: 20, y: 20 } },
    { id: 'right', point: { x: 200, y: 20 } },
    { id: 'far', point: { x: 400, y: 200 }, selected: true },
  ]);
  readonly edges = createEdges([{ id: 'left-right', source: 'left', target: 'right' }]);
}

describe('selection box', () => {
  let fixture: ComponentFixture<SelectionBoxHostComponent>;
  let root: HTMLElement;
  let pane: HTMLElement;

  async function stable() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function setup(mode: SelectionBoxMode = 'full') {
    TestBed.configureTestingModule({
      // A key of every platform: `Mod` is Meta on macOS and Control elsewhere.
      providers: provideVflow(withShortcuts({ modifiers: { multiSelection: ['Control'] } })),
    });
    fixture = TestBed.createComponent(SelectionBoxHostComponent);
    fixture.componentInstance.mode.set(mode);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise<void>((resolve) => fixture.componentInstance.flow().initialized.subscribe(() => resolve()));
    await stable();
    pane = root.querySelector('.v-pane')!;
  }

  afterEach(() => {
    // Releases the held modifiers.
    window.dispatchEvent(new Event('blur'));
  });

  function hold(key: string, code: string) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, code }));
  }

  /** Drags the box with the selection modifier held between two client offsets from the pane corner. */
  async function drag(from: [number, number], to: [number, number], release = true) {
    hold('Shift', 'ShiftLeft');
    const { left, top } = pane.getBoundingClientRect();
    dispatchPointer(pane, 'pointerdown', { x: left + from[0], y: top + from[1] });
    dispatchPointer(window, 'pointermove', { x: left + to[0], y: top + to[1] });
    if (release) dispatchPointer(window, 'pointerup', { x: left + to[0], y: top + to[1] });
    await stable();
  }

  const box = () => root.querySelector('[data-v-selection-box]');
  const selectedNodes = () =>
    Array.from(root.querySelectorAll('[data-v-node][data-v-selected]')).map((node) => node.getAttribute('data-v-node'));
  const edgeSelected = () => root.querySelector('[data-v-edge="left-right"]')!.hasAttribute('data-v-selected');

  it('draws the rectangle between the press and the pointer, in flow space', async () => {
    await setup();
    await fixture.componentInstance.flow().setViewport({ x: 0, y: 0, zoom: 2 });

    await drag([100, 60], [20, 20], false);

    expect(['x', 'y', 'width', 'height'].map((name) => Number(box()!.getAttribute(name)))).toEqual([10, 10, 40, 20]);
  });

  it.each<[SelectionBoxMode, string[]]>([
    ['full', []],
    ['partial', ['left']],
  ])('in %s mode selects %j for a box over part of a node', async (mode, selected) => {
    await setup(mode);

    await drag([0, 0], [40, 40]);

    expect(selectedNodes()).toEqual(selected);
  });

  it('selects a node the box covers wholly in full mode', async () => {
    await setup('full');

    await drag([0, 0], [100, 100]);

    expect(selectedNodes()).toEqual(['left']);
  });

  it.each<[SelectionBoxMode, boolean]>([
    ['full', false],
    ['partial', true],
  ])('in %s mode selects an edge with one end in the box: %s', async (mode, selected) => {
    await setup(mode);

    await drag([0, 0], [120, 100]);

    expect(edgeSelected()).toBe(selected);
  });

  it('selects an edge with both ends in the box in full mode', async () => {
    await setup('full');

    await drag([0, 0], [300, 100]);

    expect(edgeSelected()).toBe(true);
  });

  it('adds to the selection while the multi-selection modifier is held', async () => {
    await setup();
    hold('Control', 'ControlLeft');

    await drag([0, 0], [100, 100]);

    expect(selectedNodes()).toEqual(['left', 'far']);
  });

  it('selects nothing for a box smaller than 2 pixels and keeps the selection', async () => {
    await setup('partial');

    await drag([30, 30], [31, 31]);

    expect(selectedNodes()).toEqual(['far']);
  });
});
