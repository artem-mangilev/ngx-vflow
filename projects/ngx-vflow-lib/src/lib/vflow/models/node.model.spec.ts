import { TestBed } from '@angular/core/testing';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('NodeModel', () => {
  let model: NodeModel;
  let entitiesService: FlowEntitiesService;
  let settingsService: FlowSettingsService;

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

    model = TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id: '1',
            type: 'default',
            text: 'test',
            point: { x: 15, y: 15 },
          }),
        ),
    );

    entitiesService = TestBed.inject(FlowEntitiesService);
    settingsService = TestBed.inject(FlowSettingsService);

    entitiesService.nodes.update((nodes) => [...nodes, model]);
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  it('should set/get point', () => {
    model.setPoint({ x: 10, y: 10 });
    expect(model.point()).toEqual({ x: 10, y: 10 });
  });

  it('should create correct translate function from point', () => {
    model.setPoint({ x: 10, y: 10 });
    expect(model.pointTransform()).toEqual('translate(10, 10)');
  });

  it('should create correct parent/children links', () => {
    const childModel = () =>
      new NodeModel(
        createNode({
          id: '2',
          parentId: '1',
          type: 'default',
          point: { x: 10, y: 10 },
        }),
      );

    entitiesService.nodes.update((nodes) => [...nodes, TestBed.runInInjectionContext(childModel)]);

    expect(model.children().length).toEqual(1);
    // check if children of model is correct
    expect(model.children()[0].rawNode.id).toEqual('2');
    // check if parent of child is also set correctly
    expect(model.children()[0].parent()?.rawNode.id).toEqual('1');
  });

  it('should return correct global point', () => {
    const childModel = () =>
      new NodeModel(
        createNode({
          id: '2',
          parentId: '1',
          type: 'default',
          point: { x: 10, y: 10 },
        }),
      );

    entitiesService.nodes.update((nodes) => [...nodes, TestBed.runInInjectionContext(childModel)]);

    expect(model.children()[0].globalPoint()).toEqual({ x: 25, y: 25 });
  });

  it('should get text for default node', () => {
    expect(model.text()).toEqual('test');
  });

  it('should resolve default capabilities and inherit reactive global settings', () => {
    expect(model.selectable()).toBeTrue();
    expect(model.deletable()).toBeTrue();
    expect(model.focusable()).toBeTrue();

    settingsService.nodesSelectable.set(false);
    settingsService.nodesFocusable.set(false);

    expect(model.selectable()).toBeFalse();
    expect(model.focusable()).toBeFalse();
    expect(model.deletable()).toBeTrue();
  });

  it('should let explicit capability overrides win over global settings', () => {
    const rawNode = createNode({
      id: 'explicit',
      type: 'default',
      point: { x: 0, y: 0 },
      selectable: false,
      deletable: false,
      focusable: true,
    });
    const explicitModel = TestBed.runInInjectionContext(() => new NodeModel(rawNode));

    settingsService.nodesSelectable.set(true);
    settingsService.nodesFocusable.set(false);

    expect(explicitModel.selectable()).toBeFalse();
    expect(explicitModel.deletable()).toBeFalse();
    expect(explicitModel.focusable()).toBeTrue();
  });

  it('should keep inherited capabilities absent when factories materialize defaults', () => {
    const created = createNode({ id: 'factory', type: 'default', point: { x: 0, y: 0 } });

    expect(created.selectable).toBeUndefined();
    expect(created.deletable).toBeUndefined();
    expect(created.focusable).toBeUndefined();
  });
});
