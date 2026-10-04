import { InjectionToken, Provider, inject, signal } from '@angular/core';
import {
  ɵNodeModel as NodeModel,
  ɵHandleService as HandleService,
  ɵFlowSettingsService as FlowSettingsService,
  ɵFlowStatusService as FlowStatusService,
  ɵFlowEntitiesService as FlowEntitiesService,
  ɵNodeAccessorService as NodeAccessorService,
  ɵViewportService as ViewportService,
  ɵSelectionService as SelectionService,
  ɵConnectionControllerDirective as ConnectionControllerDirective,
  ɵRequestAnimationFrameBatchingService as RequestAnimationFrameBatchingService,
  NODE_REF,
} from 'ngx-vflow';

/** The node every mock provider refers to, so `injectNode()`, handles and resizers share one model. */
const MOCK_NODE = new InjectionToken<NodeModel>('MOCK_NODE');

/**
 * Providers that let a component node render outside of a `vflow`: `injectNode()` returns a node with the id
 * `mock`, and the node-level directives of `Vflow` (`vHandle`, `vResizable`, `vSelectable`, `vDragHandle`,
 * `v-node-toolbar`) render without starting connections or selecting anything.
 */
export function provideCustomNodeMocks(): Provider[] {
  return [
    {
      provide: MOCK_NODE,
      useFactory: () => new NodeModel({ id: 'mock', point: signal({ x: 0, y: 0 }), parentId: signal(null) }),
    },
    { provide: NODE_REF, useFactory: () => inject(MOCK_NODE).context.$implicit },
    { provide: NodeAccessorService, useFactory: () => ({ model: signal(inject(MOCK_NODE)) }) },
    {
      provide: HandleService,
      useFactory: () => {
        const handles = new HandleService();
        handles.node.set(inject(MOCK_NODE));
        return handles;
      },
    },
    {
      provide: ConnectionControllerDirective,
      useValue: {
        startConnection: () => {},
        endConnection: () => {},
        validateConnection: () => {},
        resetValidateConnection: () => {},
      },
    },
    { provide: SelectionService, useValue: { select: () => {} } },
    FlowEntitiesService,
    FlowSettingsService,
    FlowStatusService,
    ViewportService,
    RequestAnimationFrameBatchingService,
  ];
}
