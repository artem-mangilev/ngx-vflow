import { TestBed } from '@angular/core/testing';

import { NodesChangeService } from './node-changes.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { NodeRenderingService } from './node-rendering.service';
import { ViewportService } from './viewport.service';
import { NodeModel } from '../models/node.model';
import { createNode } from '../interfaces/node.interface';
import { NodeChange } from '../types/node-change.type';

describe('NodesChangeService', () => {
  let service: NodesChangeService;
  let entities: FlowEntitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NodesChangeService, FlowEntitiesService, FlowSettingsService, NodeRenderingService, ViewportService],
    });
    service = TestBed.inject(NodesChangeService);
    entities = TestBed.inject(FlowEntitiesService);
  });

  const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

  function node(id: string) {
    return TestBed.runInInjectionContext(() => new NodeModel(createNode({ id, point: { x: 0, y: 0 } })));
  }

  it('delivers the changes of one tick as one array', async () => {
    const [a, b] = [node('a'), node('b')];
    const batches: NodeChange[][] = [];
    const positions: NodeChange[][] = [];
    service.changes$.subscribe((changes) => batches.push(changes));
    service.changesOfType('position').subscribe((changes) => positions.push(changes));
    entities.nodes.set([a, b]);
    await settle();
    batches.length = positions.length = 0;

    a.point.set({ x: 10, y: 0 });
    b.point.set({ x: 20, y: 0 });
    a.selected.set(true);
    await settle();

    expect(batches.length).toBe(1);
    expect(batches[0]).toHaveLength(3);
    expect(batches[0]).toEqual(
      expect.arrayContaining([
        { type: 'position', id: 'a', point: { x: 10, y: 0 } },
        { type: 'position', id: 'b', point: { x: 20, y: 0 } },
        { type: 'select', id: 'a', selected: true },
      ]),
    );
    expect(positions).toEqual([
      [
        { type: 'position', id: 'a', point: { x: 10, y: 0 } },
        { type: 'position', id: 'b', point: { x: 20, y: 0 } },
      ],
    ]);

    b.point.set({ x: 30, y: 0 });
    await settle();
    expect(batches.length).toBe(2);
    expect(batches[1]).toEqual([{ type: 'position', id: 'b', point: { x: 30, y: 0 } }]);
  });

  it('gives the same array to every listener', async () => {
    const a = node('a');
    const first: NodeChange[][] = [];
    const second: NodeChange[][] = [];
    service.changes$.subscribe((changes) => first.push(changes));
    service.changes$.subscribe((changes) => second.push(changes));
    // The nodes of the first read are not reported as added.
    await settle();
    entities.nodes.set([a]);
    await settle();

    expect(first).toEqual([[{ type: 'add', id: 'a' }]]);
    expect(second[0]).toBe(first[0]);
  });

  it('observes no node for a listener of added and removed nodes only', async () => {
    const observables = (model: NodeModel) => (model as unknown as { observables: Map<string, unknown> }).observables;
    const a = node('a');
    const added: NodeChange[][] = [];
    service.changesOfType('add').subscribe((changes) => added.push(changes));
    service.changesOfType('remove').subscribe();
    await settle();
    entities.nodes.set([a]);
    await settle();

    expect(added).toEqual([[{ type: 'add', id: 'a' }]]);
    expect(observables(a).size).toBe(0);

    service.changes$.subscribe();
    await settle();
    expect(observables(a).size).toBeGreaterThan(0);
  });

  it('reports the mode of each axis with every size change', async () => {
    const model = TestBed.runInInjectionContext(() => new NodeModel(createNode({ id: '1', point: { x: 0, y: 0 } })));
    const changes: NodeChange[] = [];
    service.changes$.subscribe((c) => changes.push(...c));
    entities.nodes.set([model]);
    await settle();

    model.width.set(120);
    await settle();
    expect(changes.at(-1)).toEqual({
      type: 'size',
      id: '1',
      size: { width: 120, height: 50 },
      mode: { width: 'auto', height: 'auto' },
    });

    model.setExplicitSize({ height: 80 });
    await settle();
    expect(changes.at(-1)).toEqual({
      type: 'size',
      id: '1',
      size: { width: 120, height: 80 },
      mode: { width: 'auto', height: 'explicit' },
    });
  });
});
