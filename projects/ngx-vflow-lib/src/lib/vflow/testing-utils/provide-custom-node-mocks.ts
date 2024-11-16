import { Provider, signal } from "@angular/core";
import { ComponentEventBusService } from "../services/component-event-bus.service";
import { HandleService } from "../services/handle.service";
import { NodeModel } from "../models/node.model";
import { FlowSettingsService } from "../services/flow-settings.service";
import { FlowEntitiesService } from "../services/flow-entities.service";
import { NodeAccessorService } from "../services/node-accessor.service";
import { RootPointerDirective } from "../directives/root-pointer.directive";
import { of } from "rxjs";
import { ViewportService } from "../services/viewport.service";
import { SpacePointContextDirective } from "../directives/space-point-context.directive";
import { Point } from "../interfaces/point.interface";
import { SelectionService } from "../services/selection.service";

const mockModel = () => new NodeModel({ id: 'mock', type: 'default', point: { x: 0, y: 0 } })

export function provideCustomNodeMocks(): Provider[] {
  return [
    {
      provide: ComponentEventBusService,
      useValue: {
        pushEvent: () => { }
      }
    },
    {
      provide: HandleService,
      useFactory: () => ({
        node: signal(mockModel()),
        createHandle: () => { },
        destroyHandle: () => { },
      })
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
          originalEvent: null
        }),
        documentPointerEnd$: of(null)
      }
    },
    {
      provide: SpacePointContextDirective,
      useValue: {
        documentPointToFlowPoint: (point: Point) => point
      }
    },
    {
      provide: NodeAccessorService,
      useFactory: () => ({
        model: signal(mockModel())
      })
    },
    {
      provide: SelectionService,
      useValue: {
        select: () => { },
      }
    },
    FlowSettingsService,
    FlowEntitiesService,
    ViewportService
  ]
}
