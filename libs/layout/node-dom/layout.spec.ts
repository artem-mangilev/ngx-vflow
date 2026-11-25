import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Vflow, createNodes } from 'ngx-vflow';
import { VxLayout, LayoutAlgorithm } from '@vflow/layout';
import { of } from 'rxjs';

@Component({
  template: `<vflow [vxLayout]="algorithm" [nodes]="nodes"><div *vNode class="card"></div></vflow>`,
  imports: [Vflow, VxLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  public readonly runs: number[] = [];
  public readonly algorithm: LayoutAlgorithm = (graph) => {
    this.runs.push(graph.nodes.length);
    return of({ positions: new Map() });
  };
  public readonly nodes = createNodes([{ id: 'a', point: { x: 0, y: 0 } }]);
}

describe('VxLayout in a DOM without layout', () => {
  it('renders and never runs, since no node is ever measured', async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.card')).not.toBeNull();
    expect(fixture.componentInstance.runs).toEqual([]);
    expect(fixture.componentInstance.nodes[0].point()).toEqual({ x: 0, y: 0 });
  });
});
