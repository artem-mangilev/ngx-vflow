import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { DraggableService } from './draggable.service';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { FlowStatusService } from './flow-status.service';
import { ViewportService } from './viewport.service';
import { NodeRenderingService } from './node-rendering.service';
import { NodeModel } from '../models/node.model';
import { createNode } from '../interfaces/node.interface';
import { KeyboardService } from './keyboard.service';

describe('DraggableService', () => {
  let service: DraggableService;
  let entitiesService: FlowEntitiesService;
  const keyboardServiceMock = {
    selectionActive: false,
    isActiveAction(action: 'selection' | 'multiSelection') {
      return action === 'selection' ? this.selectionActive : false;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DraggableService,
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        ViewportService,
        NodeRenderingService,
        {
          provide: KeyboardService,
          useValue: keyboardServiceMock,
        },
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    service = TestBed.inject(DraggableService);
    entitiesService = TestBed.inject(FlowEntitiesService);
    keyboardServiceMock.selectionActive = false;
  });

  function createModel(params: {
    id: string;
    type?: 'default' | 'default-group';
    selected?: boolean;
    draggable?: boolean;
    parentId?: string;
  }) {
    const type = params.type ?? 'default';
    const nodeConfig: any = {
      id: params.id,
      type,
      point: { x: 0, y: 0 },
      selected: params.selected ?? false,
      draggable: params.draggable ?? true,
      parentId: params.parentId,
    };

    if (type === 'default') {
      nodeConfig.text = params.id;
    }

    const model = TestBed.runInInjectionContext(() => new NodeModel(createNode(nodeConfig)));

    entitiesService.nodes.update((nodes) => [...nodes, model]);

    return model;
  }

  it('should not include selected child when selected parent is dragged', () => {
    const parent = createModel({ id: 'parent', selected: true });
    const child = createModel({ id: 'child', selected: true, parentId: 'parent' });

    const dragNodes = (service as any).getDragNodes(child) as NodeModel[];

    expect(dragNodes).toEqual([parent]);
  });

  it('should include selected child when parent is not selected', () => {
    createModel({ id: 'parent', selected: false });
    const child = createModel({ id: 'child', selected: true, parentId: 'parent' });

    const dragNodes = (service as any).getDragNodes(child) as NodeModel[];

    expect(dragNodes).toEqual([child]);
  });

  it('should keep only top selected ancestor in deep hierarchy', () => {
    const grandParent = createModel({ id: 'grand-parent', selected: true });
    createModel({ id: 'parent', selected: true, parentId: 'grand-parent' });
    const child = createModel({ id: 'child', selected: true, parentId: 'parent' });
    const standalone = createModel({ id: 'standalone', selected: true });

    const dragNodes = (service as any).getDragNodes(child) as NodeModel[];

    expect(dragNodes).toEqual([grandParent, standalone]);
  });

  it('should keep normal multi-select behavior for unrelated nodes', () => {
    const nodeA = createModel({ id: 'node-a', selected: true });
    const nodeB = createModel({ id: 'node-b', selected: true });

    const dragNodes = (service as any).getDragNodes(nodeA) as NodeModel[];

    expect(dragNodes).toEqual([nodeA, nodeB]);
  });

  it('should block group drag when selection shortcut is active', () => {
    const group = createModel({ id: 'group', type: 'default-group' });
    const dragFilter = (service as any).getDragBehavior(group).filter();
    const target = document.createElement('div');

    keyboardServiceMock.selectionActive = true;

    expect(dragFilter({ target } as unknown as Event)).toBe(false);
  });

  it('should keep regular node drag available when selection shortcut is active', () => {
    const node = createModel({ id: 'node' });
    const dragFilter = (service as any).getDragBehavior(node).filter();
    const target = document.createElement('div');

    keyboardServiceMock.selectionActive = true;

    expect(dragFilter({ target } as unknown as Event)).toBe(true);
  });
});
