import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../interfaces/node.interface';
import { createEdges } from '../interfaces/edge.interface';
import { Vflow } from '../vflow';

/** Node `a` lists rows of 20 px, each with a handle; the edge starts at the handle of row `first`. */
@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow style="width: 600px; height: 300px" [nodes]="nodes" [edges]="edges">
    <div *vNode="let ctx" style="width: 100px">
      @if (ctx.node.id === 'a') {
        @for (row of rows(); track row) {
          <div style="height: 20px">
            <span vHandle handleType="source" position="right" [handleId]="row"></span>
          </div>
        }
      } @else {
        <div style="height: 40px"><span vHandle handleType="target" position="left"></span></div>
      }
    </div>
    <svg:path *vEdge="let ctx" data-testid="edge" fill="none" [attr.d]="ctx.path()" />
  </vflow>`,
})
class RowsHostComponent {
  public readonly rows = signal(['first', 'second']);
  public readonly nodes = createNodes([
    { id: 'a', point: { x: 0, y: 0 } },
    { id: 'b', point: { x: 300, y: 0 } },
  ]);
  public readonly edges = createEdges([
    { id: 'a-b', source: 'a', sourceHandle: 'first', target: 'b', curve: 'straight' },
  ]);
}

describe('NodeHandlesControllerDirective', () => {
  it('measures the handles again when the content of the node is reordered without resizing', async () => {
    const fixture = TestBed.createComponent(RowsHostComponent);
    const root = fixture.nativeElement as HTMLElement;
    const start = () => /^M [\d.]+,([\d.]+)/.exec(root.querySelector('[data-testid="edge"]')?.getAttribute('d') ?? '');
    fixture.detectChanges();
    await fixture.whenStable();
    // The middle of the first row.
    await expect.poll(() => start()?.[1]).toBe('10');

    // A keyed @for moves the same row elements: no element changes its size.
    fixture.componentInstance.rows.set(['second', 'first']);
    fixture.detectChanges();
    await fixture.whenStable();

    await expect.poll(() => start()?.[1]).toBe('30');
  });
});
