import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 600px; height: 300px" [nodes]="nodes" [edges]="edges" [edgesFocusable]="focusable()">
    <div *vNode style="width: 100px; height: 40px">
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
    <svg:path *vEdge="let ctx" [attr.d]="ctx.path()" />
  </vflow>`,
})
class EdgesFocusableHostComponent {
  readonly focusable = signal<boolean | undefined>(undefined);
  readonly nodes = createNodes(['a', 'b', 'c'].map((id, i) => ({ id, point: { x: i * 200, y: 0 } })));
  readonly edges = createEdges([
    { id: 'a-b', source: 'a', target: 'b' },
    { id: 'b-c', source: 'b', target: 'c', focusable: true },
  ]);
}

describe('edgesFocusable', () => {
  let fixture: ComponentFixture<EdgesFocusableHostComponent>;

  async function render(focusable?: boolean) {
    fixture = TestBed.createComponent(EdgesFocusableHostComponent);
    fixture.componentInstance.focusable.set(focusable);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const tabIndex = (id: string) =>
    fixture.nativeElement.querySelector(`[data-v-edge="${id}"]`).getAttribute('tabindex');

  it('makes edges tab stops by default', async () => {
    await render();

    expect(tabIndex('a-b')).toBe('0');
  });

  it('takes edges out of the tab order when false', async () => {
    await render(false);

    expect(tabIndex('a-b')).toBe('-1');
  });

  it('keeps an edge that is focusable itself in the tab order', async () => {
    await render(false);

    expect(tabIndex('b-c')).toBe('0');
  });

  it('follows a change of the input', async () => {
    await render();

    fixture.componentInstance.focusable.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(tabIndex('a-b')).toBe('-1');
  });
});
