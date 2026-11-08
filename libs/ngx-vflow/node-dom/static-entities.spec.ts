import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StaticEdge, StaticNode, createEdges, createNodes, toStaticEdges, toStaticNodes } from 'ngx-vflow';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ProbeNode {}

describe('static nodes and edges', () => {
  afterEach(() => vi.restoreAllMocks());

  it('round-trips nodes through createNodes and back, keeping an unsized node unsized', () => {
    const nodes: StaticNode<{ title: string }>[] = [
      { id: 'stage', point: { x: 20, y: 20 }, width: 240, height: 160, data: { title: 'Stage' }, ariaLabel: 'Stage' },
      { id: 'draft', point: { x: 30, y: 40 }, parentId: 'stage', extent: null, data: { title: 'Draft' } },
      {
        id: 'task',
        point: { x: 300, y: 40 },
        component: 'task',
        data: { title: 'Task' },
        selected: true,
        draggable: false,
      },
    ];

    const statics = toStaticNodes(createNodes(nodes));

    expect(statics).toEqual([
      { ...nodes[0], draggable: true, parentId: null, extent: 'parent', selected: false },
      { ...nodes[1], draggable: true, selected: false },
      { ...nodes[2], parentId: null, extent: 'parent' },
    ]);
    expect(statics[1]).not.toHaveProperty('width');
    expect(JSON.parse(JSON.stringify(statics))).toEqual(statics);
    expect(toStaticNodes(createNodes(JSON.parse(JSON.stringify(statics))))).toEqual(statics);
  });

  it('round-trips edges with keys, built-in curves and markers', () => {
    const edges: StaticEdge<{ label: string }>[] = [
      { id: 'a-b', source: 'a', target: 'b', sourceHandle: 'out', curve: 'avoid', data: { label: 'reviews' } },
      {
        id: 'b-c',
        source: 'b',
        target: 'c',
        curve: 'smooth-step',
        markers: { end: { type: 'arrow' } },
        reconnectable: true,
      },
    ];

    const statics = toStaticEdges(createEdges(edges));

    expect(statics).toEqual([
      { ...edges[0], markers: {}, reconnectable: false, selected: false, interactionWidth: 20 },
      { ...edges[1], data: {}, selected: false, interactionWidth: 20 },
    ]);
    expect(toStaticEdges(createEdges(JSON.parse(JSON.stringify(statics))))).toEqual(statics);
  });

  it('keeps a class or a function in place and warns that JSON drops it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const curve = () => ({ path: '' });

    const [node] = toStaticNodes(createNodes([{ id: 'n', point: { x: 0, y: 0 }, component: ProbeNode }]));
    const [edge] = toStaticEdges(createEdges([{ id: 'e', source: 'n', target: 'n', curve, component: ProbeNode }]));

    expect(node.component).toBe(ProbeNode);
    expect(edge.curve).toBe(curve);
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining('Node "n" names its component as a class'),
      expect.stringContaining('Edge "e" names its component as a class'),
      expect.stringContaining('Edge "e" has a curve factory'),
    ]);
  });

  it('reads the signals without tracking, so an effect that snapshots the graph does not follow it', () => {
    const nodes = signal(createNodes([{ id: 'a', point: { x: 0, y: 0 } }]));
    let runs = 0;
    TestBed.runInInjectionContext(() =>
      effect(() => {
        toStaticNodes(nodes());
        runs++;
      }),
    );
    TestBed.flushEffects();
    expect(runs).toBe(1);

    nodes()[0].point.set({ x: 10, y: 10 });
    TestBed.flushEffects();
    expect(runs).toBe(1);

    nodes.set(createNodes([{ id: 'b', point: { x: 0, y: 0 } }]));
    TestBed.flushEffects();
    expect(runs).toBe(2);
  });
});
