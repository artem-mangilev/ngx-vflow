import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createNode } from '../interfaces/node.interface';
import { NodeModel } from '../models/node.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { getNodesBounds, getNodesFlowBounds } from './nodes';

describe('nodes utils', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        NodeRenderingService,
        ViewportService,
        provideExperimentalZonelessChangeDetection(),
      ],
    });
  });

  it('getNodesFlowBounds uses global positions for nested nodes', () => {
    const entitiesService = TestBed.inject(FlowEntitiesService);

    const group = TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id: 'group',
            type: 'default-group',
            point: { x: 100, y: 100 },
            width: 400,
            height: 300,
          }),
        ),
    );

    const child = TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id: 'child',
            parentId: 'group',
            type: 'default',
            text: 'child',
            point: { x: 10, y: 10 },
            width: 80,
            height: 40,
          }),
        ),
    );

    entitiesService.nodes.set([group, child]);

    expect(getNodesBounds([child])).toEqual({
      x: 10,
      y: 10,
      width: 80,
      height: 40,
    });

    expect(getNodesFlowBounds([child])).toEqual({
      x: 110,
      y: 110,
      width: 80,
      height: 40,
    });
  });
});
