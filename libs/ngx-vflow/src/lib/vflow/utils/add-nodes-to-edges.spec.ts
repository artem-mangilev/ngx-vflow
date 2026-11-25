import { TestBed } from '@angular/core/testing';
import { createEdge } from '../interfaces/edge.interface';
import { createNode } from '../interfaces/node.interface';
import { EdgeModel } from '../models/edge.model';
import { NodeModel } from '../models/node.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowRegistriesService } from '../services/flow-registries.service';
import { FlowRenderingService } from '../services/flow-rendering.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { addNodesToEdges } from './add-nodes-to-edges';

describe('addNodesToEdges', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        FlowRegistriesService,
        NodeRenderingService,
        ViewportService,
        FlowRenderingService,
      ],
    });
  });

  const nodeModel = (id: string) =>
    TestBed.runInInjectionContext(() => new NodeModel(createNode({ id, point: { x: 0, y: 0 } })));
  const edgeModel = (id: string, source: string, target: string) =>
    TestBed.runInInjectionContext(() => new EdgeModel(createEdge({ id, source, target })));

  it('links an edge to the models of its source and target nodes', () => {
    const a = nodeModel('a');
    const b = nodeModel('b');
    const edge = edgeModel('a-b', 'a', 'b');

    addNodesToEdges([a, b], [edge]);

    expect(edge.source()).toBe(a);
    expect(edge.target()).toBe(b);
  });

  it('links every edge, also several edges to one node', () => {
    const a = nodeModel('a');
    const b = nodeModel('b');
    const first = edgeModel('first', 'a', 'b');
    const second = edgeModel('second', 'b', 'a');

    addNodesToEdges([a, b], [first, second]);

    expect([first.source(), first.target(), second.source(), second.target()]).toEqual([a, b, b, a]);
  });

  it('leaves an endpoint that is not among the nodes empty', () => {
    const a = nodeModel('a');
    const edge = edgeModel('a-missing', 'a', 'missing');

    addNodesToEdges([a], [edge]);

    expect(edge.source()).toBe(a);
    expect(edge.target()).toBeNull();
  });

  it('clears an endpoint whose node left', () => {
    const a = nodeModel('a');
    const b = nodeModel('b');
    const edge = edgeModel('a-b', 'a', 'b');
    addNodesToEdges([a, b], [edge]);

    addNodesToEdges([a], [edge]);

    expect(edge.target()).toBeNull();
  });

  it('does nothing without edges', () => {
    expect(() => addNodesToEdges([nodeModel('a')], [])).not.toThrow();
  });
});
