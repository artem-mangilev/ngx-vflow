// Standalone Util
export * from './lib/vflow/vflow';
export * from './lib/vflow/utils/graph';
export * from './lib/vflow/utils/graph-operations';
export * from './lib/vflow/utils/coordinates';
export { getViewportForBounds, type ViewportForBoundsOptions } from './lib/vflow/utils/viewport';
export { getStraightPath } from './lib/vflow/math/edge-path/straigh-path';
export { getBezierPath } from './lib/vflow/math/edge-path/bezier-path';
export { getSmoothStepPath } from './lib/vflow/math/edge-path/smooth-step-path';
export {
  getFloatingEdgeParams,
  type FloatingEdgeParams,
  type FloatingEdgeOptions,
} from './lib/vflow/math/floating-edge-params';

// Interfaces
export {
  DEFAULT_ARIA_LABEL_CONFIG,
  type AriaLabelConfig,
  type KeyboardInstruction,
  type KeyboardInstructionKeys,
  type KeyboardInstructionState,
} from './lib/vflow/interfaces/aria-label-config.interface';
export type * from './lib/vflow/interfaces/dom-attributes.interface';
export type * from './lib/vflow/interfaces/delete-request.interface';
export {
  NODE_DEFAULTS,
  createNode,
  createNodes,
  type EntityComponentType,
  type Node,
  type NodeWithDefaults,
  type StaticNode,
} from './lib/vflow/interfaces/node.interface';
export type * from './lib/vflow/interfaces/point.interface';
export type * from './lib/vflow/interfaces/rect';
export {
  EDGE_DEFAULTS,
  createEdge,
  createEdges,
  type Curve,
  type Edge,
  type EdgeWithDefaults,
  type StaticEdge,
} from './lib/vflow/interfaces/edge.interface';
export type * from './lib/vflow/interfaces/edge-label.interface';
export type * from './lib/vflow/interfaces/connection.interface';
export type {
  ConnectionForValidation,
  ConnectionSettings,
  ConnectionValidatorFn,
} from './lib/vflow/interfaces/connection-settings.interface';
export {
  MARKER_DEFAULT_TYPE,
  type Marker,
  type MarkerRef,
  type MarkerType,
} from './lib/vflow/interfaces/marker.interface';
export type { SetCenterOptions, ViewportOptions, ViewportState } from './lib/vflow/interfaces/viewport.interface';
export {
  isComponentNodeEvent,
  type AnyComponentNodeEvent,
  type ComponentNodeEvent,
  type ComponentOutputEvent,
} from './lib/vflow/interfaces/component-node-event.interface';
export {
  isComponentEdgeEvent,
  type AnyComponentEdgeEvent,
  type ComponentEdgeEvent,
} from './lib/vflow/interfaces/component-edge-event.interface';
export { NODE_REF, injectNode, type NodeRef } from './lib/vflow/utils/inject-node';
export { EDGE_REF, injectEdge, type EdgeRef } from './lib/vflow/utils/inject-edge';
export type * from './lib/vflow/interfaces/fit-view-options.interface';
export { DEFAULT_OPTIMIZATION, type Optimization } from './lib/vflow/interfaces/optimization.interface';
export type * from './lib/vflow/interfaces/intersecting-nodes-options.interface';
export type * from './lib/vflow/interfaces/node-at-point.interface';
export {
  VFLOW_INITIALIZATION_GATE,
  type VflowInitializationGate,
} from './lib/vflow/interfaces/initialization-gate.interface';
export type * from './lib/vflow/interfaces/curve-factory.interface';
export type * from './lib/vflow/interfaces/alignment-helper-settings.interface';
export {
  DEFAULT_SELECTION_BOX,
  type SelectionBoxSettings,
} from './lib/vflow/interfaces/selection-box-settings.interface';
export type * from './lib/vflow/interfaces/auto-pan-settings.interface';
export type * from './lib/vflow/interfaces/template-context.interface';
export type {
  ConnectEndEvent,
  ConnectStartEvent,
  ConnectionEventEndpoint,
  ConnectionEventHandle,
  ConnectionEventOutcome,
  ReconnectEndEvent,
  ReconnectEvent,
  ReconnectStartEvent,
} from './lib/vflow/interfaces/connection-events.interface';
export type { NodeDragEvent } from './lib/vflow/interfaces/node-drag-event.interface';

// Types
export type * from './lib/vflow/types/node-change.type';
export type * from './lib/vflow/types/edge-change.type';
export type * from './lib/vflow/types/position.type';
export type * from './lib/vflow/types/handle-type.type';
export type * from './lib/vflow/types/background.type';
export type * from './lib/vflow/types/keyboard-shortcuts.type';
export type * from './lib/vflow/types/selection-mode.type';
export type * from './lib/vflow/types/selection-box-mode.type';

// Features
export { VflowFeature, provideVflow, vflowFeature } from './lib/vflow/features/feature';
export type { FeatureValue } from './lib/vflow/features/merged-feature-value';
export { VFLOW_SETTINGS, withSettings } from './lib/vflow/features/with-settings';
export { VFLOW_ARIA_LABELS, withAccessibility } from './lib/vflow/features/with-accessibility';
export { VFLOW_SHORTCUTS, withShortcuts } from './lib/vflow/features/with-shortcuts';
export {
  VFLOW_EDGE_COMPONENTS,
  VFLOW_NODE_COMPONENTS,
  withEdgeComponents,
  withNodeComponents,
  type EntityComponentRegistry,
} from './lib/vflow/features/with-entity-components';
export type {
  EdgeComponentKey,
  NodeComponentKey,
  VflowEdgeComponents,
  VflowNodeComponents,
} from './lib/vflow/interfaces/entity-components.interface';
export { VFLOW_SETTINGS_DEFAULTS, type VflowSettings } from './lib/vflow/interfaces/vflow-settings.interface';

// Components
export * from './lib/vflow/components/vflow/vflow.component';
export type { ResolvedVflowSettingSignals, ResolvedVflowSettings } from './lib/vflow/components/vflow/resolve-settings';
export * from './lib/vflow/public-components/resizable/resizable.component';
export type {
  ResizeAxis,
  ResizeChangeEvent,
  ResizeChangeParams,
  ResizeDragEvent,
  ResizeEvent,
  ResizeParams,
  ResizeSign,
  ShouldResize,
} from './lib/vflow/public-components/resizable/resizer-types';
export * from './lib/vflow/public-components/minimap/minimap.component';
export * from './lib/vflow/public-components/node-toolbar/node-toolbar.component';

// Directives
export * from './lib/vflow/public-directives/template.directive';
export * from './lib/vflow/public-directives/handle.directive';
export * from './lib/vflow/public-directives/edge-interaction-area.directive';
export * from './lib/vflow/public-directives/drag-handle.directive';
export * from './lib/vflow/public-directives/gesture-exclusions.directive';

// Host directive of `vflow` (`@internal`): the compiler requires it in the entry point.
export { ViewportCullingDirective } from './lib/vflow/directives/viewport-culling.directive';
