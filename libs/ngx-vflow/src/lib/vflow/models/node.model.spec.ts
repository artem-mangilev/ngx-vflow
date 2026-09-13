import { TestBed } from '@angular/core/testing';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ProbeNodeComponent {}

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
        provideZonelessChangeDetection(),
      ],
    });

    model = TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id: '1',

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

  describe('sizeMode', () => {
    const make = (node: Parameters<typeof createNode>[0]) =>
      TestBed.runInInjectionContext(() => new NodeModel(createNode(node, { useDefaults: false })));

    it('is auto for html and component nodes without application-provided size', () => {
      expect(make({ id: 'a', point: { x: 0, y: 0 } }).sizeMode()).toBe('auto');
    });

    it('is explicit when the application provides both width and height', () => {
      expect(make({ id: 'b', point: { x: 0, y: 0 }, width: 10, height: 20 }).sizeMode()).toBe('explicit');
      expect(make({ id: 'c', point: { x: 0, y: 0 }, width: 10 }).sizeMode()).toBe('auto');
    });

    it('does not become explicit because other nodes reference it as parent', () => {
      const parent = make({ id: 'd', point: { x: 0, y: 0 } });
      const child = make({ id: 'd-child', parentId: 'd', point: { x: 0, y: 0 } });
      entitiesService.nodes.update((nodes) => [...nodes, parent, child]);
      expect(parent.children()).toEqual([child]);
      expect(parent.sizeMode()).toBe('auto');
    });

    it('switches to explicit once the resizer commits and never switches back', () => {
      const auto = make({ id: 'e', point: { x: 0, y: 0 } });
      auto.resizedExplicitly.set(true);
      expect(auto.sizeMode()).toBe('explicit');
    });
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
          point: { x: 10, y: 10 },
        }),
      );

    entitiesService.nodes.update((nodes) => [...nodes, TestBed.runInInjectionContext(childModel)]);

    expect(model.children()[0].globalPoint()).toEqual({ x: 25, y: 25 });
  });

  it('should resolve selection and focus defaults reactively', () => {
    expect(model.selectable()).toBeTrue();
    expect(model.focusable()).toBeTrue();

    settingsService.nodesSelectable.set(false);
    settingsService.nodesFocusable.set(false);

    expect(model.selectable()).toBeFalse();
    expect(model.focusable()).toBeFalse();
  });

  it('should let explicit capability overrides win over global settings', () => {
    const rawNode = createNode({
      id: 'explicit',
      point: { x: 0, y: 0 },
      selectable: false,
      focusable: true,
    });
    const explicitModel = TestBed.runInInjectionContext(() => new NodeModel(rawNode));

    settingsService.nodesSelectable.set(true);
    settingsService.nodesFocusable.set(false);

    expect(explicitModel.selectable()).toBeFalse();
    expect(explicitModel.focusable()).toBeTrue();
  });

  it('should keep inherited capabilities absent when factories materialize defaults', () => {
    const created = createNode({ id: 'factory', point: { x: 0, y: 0 } });

    expect(created.selectable).toBeUndefined();
    expect(created.focusable).toBeUndefined();
    expect(created.parentId()).toBeNull();
  });

  it('exposes node data and model size to the presentation of every node', () => {
    const ctx = model.context.$implicit;
    expect(ctx.node).toBe(model.rawNode);
    expect(ctx.data()).toEqual({});
    model.width.set(240);
    model.height.set(120);
    expect(ctx.width()).toBe(240);
    expect(ctx.height()).toBe(120);
  });

  it('names a node as a group only while other nodes reference it as parent', () => {
    expect(model.ariaLabel()).toBe('Node 1');
    const child = TestBed.runInInjectionContext(
      () => new NodeModel(createNode({ id: '2', parentId: '1', point: { x: 0, y: 0 } })),
    );
    entitiesService.nodes.update((nodes) => [...nodes, child]);
    expect(model.ariaLabel()).toBe('Group 1');
    entitiesService.nodes.update((nodes) => nodes.filter((node) => node !== child));
    expect(model.ariaLabel()).toBe('Node 1');
  });

  it('loads a component class immediately and waits for the viewport with a lazy factory', () => {
    settingsService.optimization.update((optimization) => ({ ...optimization, lazyLoadTrigger: 'viewport' }));
    const make = (component: Parameters<typeof createNode>[0]['component']) =>
      TestBed.runInInjectionContext(
        () => new NodeModel(createNode({ id: 'c', component, point: { x: 5000, y: 5000 } })),
      );

    expect(make(ProbeNodeComponent).shouldLoad()).toBeTrue();
    expect(make(() => Promise.resolve(ProbeNodeComponent)).shouldLoad()).toBeFalse();
  });
});
