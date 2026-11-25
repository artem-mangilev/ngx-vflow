import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { createNode } from '../../interfaces/node.interface';
import { Position } from '../../types/position.type';
import { VflowNodeToolbarComponent } from './node-toolbar.component';
import { pointerDrag } from '../../gestures/pointer-events.testing';

const toolbarPosition = signal<Position | null>(null);

/** A presentation that declares its toolbar conditionally, as a selection-driven toolbar does. */
@Component({
  template: `<div class="box" style="width: 100px; height: 50px; position: relative">
    Node
    @if (toolbarPosition(); as position) {
      <v-node-toolbar [position]="position"
        ><button class="tool" style="display: block; width: 30px; height: 20px; margin: 0; padding: 0; border: 0">
          Tool
        </button></v-node-toolbar
      >
    }
  </div>`,
  imports: [VflowNodeToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToolbarNodeComponent {
  protected toolbarPosition = toolbarPosition;
}

describe('VflowNodeToolbarComponent', () => {
  let fixture: ComponentFixture<VflowComponent>;
  let style: HTMLStyleElement | undefined;

  async function settle() {
    fixture.detectChanges();
    for (let i = 0; i < 5; i++) await new Promise(requestAnimationFrame);
    await fixture.whenStable();
  }

  beforeEach(async () => {
    toolbarPosition.set(null);
    fixture = TestBed.createComponent(VflowComponent);
    Object.assign(fixture.nativeElement.style, { width: '400px', height: '300px' });
    fixture.componentRef.setInput('nodes', [
      createNode({ id: 'node', component: ToolbarNodeComponent, point: { x: 20, y: 30 } }),
    ]);
    await settle();
  });

  afterEach(() => style?.remove());

  const toolbar = () => fixture.nativeElement.querySelector('v-node-toolbar') as HTMLElement | null;
  const box = () => (fixture.nativeElement.querySelector('.box') as HTMLElement).getBoundingClientRect();

  it('renders inside the node in the same change detection pass as the presentation that declares it', () => {
    toolbarPosition.set('top');
    fixture.detectChanges();

    expect(toolbar()!.querySelector('.tool')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-v-node]')!.contains(toolbar())).toBe(true);
  });

  it('is removed with the condition of the presentation', () => {
    toolbarPosition.set('top');
    fixture.detectChanges();
    toolbarPosition.set(null);
    fixture.detectChanges();

    expect(toolbar()).toBeNull();
  });

  it.each<[Position, (node: DOMRect, bar: DOMRect) => [number, number]]>([
    ['top', (node, bar) => [node.top - bar.bottom, bar.left + bar.width / 2 - (node.left + node.width / 2)]],
    ['bottom', (node, bar) => [bar.top - node.bottom, bar.left + bar.width / 2 - (node.left + node.width / 2)]],
    ['left', (node, bar) => [node.left - bar.right, bar.top + bar.height / 2 - (node.top + node.height / 2)]],
    ['right', (node, bar) => [bar.left - node.right, bar.top + bar.height / 2 - (node.top + node.height / 2)]],
  ])('hangs 10px outside the %s side, centered along it', (position, measure) => {
    toolbarPosition.set(position);
    fixture.detectChanges();

    const bar = toolbar()!.getBoundingClientRect();
    const [gap, offCenter] = measure(box(), bar);
    expect([bar.width, bar.height]).toEqual([30, 20]);
    expect(gap).toBeCloseTo(10, 1);
    expect(offCenter).toBeCloseTo(0, 1);
  });

  it('lets a plain class of the application change the gap', () => {
    style = document.createElement('style');
    style.textContent = '.tight { margin: 2px; }';
    document.head.append(style);

    toolbarPosition.set('top');
    fixture.detectChanges();
    toolbar()!.classList.add('tight');

    expect(box().top - toolbar()!.getBoundingClientRect().bottom).toBeCloseTo(2, 1);
  });

  it('does not drag the node from a press inside the toolbar', async () => {
    toolbarPosition.set('top');
    await settle();
    const drags: unknown[] = [];
    fixture.componentInstance.nodeDragStart.subscribe((event) => drags.push(event));

    const tool = toolbar()!.querySelector('.tool')!;
    const { left, top } = tool.getBoundingClientRect();
    pointerDrag(tool, { x: left + 5, y: top + 5 }, [
      { x: left + 30, y: top + 5 },
      { x: left + 60, y: top + 25 },
    ]);
    await settle();

    expect(drags).toEqual([]);
    expect(fixture.componentInstance.getNodeRect('node')).toMatchObject({ x: 20, y: 30 });
  });

  it('drags the node from a press on the node outside the toolbar', async () => {
    toolbarPosition.set('top');
    await settle();

    const { left, top } = box();
    pointerDrag(fixture.nativeElement.querySelector('.box'), { x: left + 5, y: top + 5 }, [
      { x: left + 30, y: top + 5 },
      { x: left + 60, y: top + 25 },
    ]);
    await settle();

    expect(fixture.componentInstance.getNodeRect('node')).toMatchObject({ x: 75, y: 50 });
  });
});
