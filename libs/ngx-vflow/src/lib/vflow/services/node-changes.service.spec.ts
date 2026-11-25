import { TestBed } from '@angular/core/testing';

import { NodesChangeService } from './node-changes.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { NodeRenderingService } from './node-rendering.service';
import { ViewportService } from './viewport.service';
import { FlowRenderingService } from './flow-rendering.service';
import { NodeModel } from '../models/node.model';
import { createNode } from '../interfaces/node.interface';
import { NodeChange } from '../types/node-change.type';

describe('NodesChangeService', () => {
  let service: NodesChangeService;
  let entities: FlowEntitiesService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        NodesChangeService,
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        FlowRenderingService,
      ],
    });
    service = TestBed.inject(NodesChangeService);
    entities = TestBed.inject(FlowEntitiesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Runs the effects that read the signals, a few times over since observing a node starts effects of its own, and
   * lets the 25 ms delay of the batch pass.
   */
  async function settle() {
    for (let i = 0; i < 3; i++) {
      TestBed.tick();
      await vi.advanceTimersByTimeAsync(0);
    }
    await vi.advanceTimersByTimeAsync(25);
  }

  function node(id: string) {
    return TestBed.runInInjectionContext(() => new NodeModel(createNode({ id, point: { x: 0, y: 0 } })));
  }

  async function record(...nodes: NodeModel[]) {
    const batches: NodeChange[][] = [];
    service.changes$.subscribe((changes) => batches.push(changes));
    entities.nodes.set(nodes);
    await settle();
    batches.length = 0;
    return batches;
  }

  it('gives the same array to every listener', async () => {
    const a = node('a');
    const first = await record(a);
    const second: NodeChange[][] = [];
    service.changes$.subscribe((changes) => second.push(changes));

    a.point.set({ x: 10, y: 0 });
    await settle();

    expect(first).toEqual([[{ type: 'position', id: 'a', point: { x: 10, y: 0 } }]]);
    expect(second[0]).toBe(first[0]);
  });

  it('reports no position or selection when the application replaces a node', async () => {
    const batches = await record(node('a'));

    entities.nodes.set([node('b')]);
    await settle();

    expect(batches.flat().filter((change) => change.type !== 'size')).toEqual([]);
  });

  it('reports a measured size with both axes in auto mode', async () => {
    const model = node('1');
    const batches = await record(model);

    model.width.set(120);
    await settle();

    expect(batches.flat().at(-1)).toEqual({
      type: 'size',
      id: '1',
      size: { width: 120, height: 50 },
      mode: { width: 'auto', height: 'auto' },
    });
  });

  it('reports an explicit size with the mode of each axis', async () => {
    const model = node('1');
    const batches = await record(model);

    model.setExplicitSize({ height: 80 });
    await settle();

    expect(batches.flat().at(-1)).toEqual({
      type: 'size',
      id: '1',
      size: { width: 100, height: 80 },
      mode: { width: 'auto', height: 'explicit' },
    });
  });
});
