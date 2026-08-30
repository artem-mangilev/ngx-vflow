import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Node } from 'ngx-vflow';
import { DragAndDropNodesDemoComponent } from './drag-and-drop-nodes-demo.component';

describe('DragAndDropNodesDemoComponent', () => {
  it('detaches a node in place and immediately exposes attach', async () => {
    await TestBed.configureTestingModule({
      imports: [DragAndDropNodesDemoComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();
    const component = TestBed.createComponent(DragAndDropNodesDemoComponent).componentInstance;
    const parent: Node = {
      id: 'parent',
      type: 'default-group',
      point: signal({ x: 100, y: 100 }),
      width: signal(250),
      height: signal(250),
    };
    const child = {
      id: 'child',
      type: 'html-template' as const,
      point: signal({ x: 10, y: 20 }),
      parentId: signal<string | null>('parent'),
      data: signal({ canDetach: true, canAttach: false }),
    };
    component.nodes = [parent, child];
    component.vflow = (() => ({
      getIntersectingNodes: () => [parent],
    })) as unknown as typeof component.vflow;

    component.detachNode(child.id);

    expect(component.nodes[1]).toBe(child);
    expect(child.parentId()).toBeNull();
    expect(child.point()).toEqual({ x: 110, y: 120 });
    expect(child.data()).toEqual({ canDetach: false, canAttach: true });

    component.attachNode(child.id);

    expect(component.nodes[1]).toBe(child);
    expect(child.parentId()).toBe(parent.id);
    expect(child.point()).toEqual({ x: 10, y: 20 });
    expect(child.data()).toEqual({ canDetach: true, canAttach: false });
  });
});
