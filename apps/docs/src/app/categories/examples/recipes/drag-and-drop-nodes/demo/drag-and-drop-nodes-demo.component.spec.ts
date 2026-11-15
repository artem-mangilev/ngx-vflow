import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NodeWithDefaults } from 'ngx-vflow';
import { DragAndDropNodesDemoComponent } from './drag-and-drop-nodes-demo.component';

type DemoNode = NodeWithDefaults<{ text: string; groupUnder?: string }>;

/** The members the template of the demo calls; the spec calls them in its place. */
interface DemoActions {
  nodes: Signal<DemoNode[]>;
  attach(node: DemoNode, groupId: string): void;
  detach(node: DemoNode): void;
}

describe('DragAndDropNodesDemoComponent', () => {
  it('detaches a node in place and offers to attach it again at once', async () => {
    await TestBed.configureTestingModule({ imports: [DragAndDropNodesDemoComponent] }).compileComponents();
    const demo = TestBed.createComponent(DragAndDropNodesDemoComponent).componentInstance as unknown as DemoActions;
    const [cluster, api] = demo.nodes();
    // Away from the origin, the space of the group differs from the space of the flow.
    cluster.point.set({ x: 100, y: 100 });

    demo.detach(api);

    expect(demo.nodes()[1]).toBe(api);
    expect(api.parentId()).toBeNull();
    expect(api.point()).toEqual({ x: 140, y: 200 });
    expect(api.data().groupUnder).toBe(cluster.id);

    demo.attach(api, cluster.id);

    expect(demo.nodes()[1]).toBe(api);
    expect(api.parentId()).toBe(cluster.id);
    expect(api.point()).toEqual({ x: 40, y: 100 });
  });
});
