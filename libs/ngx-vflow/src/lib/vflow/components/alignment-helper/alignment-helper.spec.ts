import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { VflowComponent } from '../vflow/vflow.component';
import { createNodes } from '../../interfaces/node.interface';
import { AlignmentHelperSettings } from '../../interfaces/alignment-helper-settings.interface';
import { dispatchMouse } from '../../gestures/pointer-events.testing';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 600px; height: 400px" [nodes]="nodes" [alignmentHelper]="alignmentHelper()">
    <div *vNode style="width: 100px; height: 50px"></div>
  </vflow>`,
})
class AlignmentHostComponent {
  readonly flow = viewChild.required(VflowComponent);
  readonly alignmentHelper = signal<AlignmentHelperSettings | boolean>(true);
  readonly nodes = createNodes([
    { id: 'moving', point: { x: 0, y: 0 } },
    { id: 'fixed', point: { x: 300, y: 100 } },
  ]);
}

describe('alignment helper', () => {
  let fixture: ComponentFixture<AlignmentHostComponent>;
  let root: HTMLElement;

  async function stable() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function setup(alignmentHelper: AlignmentHelperSettings | boolean = true) {
    fixture = TestBed.createComponent(AlignmentHostComponent);
    fixture.componentInstance.alignmentHelper.set(alignmentHelper);
    root = fixture.nativeElement;
    fixture.detectChanges();
    await new Promise<void>((resolve) => fixture.componentInstance.flow().initialized.subscribe(() => resolve()));
    await stable();
  }

  afterEach(() => {
    // Releases a held modifier.
    window.dispatchEvent(new Event('blur'));
  });

  const moving = () => fixture.componentInstance.nodes[0];
  const guides = () => root.querySelectorAll('[data-v-alignment-guide]');

  /** Presses the moving node and drags it down by `dy`; releases unless told otherwise. */
  async function dragDown(dy: number, release = true) {
    const node = root.querySelector<HTMLElement>('[data-v-node="moving"]')!;
    const { left, top } = node.getBoundingClientRect();
    dispatchMouse(node, 'mousedown', { x: left + 10, y: top + 10 });
    dispatchMouse(window, 'mousemove', { x: left + 10, y: top + 10 + dy });
    await stable();
    if (release) {
      dispatchMouse(window, 'mouseup', { x: left + 10, y: top + 10 + dy });
      await stable();
    }
  }

  it('draws no guides before a drag', async () => {
    await setup();

    expect(guides()).toHaveLength(0);
  });

  it('draws a guide line and the aligned points while a node is dragged near an alignment', async () => {
    await setup();

    await dragDown(96, false);

    expect(root.querySelector('line[data-v-alignment-guide="line"]')).not.toBeNull();
    expect(root.querySelector('path[data-v-alignment-guide="point"]')).not.toBeNull();
  });

  it('snaps the dragged node onto the alignment', async () => {
    await setup();

    await dragDown(96, false);

    expect(moving().point()).toEqual({ x: 0, y: 100 });
  });

  it('removes the guides on release and keeps the aligned point', async () => {
    await setup();

    await dragDown(96);

    expect(guides()).toHaveLength(0);
    expect(moving().point()).toEqual({ x: 0, y: 100 });
  });

  it('draws no guides and does not snap while Alt is held', async () => {
    await setup();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }));

    await dragDown(96, false);

    expect(guides()).toHaveLength(0);
    expect(moving().point()).toEqual({ x: 0, y: 96 });
  });

  it('does not snap beyond the tolerance in screen pixels', async () => {
    await setup({ tolerance: 2 });

    await dragDown(96, false);

    expect(guides()).toHaveLength(0);
    expect(moving().point()).toEqual({ x: 0, y: 96 });
  });

  it('renders no helper when it is off', async () => {
    await setup(false);

    await dragDown(96, false);

    expect(root.querySelector('[alignmentHelper]')).toBeNull();
    expect(moving().point()).toEqual({ x: 0, y: 96 });
  });
});
