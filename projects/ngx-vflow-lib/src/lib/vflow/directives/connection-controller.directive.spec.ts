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
