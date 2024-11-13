import { Provider, signal } from "@angular/core";
import { ComponentEventBusService } from "../services/component-event-bus.service";
import { HandleService } from "../services/handle.service";

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
      useValue: {
        node: signal(null),
        createHandle: () => { },
        destroyHandle: () => { },
      }
    },
    // TODO: mock ResizableComponent deps
    // TODO: mock SelectableDirective deps
  ]
}
