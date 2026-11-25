import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { createNode } from '../interfaces/node.interface';
import { NodeModel } from '../models/node.model';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { KeyboardService } from './keyboard.service';
import { NodeRenderingService } from './node-rendering.service';
import { SelectionService } from './selection.service';
import { ViewportService } from './viewport.service';
import { FlowRenderingService } from './flow-rendering.service';

describe('SelectionService', () => {
  let entitiesService: FlowEntitiesService;
  let settingsService: FlowSettingsService;
  let selectionService: SelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        KeyboardService,
        NodeRenderingService,
        SelectionService,
        ViewportService,
        FlowRenderingService,
      ],
    });

    entitiesService = TestBed.inject(FlowEntitiesService);
    settingsService = TestBed.inject(FlowSettingsService);
    selectionService = TestBed.inject(SelectionService);
  });

  function createModel(id: string, selectable?: boolean) {
    return TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id,
            point: { x: 0, y: 0 },
            selectable,
          }),
        ),
    );
  }

  it('deselects even when selection is disabled globally', () => {
    const node = createModel('node');
    entitiesService.nodes.set([node]);
    node.selected.set(true);
    settingsService.bind({ nodesSelectable: signal(false) });

    selectionService.select(null);

    expect(node.selected()).toBe(false);
  });

  it('clears a selected ineligible entity when an eligible one is selected', () => {
    const ineligible = createModel('ineligible', false);
    const eligible = createModel('eligible');
    entitiesService.nodes.set([ineligible, eligible]);
    ineligible.selected.set(true);

    selectionService.select(eligible);

    expect(ineligible.selected()).toBe(false);
    expect(eligible.selected()).toBe(true);
  });

  it('leaves selection to the application in manual mode', () => {
    const node = createModel('node');
    entitiesService.nodes.set([node]);
    settingsService.bind({ selectionMode: signal('manual') });

    selectionService.select(node);

    expect(node.selected()).toBe(false);
  });
});
