import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';

@Component({
  template: `<vflow
    [view]="[500, 300]"
    [nodes]="nodes()"
    [edges]="edges()"
    [elevateNodesOnSelect]="elevateNodes()"
    [elevateEdgesOnSelect]="elevateEdges()">
    <ng-template let-ctx vNode>
      <div class="card" style="width: 60px; height: 30px">
        <button type="button" class="action" vNoSelect>act</button>
        <span vHandle handleType="target" position="left"></span>
        <span vHandle handleType="source" position="right"></span>
      </div>
    </ng-template>
    <ng-template let-ctx vEdge>
      @if (ctx.edge.id === 'a-b') {
        <svg:g vEdgeInteraction>
          <svg:path class="line" fill="none" [attr.d]="ctx.path()" />
        </svg:g>
      } @else {
        <svg:path class="line" fill="none" [attr.d]="ctx.path()" />
      }
    </ng-template>
  </vflow>`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly nodes = signal(
    createNodes([
      { id: 'a', point: { x: 0, y: 0 } },
      { id: 'b', point: { x: 200, y: 0 } },
      { id: 'c', point: { x: 0, y: 150 }, selectable: false },
    ]),
  );
  readonly edges = signal(
    createEdges([
      { id: 'a-b', source: 'a', target: 'b' },
      { id: 'a-c', source: 'a', target: 'c' },
    ]),
  );
  readonly elevateNodes = signal(true);
  readonly elevateEdges = signal(true);
}

describe('selection by click', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let root: HTMLElement;

  const node = (id: string) => host.nodes().find((n) => n.id === id)!;
  const edge = (id: string) => host.edges().find((e) => e.id === id)!;
  const nodeElement = (id: string) => root.querySelectorAll<HTMLElement>('.v-node')[['a', 'b', 'c'].indexOf(id)];
  const edgeElement = (id: string) => root.querySelectorAll<SVGElement>('.v-edge')[['a-b', 'a-c'].indexOf(id)];
  const click = (target: Element) => target.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    root = fixture.nativeElement;
    await settle();
  });

  it('selects a node by a click on its presentation without any directive', async () => {
    click(nodeElement('a').querySelector('.card')!);
    expect(node('a').selected!()).toBe(true);

    click(nodeElement('b').querySelector('.card')!);
    expect(node('a').selected!()).toBe(false);
    expect(node('b').selected!()).toBe(true);
  });

  it('keeps the selection on a click inside [vNoSelect] and on an unselectable node', async () => {
    click(nodeElement('a').querySelector('.card')!);

    click(nodeElement('b').querySelector('.action')!);
    expect(node('b').selected!()).toBe(false);
    expect(node('a').selected!()).toBe(true);

    click(nodeElement('c').querySelector('.card')!);
    expect(node('c').selected!()).toBe(false);
    expect(node('a').selected!()).toBe(true);
  });

  it('draws the hit area of an edge in its host unless the presentation has g[vEdgeInteraction]', async () => {
    const withGroup = edgeElement('a-b');
    const plain = edgeElement('a-c');
    expect(withGroup.querySelector(':scope > .v-interactive-edge')).toBeNull();
    expect(withGroup.querySelector('g > .v-interactive-edge:first-child')).not.toBeNull();
    const stroke = plain.querySelector<SVGPathElement>(':scope > .v-interactive-edge')!;
    expect(stroke).not.toBeNull();
    expect(stroke.style.strokeWidth).toBe('20px');
    // The presentation stays on top of the stroke.
    expect(
      stroke.compareDocumentPosition(plain.querySelector('.line')!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    click(stroke);
    expect(edge('a-c').selected!()).toBe(true);
    click(withGroup.querySelector('.v-interactive-edge')!);
    expect(edge('a-b').selected!()).toBe(true);
    expect(edge('a-c').selected!()).toBe(false);

    edge('a-c').interactionWidth!.set(0);
    await settle();
    expect(plain.querySelector(':scope > .v-interactive-edge')).toBeNull();
  });

  it('elevates a node and an edge when they become selected, however the selection is made', async () => {
    const elevation = (element: HTMLElement | SVGElement) => Number(element.style.zIndex);
    const a = nodeElement('a');
    const b = nodeElement('b');
    // The input order is the initial render order.
    expect(elevation(a)).toBeLessThan(elevation(b));

    node('a').selected!.set(true);
    await settle();
    expect(elevation(a)).toBeGreaterThan(elevation(b));

    click(b.querySelector('.card')!);
    await settle();
    expect(elevation(b)).toBeGreaterThan(elevation(a));

    const ab = edgeElement('a-b');
    const ac = edgeElement('a-c');
    edge('a-c').selected!.set(true);
    await settle();
    expect(elevation(ac)).toBeGreaterThan(elevation(ab));

    host.elevateNodes.set(false);
    await settle();
    node('a').selected!.set(false);
    node('b').selected!.set(false);
    await settle();
    const before = elevation(a);
    node('a').selected!.set(true);
    await settle();
    expect(elevation(a)).toBe(before);
  });
});
