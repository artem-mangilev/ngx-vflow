import { TestBed } from '@angular/core/testing';
import { EdgeModel } from './edge.model';
import { NodeModel } from './node.model';
import { createNode } from '../interfaces/node.interface';
import { createEdge } from '../interfaces/edge.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { HandleModel } from './handle.model';
import { FlowSettingsService } from '../services/flow-settings.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

function mockRect(element: Element, rect: { left: number; top: number; width: number; height: number }): void {
  const { left, top, width, height } = rect;

  element.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
}

function createHandle(
  type: 'source' | 'target',
  position: 'left' | 'right',
  parentNode: NodeModel,
  nodeRect: { left: number; top: number; width: number; height: number },
  handleRect: { left: number; top: number; width: number; height: number },
) {
  const anchor = document.createElement('div');
  const nodeElement = document.createElement('div');
  const handleElement = document.createElement('div');

  mockRect(anchor, nodeRect);
  mockRect(nodeElement, nodeRect);
  mockRect(handleElement, handleRect);

  parentNode.nodeElement.set(nodeElement);

  const handle = TestBed.runInInjectionContext(
    () =>
      new HandleModel(
        {
          type,
          position,
          hostReference: anchor,
          userOffsetX: 0,
          userOffsetY: 0,
        },
        parentNode,
      ),
  );

  handle.handleElement = handleElement;
  handle.sync();

  return handle;
}

describe('EdgeModel', () => {
  let model: EdgeModel;
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

    settingsService = TestBed.inject(FlowSettingsService);

    model = TestBed.runInInjectionContext(
      () =>
        new EdgeModel(
          createEdge({
            id: '1 -> 2',
            source: '1',
            target: '2',
            curve: 'straight',
          }),
        ),
    );

    model.source.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel(
            createNode({
              id: '1',
              type: 'default',
              text: 'test',
              point: { x: 15, y: 15 },
              width: 0,
              height: 0,
            }),
          ),
      ),
    );
    model.target.set(
      TestBed.runInInjectionContext(
        () =>
          new NodeModel(
            createNode({
              id: '2',
              type: 'default',
              text: 'test',
              point: { x: 15, y: 15 },
              width: 0,
              height: 0,
            }),
          ),
      ),
    );

    const nodeRect = { left: 100, top: 200, width: 0, height: 0 };

    model.source()!.handles.set([
      createHandle('source', 'right', model.source()!, nodeRect, {
        left: 86.5,
        top: 193,
        width: 14,
        height: 14,
      }),
    ]);

    model.target()!.handles.set([
      createHandle('target', 'left', model.target()!, nodeRect, {
        left: 99.5,
        top: 193,
        width: 14,
        height: 14,
      }),
    ]);
  });

  it('should create', () => {
    expect(model).toBeTruthy();
  });

  /**
   * @todo add more path tests
   */
  it('should provide path', () => {
    expect(model.path().path).toBe('M 22,15L 8,15');
  });

  it('should set detached === true if there no source', () => {
    model.source.set(undefined);
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no target', () => {
    model.target.set(undefined);
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no source handle', () => {
    model.source()?.handles().pop();
    expect(model.detached()).toEqual(true);
  });

  it('should detached === true if there no target handle', () => {
    model.target()?.handles().pop();
    expect(model.detached()).toEqual(true);
  });

  it('should detached === false if source and target exists and their source and target handle also exists', () => {
    expect(model.detached()).toEqual(false);
  });

  it('should resolve default capabilities and inherit reactive global settings', () => {
    expect(model.selectable()).toBeTrue();
    expect(model.deletable()).toBeTrue();
    expect(model.focusable()).toBeTrue();

    settingsService.edgesSelectable.set(false);
    settingsService.edgesFocusable.set(false);

    expect(model.selectable()).toBeFalse();
    expect(model.focusable()).toBeFalse();
    expect(model.deletable()).toBeTrue();
  });

  it('should let explicit capability overrides win over global settings', () => {
    const explicitModel = TestBed.runInInjectionContext(
      () =>
        new EdgeModel(
          createEdge({
            id: 'explicit',
            source: '1',
            target: '2',
            selectable: false,
            deletable: false,
            focusable: true,
          }),
        ),
    );

    settingsService.edgesSelectable.set(true);
    settingsService.edgesFocusable.set(false);

    expect(explicitModel.selectable()).toBeFalse();
    expect(explicitModel.deletable()).toBeFalse();
    expect(explicitModel.focusable()).toBeTrue();
  });

  it('should keep inherited capabilities absent when factories materialize defaults', () => {
    const created = createEdge({ id: 'factory', source: '1', target: '2' });

    expect(created.selectable).toBeUndefined();
    expect(created.deletable).toBeUndefined();
    expect(created.focusable).toBeUndefined();
  });
});
