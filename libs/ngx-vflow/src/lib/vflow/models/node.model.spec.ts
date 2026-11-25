import { TestBed } from '@angular/core/testing';
import { NodeModel } from './node.model';
import { Node, createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { FlowRenderingService } from '../services/flow-rendering.service';
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core';
import { Vflow } from '../vflow';
import { Point } from '../interfaces/point.interface';

describe('NodeModel', () => {
  let model: NodeModel;
  let entitiesService: FlowEntitiesService;
  let settingsService: FlowSettingsService;

  const make = (node: Parameters<typeof createNode>[0]) =>
    TestBed.runInInjectionContext(() => new NodeModel(createNode(node)));

  /** Adds a model of `node` to the graph. */
  const add = (node: Parameters<typeof createNode>[0]) => {
    const added = make(node);
    entitiesService.nodes.update((nodes) => [...nodes, added]);
    return added;
  };

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

    entitiesService = TestBed.inject(FlowEntitiesService);
    settingsService = TestBed.inject(FlowSettingsService);
    model = add({ id: '1', point: { x: 15, y: 15 } });
  });

  describe('size modes', () => {
    const modes = (model: NodeModel) => [model.widthMode(), model.heightMode()];

    it.each([
      ['no size', {}, ['auto', 'auto']],
      ['both sizes', { width: 10, height: 20 }, ['explicit', 'explicit']],
      ['only a width', { width: 10 }, ['explicit', 'auto']],
      ['only a height', { height: 10 }, ['auto', 'explicit']],
    ])('decides each axis by its own application signal, with %s', (_, size, expected) => {
      expect(modes(make({ id: 'a', point: { x: 0, y: 0 }, ...size }))).toEqual(expected);
    });

    it('does not become explicit because other nodes reference it as parent', () => {
      const parent = add({ id: 'd', point: { x: 0, y: 0 } });
      const child = add({ id: 'd-child', parentId: 'd', point: { x: 0, y: 0 } });

      expect(parent.children()).toEqual([child]);
      expect(modes(parent)).toEqual(['auto', 'auto']);
    });
  });

  it('starts from the explicit size of the application', () => {
    const sized = make({ id: 'a', point: { x: 0, y: 0 }, width: 100, height: 50 });

    expect([sized.width(), sized.height()]).toEqual([100, 50]);
  });

  it('follows a change of the explicit size of the application', () => {
    const sized = make({ id: 'a', point: { x: 0, y: 0 }, width: 100, height: 50 });

    sized.rawNode.width!.set(300);

    expect(sized.width()).toBe(300);
  });

  describe('signals added to the node object later', () => {
    const makeLate = (id: string) => {
      const node: Node = { id, point: signal({ x: 0, y: 0 }) };
      const late = TestBed.runInInjectionContext(() => new NodeModel(node));
      entitiesService.nodes.update((nodes) => [...nodes, late]);
      return { node, model: late };
    };
    const passNewArray = () => entitiesService.nodes.update((nodes) => [...nodes]);

    it('reads a size signal once the application passes a new array', () => {
      const { node, model } = makeLate('a');
      model.setExplicitSize({ width: 300 });

      node.width = signal(300);
      passNewArray();
      node.width.set(500);

      expect(model.explicitWidth()).toBe(500);
      expect(model.width()).toBe(500);
    });

    it('resizes into a size signal it has read', () => {
      const { node, model } = makeLate('a');
      node.width = signal(300);
      passNewArray();

      model.setExplicitSize({ width: 400 });

      expect(node.width()).toBe(400);
      expect(model.explicitWidth()).toBe(400);
    });

    it('keeps resizing into the model until the new array arrives', () => {
      const { node, model } = makeLate('b');
      // Read once, as a rendered flow does.
      expect(model.widthMode()).toBe('auto');

      node.width = signal(300);
      expect(model.widthMode()).toBe('auto');
      model.setExplicitSize({ width: 240 });
      expect(node.width()).toBe(300);
      expect(model.explicitWidth()).toBe(240);

      passNewArray();
      expect(model.explicitWidth()).toBe(300);
    });

    it('takes the selection from an application signal over the selection held by the model', () => {
      const { node, model } = makeLate('c');
      model.selected.set(true);

      node.selected = signal(false);
      passNewArray();

      expect(model.selected()).toBe(false);
      expect(model.context.$implicit.selected()).toBe(false);
    });

    it('selects into an application signal it has read', () => {
      const { node, model } = makeLate('c');
      node.selected = signal(false);
      passNewArray();

      model.selected.set(true);

      expect(node.selected()).toBe(true);
    });

    it('reads the capabilities, the extent and the data once the application passes a new array', () => {
      const { node, model } = makeLate('d');
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
      const { node, model } = makeLate('e');

      model.setExplicitSize({ width: 240, height: 120 });
      model.selected.set(true);

      expect(Object.keys(node)).toEqual(['id', 'point']);
    });
  });

  it('translates the node element to its point', () => {
    model.setPoint({ x: 10, y: 10 });

    expect(model.pointTransformCss()).toEqual('translate(10px, 10px)');
  });

  it('links a parent and its children', () => {
    const child = add({ id: '2', parentId: '1', point: { x: 10, y: 10 } });

    expect(model.children()).toEqual([child]);
    expect(child.parent()).toBe(model);
  });

  it('places a child relative to its parent', () => {
    const child = add({ id: '2', parentId: '1', point: { x: 10, y: 10 } });

    expect(child.globalPoint()).toEqual({ x: 25, y: 25 });
  });

  it.each([
    ['selectable', 'nodesSelectable'],
    ['focusable', 'nodesFocusable'],
  ] as const)('follows the %s default of the flow', (capability, setting) => {
    expect(model[capability]()).toBe(true);

    settingsService.bind({ [setting]: signal(false) });

    expect(model[capability]()).toBe(false);
  });

  it.each([
    ['selectable', 'nodesSelectable', false],
    ['focusable', 'nodesFocusable', true],
  ] as const)('lets the %s value of a node win over the flow default', (capability, setting, value) => {
    const explicit = make({ id: 'explicit', point: { x: 0, y: 0 }, [capability]: value });

    settingsService.bind({ [setting]: signal(!value) });

    expect(explicit[capability]()).toBe(value);
  });

  it('exposes node data and model size to the presentation of every node', () => {
    const ctx = model.context.$implicit;

    model.width.set(240);
    model.height.set(120);

    expect(ctx.node).toBe(model.rawNode);
    expect(ctx.data()).toEqual({});
    expect(ctx.width()).toBe(240);
    expect(ctx.height()).toBe(120);
  });

  it('describes a node with a child as a group, keeping its label', () => {
    add({ id: '2', parentId: '1', point: { x: 0, y: 0 } });

    expect(model.ariaLabel()).toBe('Node 1');
    expect(model.accessibility().roleDescription).toBe('group');
  });

  it('describes a node as a node again once its last child is removed', () => {
    const child = add({ id: '2', parentId: '1', point: { x: 0, y: 0 } });

    entitiesService.nodes.update((nodes) => nodes.filter((node) => node !== child));

    expect(model.accessibility().roleDescription).toBe('node');
  });
});

@Component({
  template: `<vflow style="width: 400px; height: 300px" [nodes]="nodes()" />`,
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FlowHostComponent {
  public readonly nodes = signal<Node[]>([]);
}

describe('NodeModel in a flow', () => {
  it('stops observing the point of a node removed from the graph', async () => {
    const point = signal<Point>({ x: 0, y: 0 });
    // The application signal is the boundary: the spy counts the reads of the flow.
    const read = vi.fn(() => point());
    const observedPoint = Object.assign(read, point) as unknown as WritableSignal<Point>;
    const fixture = TestBed.createComponent(FlowHostComponent);
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    fixture.componentInstance.nodes.set([{ id: 'removed', point: observedPoint }]);
    await settle();

    read.mockClear();
    point.set({ x: 1, y: 0 });
    await settle();
    expect(read).toHaveBeenCalled();

    fixture.componentInstance.nodes.set([]);
    await settle();
    read.mockClear();
    point.set({ x: 5, y: 0 });
    await settle();

    expect(read).not.toHaveBeenCalled();
  });
});
