import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Connection, Edge, Vflow, createNodes } from 'ngx-vflow';

// The example of the "Unit testing" docs page.
@Component({
  template: `<vflow [nodes]="nodes" [edges]="edges" (connect)="connections.push($event)">
    <ng-template vNode let-ctx>
      <div class="step" vSelectable>
        {{ ctx.node.id }}
        <span vHandle handleType="target" position="left"></span>
        <span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
  </vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EditorComponent {
  readonly nodes = createNodes([
    { id: 'start', point: { x: 0, y: 0 } },
    { id: 'end', point: { x: 250, y: 0 } },
  ]);
  readonly edges: Edge[] = [];
  readonly connections: Connection[] = [];
}

describe('a component with a flow', () => {
  async function render() {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture;
  }

  it('renders a node presentation for every node', async () => {
    const fixture = await render();

    const steps = (fixture.nativeElement as HTMLElement).querySelectorAll('.step');

    expect(steps.length).toBe(2);
    expect(steps[0].textContent).toContain('start');
  });

  it('connects two steps', async () => {
    const fixture = await render();

    const [start, end] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.step'));
    const source = start.querySelector('[handleType="source"]')!;
    const target = end.querySelector('[handleType="target"]')!;

    source.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1, isPrimary: true }));
    await fixture.whenStable();
    target.dispatchEvent(new PointerEvent('pointerenter'));
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await fixture.whenStable();

    expect(fixture.componentInstance.connections).toEqual([
      { source: 'start', target: 'end', sourceHandleType: 'source', targetHandleType: 'target' },
    ]);
  });
});
