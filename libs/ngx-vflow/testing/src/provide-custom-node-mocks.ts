import { Provider, signal } from '@angular/core';
import {
  ɵNodeModel as NodeModel,
  ɵComponentEventBusService as ComponentEventBusService,
  ɵHandleService as HandleService,
  ɵFlowSettingsService as FlowSettingsService,
  ɵFlowStatusService as FlowStatusService,
  ɵFlowEntitiesService as FlowEntitiesService,
  ɵNodeAccessorService as NodeAccessorService,
  ɵRootPointerDirective as RootPointerDirective,
  ɵSpacePointContextDirective as SpacePointContextDirective,
  ɵViewportService as ViewportService,
  ɵSelectionService as SelectionService,
  ɵNodeRenderingService as NodeRenderingService,
  NODE_REF,
  Point,
} from 'ngx-vflow';
import { of } from 'rxjs';

const mockModel = () => new NodeModel({ id: 'mock', point: signal({ x: 0, y: 0 }), parentId: signal(null) });

export function provideCustomNodeMocks(): Provider[] {
  return [
    {
      provide: ComponentEventBusService,
      useValue: {
        pushNodeEvent: () => {},
        pushEdgeEvent: () => {},
      },
    },
    {
      provide: NodeAccessorService,
      useFactory: () => ({
        model: signal(mockModel()),
      }),
    },
    {
      provide: NODE_REF,
      useFactory: () => mockModel().context.$implicit,
    },
    FlowEntitiesService,

    // TODO: mocks below should be removed after the major release
    {
      provide: HandleService,
      useFactory: () => ({
        node: signal(mockModel()),
        createHandle: () => {},
        destroyHandle: () => {},
      }),
    },
    {
      provide: RootPointerDirective,
      useValue: {
        pointerMovement$: of({
          x: 0,
          y: 0,
          movementX: 0,
          movementY: 0,
          target: null,
          originalEvent: null,
        }),
        documentPointerEnd$: of(null),
      },
    },
    {
      provide: SpacePointContextDirective,
      useValue: {
        clientToFlowPosition: (point: Point) => point,
        flowToClientPosition: (point: Point) => point,
      },
    },
    {
      provide: SelectionService,
      useValue: {
        select: () => {},
      },
    },
    FlowSettingsService,
    // The handle directive reads the connection state to act as a drop zone.
    FlowStatusService,
    ViewportService,
    NodeRenderingService,
  ];
}
