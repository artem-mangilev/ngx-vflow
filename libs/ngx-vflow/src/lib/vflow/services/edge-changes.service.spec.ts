import { Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { EdgeChangesService } from './edge-changes.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { NodeRenderingService } from './node-rendering.service';
import { ViewportService } from './viewport.service';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { createNode } from '../interfaces/node.interface';
import { createEdge } from '../interfaces/edge.interface';
import { EdgeChange } from '../types/edge-change.type';
import { addNodesToEdges } from '../utils/add-nodes-to-edges';

describe('EdgeChangesService', () => {
  let service: EdgeChangesService;
  let entities: FlowEntitiesService;
  let nodes: NodeModel[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EdgeChangesService, FlowEntitiesService, FlowSettingsService, NodeRenderingService, ViewportService],
    });
    service = TestBed.inject(EdgeChangesService);
    entities = TestBed.inject(FlowEntitiesService);
    nodes = ['a', 'b', 'c'].map((id) =>
      TestBed.runInInjectionContext(() => new NodeModel(createNode({ id, point: { x: 0, y: 0 } }))),
    );
    entities.nodes.set(nodes);
  });

  /**
   * Runs the effects that read the signals and waits for the batch they deliver in a later task, a few times over:
   * observing a node starts effects of its own.
   */
  async function settle() {
    for (let i = 0; i < 3; i++) {
      TestBed.tick();
      await new Promise((resolve) => setTimeout(resolve));
      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  function edge(id: string, source: string, target: string) {
    const model = TestBed.runInInjectionContext(() => new EdgeModel(createEdge({ id, source, target })));
    addNodesToEdges(nodes, [model]);
    return model;
  }

  async function record(type: EdgeChange['type']) {
    const batches: EdgeChange[][] = [];
    (service.changesOfType(type) as Observable<EdgeChange[]>).subscribe((changes) => batches.push(changes));
    // The edges of the first read are not reported as added.
    await settle();
    return batches;
  }

  it('reports the edges added and removed in one tick as one array', async () => {
    const [ab, bc, ca] = [edge('a-b', 'a', 'b'), edge('b-c', 'b', 'c'), edge('c-a', 'c', 'a')];
    entities.edges.set([ab, bc]);
    const added = await record('add');
    const removed = await record('remove');

    entities.edges.set([bc, ca]);
    await settle();

    expect(added).toEqual([[{ type: 'add', id: 'c-a' }]]);
    expect(removed).toEqual([[{ type: 'remove', id: 'a-b' }]]);
  });

  it('reports a selection change of an edge, and only the edges that changed', async () => {
    const [ab, bc] = [edge('a-b', 'a', 'b'), edge('b-c', 'b', 'c')];
    entities.edges.set([ab, bc]);
    const selected = await record('select');

    bc.selected.set(true);
    await settle();
    bc.selected.set(true);
    await settle();

    expect(selected).toEqual([[{ type: 'select', id: 'b-c', selected: true }]]);
  });
  // Detached edges need measured handles; changes-outputs.spec.ts covers them in a flow.
});
