import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createNode } from '../interfaces/node.interface';
import { NodeModel } from '../models/node.model';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { KeyboardService } from './keyboard.service';
import { NodeRenderingService } from './node-rendering.service';
import { SelectionService } from './selection.service';
import { ViewportService } from './viewport.service';

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
        provideExperimentalZonelessChangeDetection(),
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
            type: 'default',
            point: { x: 0, y: 0 },
            selectable,
          }),
        ),
    );
  }

  it('should ignore selection requests for an ineligible entity', () => {
    const node = createModel('node', false);
    entitiesService.nodes.set([node]);

    selectionService.select(node);

    expect(node.selected()).toBeFalse();
  });

  it('should allow deselection even when selection is disabled globally', () => {
    const node = createModel('node');
    entitiesService.nodes.set([node]);
    node.selected.set(true);
    settingsService.nodesSelectable.set(false);

    selectionService.select(null);

    expect(node.selected()).toBeFalse();
  });

  it('should clear an ineligible selected entity when replacing it with an eligible selection', () => {
    const ineligible = createModel('ineligible', false);
    const eligible = createModel('eligible');
    entitiesService.nodes.set([ineligible, eligible]);
    ineligible.selected.set(true);

    selectionService.select(eligible);

    expect(ineligible.selected()).toBeFalse();
    expect(eligible.selected()).toBeTrue();
  });

  it('should leave selection writes to the consumer in manual mode', () => {
    const node = createModel('node');
    entitiesService.nodes.set([node]);
    settingsService.selectionMode.set('manual');

    selectionService.select(node);

    expect(node.selected()).toBeFalse();
  });
});
