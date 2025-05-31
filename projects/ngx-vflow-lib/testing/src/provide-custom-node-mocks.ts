import { Provider, signal } from '@angular/core';
import {
  ɵNodeModel as NodeModel,
  ɵComponentEventBusService as ComponentEventBusService,
  ɵHandleService as HandleService,
  ɵFlowSettingsService as FlowSettingsService,
  ɵFlowEntitiesService as FlowEntitiesService,
  ɵNodeAccessorService as NodeAccessorService,
  ɵRootPointerDirective as RootPointerDirective,
  ɵSpacePointContextDirective as SpacePointContextDirective,
  ɵViewportService as ViewportService,
  ɵSelectionService as SelectionService,
  Point,
} from 'ngx-vflow';
import { of } from 'rxjs';

const mockModel = () => new NodeModel({ id: 'mock', type: 'default', point: { x: 0, y: 0 } });

export function provideCustomNodeMocks(): Provider[] {
  return [
    {
      provide: ComponentEventBusService,
      useValue: {
        pushEvent: () => {},
      },
    },
    {
      provide: NodeAccessorService,
      useFactory: () => ({
        model: signal(mockModel()),
      }),
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
        documentPointToFlowPoint: (point: Point) => point,
      },
    },
    {
      provide: SelectionService,
      useValue: {
        select: () => {},
      },
    },
    FlowSettingsService,
    ViewportService,
  ];
}
