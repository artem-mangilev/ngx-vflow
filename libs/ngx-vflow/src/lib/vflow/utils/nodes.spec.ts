import { TestBed } from '@angular/core/testing';

import { createNode } from '../interfaces/node.interface';
import { NodeModel } from '../models/node.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowRenderingService } from '../services/flow-rendering.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { getIntersectingNodes, getNodesAtPoint, getNodesFlowBounds } from './nodes';

describe('nodes utils', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        FlowRenderingService,
      ],
    });
  });

  // A group at (100, 100) of 400x300, a child at (10, 10) of 80x40 inside it, and a node apart from both.
  function createGraph() {
    const model = (node: Parameters<typeof createNode>[0]) =>
      TestBed.runInInjectionContext(() => new NodeModel(createNode(node)));
    const group = model({ id: 'group', point: { x: 100, y: 100 }, width: 400, height: 300 });
    const child = model({ id: 'child', parentId: 'group', point: { x: 10, y: 10 }, width: 80, height: 40 });
    const apart = model({ id: 'apart', point: { x: 1000, y: 1000 }, width: 50, height: 50 });
    const nodes = [group, child, apart];
    TestBed.inject(FlowEntitiesService).nodes.set(nodes);

    return { group, child, apart, nodes };
  }

  describe('getNodesFlowBounds', () => {
    it('uses the global position of a nested node', () => {
      const { child } = createGraph();

      expect(getNodesFlowBounds([child])).toEqual({ x: 110, y: 110, width: 80, height: 40 });
    });

    it('is the union of the nodes', () => {
      const { group, apart } = createGraph();

      expect(getNodesFlowBounds([group, apart])).toEqual({ x: 100, y: 100, width: 950, height: 950 });
    });

    it('is empty without nodes', () => {
      expect(getNodesFlowBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });
  });

  describe('getNodesAtPoint', () => {
    it('returns every node that contains the point, a nested one with its parent', () => {
      const { group, child, nodes } = createGraph();

      expect(getNodesAtPoint({ x: 115, y: 115 }, nodes)).toEqual([group, child]);
    });

    it('returns a node whose border holds the point', () => {
      const { group, nodes } = createGraph();

      expect(getNodesAtPoint({ x: 100, y: 100 }, nodes)).toEqual([group]);
    });

    it('returns nothing for a point outside every node', () => {
      const { nodes } = createGraph();

      expect(getNodesAtPoint({ x: 99, y: 99 }, nodes)).toEqual([]);
    });
  });

  describe('getIntersectingNodes', () => {
    it('returns the nodes that overlap the node by any area', () => {
      const { group, nodes } = createGraph();

      expect(getIntersectingNodes('child', nodes, { partially: true })).toEqual([group]);
    });

    it('overlaps partially by default', () => {
      const { group, nodes } = createGraph();

      expect(getIntersectingNodes('child', nodes)).toEqual([group]);
    });

    it('returns only the nodes that cover the whole node when it is not partial', () => {
      const { group, nodes } = createGraph();

      expect(getIntersectingNodes('child', nodes, { partially: false })).toEqual([group]);
      expect(getIntersectingNodes('group', nodes, { partially: false })).toEqual([]);
    });

    it('does not return the node itself', () => {
      const { nodes } = createGraph();

      expect(getIntersectingNodes('apart', nodes).map((node) => node.rawNode.id)).toEqual([]);
    });

    it('returns nothing for an unknown id', () => {
      const { nodes } = createGraph();

      expect(getIntersectingNodes('missing', nodes)).toEqual([]);
    });
  });
});
