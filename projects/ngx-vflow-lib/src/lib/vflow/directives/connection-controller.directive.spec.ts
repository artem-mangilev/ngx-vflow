import { TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { ConnectionControllerDirective } from './connection-controller.directive';
import { ConnectionModel } from '../models/connection.model';
import { EdgeModel } from '../models/edge.model';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { createEdge } from '../interfaces/edge.interface';
import { createNode } from '../interfaces/node.interface';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { FlowStatusService } from '../services/flow-status.service';
import { NodeRenderingService } from '../services/node-rendering.service';
import { ViewportService } from '../services/viewport.service';

describe('ConnectionControllerDirective', () => {
  let flowEntitiesService: FlowEntitiesService;
  let statusService: FlowStatusService;
  let controller: ConnectionControllerDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlowEntitiesService,
        FlowSettingsService,
        FlowStatusService,
        NodeRenderingService,
        ViewportService,
        provideExperimentalZonelessChangeDetection(),
      ],
    });

    flowEntitiesService = TestBed.inject(FlowEntitiesService);
    statusService = TestBed.inject(FlowStatusService);
    controller = TestBed.runInInjectionContext(() => new ConnectionControllerDirective());
  });

  function createNodeModel(id: string) {
    return TestBed.runInInjectionContext(
      () =>
        new NodeModel(
          createNode({
            id,
            type: 'default',
            point: { x: 0, y: 0 },
          }),
        ),
    );
  }

  function createHandle(node: NodeModel, type: 'source' | 'target', canStart = true, canAccept = true) {
    return TestBed.runInInjectionContext(
      () =>
        new HandleModel(
          {
            type,
            position: type === 'source' ? 'right' : 'left',
            hostReference: document.createElement('div'),
            userOffsetX: 0,
            userOffsetY: 0,
            canStart: signal(canStart),
            canAccept: signal(canAccept),
          },
          node,
        ),
    );
  }

  it('delays connection and reconnection until the pointer crosses the configured threshold', () => {
    TestBed.inject(FlowSettingsService).connectionDragThreshold.set(10);
    const handle = createHandle(createNodeModel('source'), 'source');
    const down = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
    controller.startConnection(handle, down);
    expect(statusService.status().state).toBe('idle');
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 106, clientY: 100 }));
    expect(statusService.status().state).toBe('idle');
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 112, clientY: 100 }));
    expect(statusService.status().state).toBe('connection-start');
    statusService.setIdleStatus();
    const edge = TestBed.runInInjectionContext(
      () => new EdgeModel(createEdge({ id: 'edge', source: 'source', target: 'target' })),
    );
    controller.startReconnection(handle, edge, down);
    expect(statusService.status().state).toBe('idle');
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 112, clientY: 100 }));
    expect(statusService.status().state).toBe('reconnection-start');
  });

  it('uses the same client-space activation threshold for touch connections', () => {
    TestBed.inject(FlowSettingsService).connectionDragThreshold.set(10);
    const handle = createHandle(createNodeModel('source'), 'source');
    const touch = (x: number) => new Touch({ identifier: 0, target: document.body, clientX: x, clientY: 100 });
    controller.startConnection(handle, new TouchEvent('touchstart', { touches: [touch(100)] }));
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [touch(105)], cancelable: true }));
    expect(statusService.status().state).toBe('idle');
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [touch(112)], cancelable: true }));
    expect(statusService.status().state).toBe('connection-start');
  });

  it('cancels a pending connection on pointer release or window blur', () => {
    TestBed.inject(FlowSettingsService).connectionDragThreshold.set(10);
    const handle = createHandle(createNodeModel('source'), 'source');
    for (const cancel of ['mouseup', 'blur']) {
      controller.startConnection(handle, new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));
      (cancel === 'blur' ? window : document).dispatchEvent(new Event(cancel));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 100 }));
      expect(statusService.status().state).toBe('idle');
    }
  });

  it('should reject a new connection when its starting handle cannot start', () => {
    const source = createHandle(createNodeModel('source'), 'source', false);
    const connectStart = jasmine.createSpy('connectStart');
    const subscription = controller.connectStart.subscribe(connectStart);

    controller.startConnection(source);

    expect(statusService.status().state).toBe('idle');
    expect(connectStart).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should reject a connection candidate before calling the application validator', () => {
    const validator = jasmine.createSpy('validator').and.returnValue(true);
    flowEntitiesService.connection.set(new ConnectionModel({ mode: 'loose', validator }));

    const source = createHandle(createNodeModel('source'), 'source');
    const target = createHandle(createNodeModel('target'), 'target', true, false);

    controller.startConnection(source);
    controller.validateConnection(target);

    expect(target.state()).toBe('invalid');
    expect(statusService.status().state).toBe('connection-validation');
    expect(validator).not.toHaveBeenCalled();

    controller.endConnection();

    expect(statusService.status().state).toBe('connection-dropped');
    expect(validator).not.toHaveBeenCalled();
  });

  it('should allow reconnection to start from a retained handle without canStart and reject its candidate by canAccept', () => {
    const validator = jasmine.createSpy('validator').and.returnValue(true);
    flowEntitiesService.connection.set(new ConnectionModel({ mode: 'loose', validator }));

    const retained = createHandle(createNodeModel('source'), 'source', false);
    const candidate = createHandle(createNodeModel('target'), 'target', true, false);
    const oldEdge = TestBed.runInInjectionContext(
      () => new EdgeModel(createEdge({ id: 'old', source: 'source', target: 'target' })),
    );

    controller.startReconnection(retained, oldEdge);

    expect(statusService.status().state).toBe('reconnection-start');

    controller.validateConnection(candidate);
    controller.endConnection();

    expect(candidate.state()).toBe('invalid');
    expect(statusService.status().state).toBe('reconnection-dropped');
    expect(validator).not.toHaveBeenCalled();
  });
});
