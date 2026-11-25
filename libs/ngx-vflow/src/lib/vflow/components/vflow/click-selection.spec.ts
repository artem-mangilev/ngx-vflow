import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vflow } from '../../vflow';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';

@Component({
  template: `<vflow
    style="width: 500px; height: 300px"
    [nodes]="nodes()"
    [edges]="edges()"
    [elevateNodesOnSelect]="elevateNodes()"
    [elevateEdgesOnSelect]="elevateEdges()">
    <div *vNode="let ctx" class="card" style="width: 60px; height: 30px">
      <button type="button" class="action" vNoSelect>act</button>
      <span vHandle handleType="target" position="left"></span>
      <span vHandle handleType="source" position="right"></span>
    </div>
    <svg:path *vEdge="let ctx" class="line" fill="none" [attr.d]="ctx.path()" />
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
  const nodeElement = (id: string) => root.querySelectorAll<HTMLElement>('[data-v-node]')[['a', 'b', 'c'].indexOf(id)];
  const edgeElement = (id: string) => root.querySelectorAll<SVGElement>('[data-v-edge]')[['a-b', 'a-c'].indexOf(id)];
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

  it('selects a node by a click on its presentation without any directive', () => {
    click(nodeElement('a').querySelector('.card')!);

    expect(node('a').selected!()).toBe(true);
  });

  it('moves the selection to the node clicked next', () => {
    click(nodeElement('a').querySelector('.card')!);
    click(nodeElement('b').querySelector('.card')!);

    expect([node('a').selected!(), node('b').selected!()]).toEqual([false, true]);
  });

  it('keeps the selection on a click inside [vNoSelect]', () => {
    click(nodeElement('a').querySelector('.card')!);
    click(nodeElement('b').querySelector('.action')!);

    expect([node('a').selected!(), node('b').selected!()]).toEqual([true, false]);
  });

  it('keeps the selection on a click on an unselectable node', () => {
    click(nodeElement('a').querySelector('.card')!);
    click(nodeElement('c').querySelector('.card')!);

    expect([node('a').selected!(), node('c').selected!()]).toEqual([true, false]);
  });

  it('marks a node selected by a click with data-v-selected', async () => {
    click(nodeElement('a').querySelector('.card')!);
    await settle();

    expect(nodeElement('a').hasAttribute('data-v-selected')).toBe(true);
  });

  it('moves data-v-selected from a node to the edge clicked next', async () => {
    click(nodeElement('a').querySelector('.card')!);
    await settle();
    click(edgeElement('a-b').querySelector('[data-v-interactive-edge]')!);
    await settle();

    expect([
      nodeElement('a').hasAttribute('data-v-selected'),
      edgeElement('a-b').hasAttribute('data-v-selected'),
    ]).toEqual([false, true]);
  });

  describe('elevation', () => {
    const elevation = (element: HTMLElement | SVGElement) => Number(element.style.zIndex);

    it('renders nodes in input order at first', () => {
      expect(elevation(nodeElement('a'))).toBeLessThan(elevation(nodeElement('b')));
    });

    it('elevates a node selected by the application', async () => {
      node('a').selected!.set(true);
      await settle();

      expect(elevation(nodeElement('a'))).toBeGreaterThan(elevation(nodeElement('b')));
    });

    it('elevates a node selected by a click', async () => {
      node('b').selected!.set(true);
      await settle();
      click(nodeElement('a').querySelector('.card')!);
      await settle();

      expect(elevation(nodeElement('a'))).toBeGreaterThan(elevation(nodeElement('b')));
    });

    it('elevates a selected edge', async () => {
      edge('a-c').selected!.set(true);
      await settle();

      expect(elevation(edgeElement('a-c'))).toBeGreaterThan(elevation(edgeElement('a-b')));
    });

    it('keeps the order of a selected node when elevateNodesOnSelect is off', async () => {
      host.elevateNodes.set(false);
      await settle();
      const before = elevation(nodeElement('a'));

      node('a').selected!.set(true);
      await settle();

      expect(elevation(nodeElement('a'))).toBe(before);
    });

    it('keeps the order of a selected edge when elevateEdgesOnSelect is off', async () => {
      host.elevateEdges.set(false);
      await settle();
      const before = elevation(edgeElement('a-b'));

      edge('a-b').selected!.set(true);
      await settle();

      expect(elevation(edgeElement('a-b'))).toBe(before);
    });
  });
});
