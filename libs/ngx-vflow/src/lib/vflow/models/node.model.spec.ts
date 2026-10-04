import { TestBed } from '@angular/core/testing';
import { NodeModel } from './node.model';
import { Node, createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class ProbeNodeComponent {}

describe('NodeModel', () => {
  let model: NodeModel;
  let entitiesService: FlowEntitiesService;
  let settingsService: FlowSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlowEntitiesService, FlowSettingsService, NodeRenderingService, ViewportService],
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

  describe('size modes', () => {
    const make = (node: Parameters<typeof createNode>[0]) =>
      TestBed.runInInjectionContext(() => new NodeModel(createNode(node)));
    const modes = (model: NodeModel) => [model.widthMode(), model.heightMode()];

    it('is auto on both axes for nodes without application-provided size', () => {
      expect(modes(make({ id: 'a', point: { x: 0, y: 0 } }))).toEqual(['auto', 'auto']);
    });

    it('decides each axis by its own application signal', () => {
      expect(modes(make({ id: 'b', point: { x: 0, y: 0 }, width: 10, height: 20 }))).toEqual(['explicit', 'explicit']);
      expect(modes(make({ id: 'c', point: { x: 0, y: 0 }, width: 10 }))).toEqual(['explicit', 'auto']);
      expect(modes(make({ id: 'c2', point: { x: 0, y: 0 }, height: 10 }))).toEqual(['auto', 'explicit']);
    });

    it('does not become explicit because other nodes reference it as parent', () => {
      const parent = make({ id: 'd', point: { x: 0, y: 0 } });
      const child = make({ id: 'd-child', parentId: 'd', point: { x: 0, y: 0 } });
      entitiesService.nodes.update((nodes) => [...nodes, parent, child]);
      expect(parent.children()).toEqual([child]);
      expect(modes(parent)).toEqual(['auto', 'auto']);
    });

    it('makes only the resized axis explicit when the application has no signal', () => {
      const auto = make({ id: 'e', point: { x: 0, y: 0 } });
      auto.setExplicitSize({ width: 240 });
      expect(modes(auto)).toEqual(['explicit', 'auto']);
      expect(auto.explicitWidth()).toBe(240);
      expect(auto.rawNode.width).toBeUndefined();
    });

    it('writes a resized axis into the application signal when there is one', () => {
      const sized = make({ id: 'f', point: { x: 0, y: 0 }, width: 100, height: 50 });
      sized.setExplicitSize({ width: 180, height: 90 });
      expect(sized.rawNode.width!()).toBe(180);
      expect(sized.rawNode.height!()).toBe(90);
    });
  });

  describe('rendered size', () => {
    const make = (node: Parameters<typeof createNode>[0]) =>
      TestBed.runInInjectionContext(() => new NodeModel(createNode(node)));

    it('starts from the explicit size and follows it', () => {
      const sized = make({ id: 'a', point: { x: 0, y: 0 }, width: 100, height: 50 });
      expect([sized.width(), sized.height()]).toEqual([100, 50]);

      sized.rawNode.width!.set(300);
      expect(sized.width()).toBe(300);
    });

    it('does not write measurement into the application signals', () => {
      const sized = make({ id: 'b', point: { x: 0, y: 0 }, width: 100, height: 50 });
      // CSS min-width clamped the rendered box.
      sized.width.set(140);
      expect(sized.width()).toBe(140);
      expect(sized.rawNode.width!()).toBe(100);
      expect(sized.explicitWidth()).toBe(100);
    });
  });

  describe('signals added to the node object later', () => {
    const make = (id: string) => {
      const node: Node = { id, point: signal({ x: 0, y: 0 }) };
      const model = TestBed.runInInjectionContext(() => new NodeModel(node));
      entitiesService.nodes.update((nodes) => [...nodes, model]);
      return { node, model };
    };
    const passNewArray = () => entitiesService.nodes.update((nodes) => [...nodes]);

    it('reads a size signal once the application passes a new array, and resizes into it', () => {
      const { node, model } = make('a');
      model.setExplicitSize({ width: 300 });
      expect(model.explicitWidth()).toBe(300);

      node.width = signal(300);
      passNewArray();
      node.width.set(500);
      expect(model.explicitWidth()).toBe(500);
      expect(model.width()).toBe(500);

      model.setExplicitSize({ width: 400 });
      expect(node.width()).toBe(400);
      expect(model.explicitWidth()).toBe(400);
    });

    it('keeps resizing into the model until the new array arrives', () => {
      const { node, model } = make('b');
      expect(model.widthMode()).toBe('auto');

      node.width = signal(300);
      expect(model.widthMode()).toBe('auto');
      model.setExplicitSize({ width: 240 });
      expect(node.width()).toBe(300);
      expect(model.explicitWidth()).toBe(240);

      passNewArray();
      expect(model.explicitWidth()).toBe(300);
    });

    it('selects through the application signal, which wins over the selection held by the model', () => {
      const { node, model } = make('c');
      model.selected.set(true);
      expect(model.selected()).toBe(true);

      node.selected = signal(false);
      passNewArray();
      expect(model.selected()).toBe(false);
      expect(model.context.$implicit.selected()).toBe(false);

      model.selected.set(true);
      expect(node.selected()).toBe(true);
    });

    it('reads the capabilities, the extent and the data', () => {
      const { node, model } = make('d');
      expect([model.draggable(), model.extent(), model.selectable(), model.focusable()]).toEqual([
        true,
        'parent',
        true,
        true,
      ]);
      expect(model.context.$implicit.data()).toEqual({});

      node.draggable = signal(false);
      node.extent = signal(null);
      node.selectable = signal(false);
      node.focusable = signal(false);
      node.data = signal({ title: 'Late' });
      passNewArray();

      expect([model.draggable(), model.extent(), model.selectable(), model.focusable()]).toEqual([
        false,
        null,
        false,
        false,
      ]);
      expect(model.context.$implicit.data()).toEqual({ title: 'Late' });
    });

    it('adds no signals to the application object on resize and selection', () => {
      const { node, model } = make('e');
      model.setExplicitSize({ width: 240, height: 120 });
      model.selected.set(true);
      expect(Object.keys(node)).toEqual(['id', 'point']);
    });
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
    expect(model.selectable()).toBe(true);
    expect(model.focusable()).toBe(true);

    settingsService.nodesSelectable.set(false);
    settingsService.nodesFocusable.set(false);

    expect(model.selectable()).toBe(false);
    expect(model.focusable()).toBe(false);
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

    expect(explicitModel.selectable()).toBe(false);
    expect(explicitModel.focusable()).toBe(true);
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

  it('describes a node as a group only while other nodes reference it as parent', () => {
    expect(model.ariaLabel()).toBe('Node 1');
    expect(model.accessibility().roleDescription).toBe('node');
    const child = TestBed.runInInjectionContext(
      () => new NodeModel(createNode({ id: '2', parentId: '1', point: { x: 0, y: 0 } })),
    );
    entitiesService.nodes.update((nodes) => [...nodes, child]);
    expect(model.ariaLabel()).toBe('Node 1');
    expect(model.accessibility().roleDescription).toBe('group');
    entitiesService.nodes.update((nodes) => nodes.filter((node) => node !== child));
    expect(model.accessibility().roleDescription).toBe('node');
  });

  it('loads a component class immediately and waits for the viewport with a lazy factory', () => {
    settingsService.optimization.update((optimization) => ({ ...optimization, lazyLoadTrigger: 'viewport' }));
    const make = (component: Parameters<typeof createNode>[0]['component']) =>
      TestBed.runInInjectionContext(
        () => new NodeModel(createNode({ id: 'c', component, point: { x: 5000, y: 5000 } })),
      );

    expect(make(ProbeNodeComponent).shouldLoad()).toBe(true);
    expect(make(() => Promise.resolve(ProbeNodeComponent)).shouldLoad()).toBe(false);
  });
});
