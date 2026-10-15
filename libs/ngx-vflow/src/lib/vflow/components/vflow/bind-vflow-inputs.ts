import { Injector, effect, inject, runInInjectionContext, untracked } from '@angular/core';
import type { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { KeyboardService } from '../../services/keyboard.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { ReferenceIdentityChecker } from '../../utils/identity-checker/reference-identity-checker';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';

/**
 * Makes the services of the flow read its inputs. Settings are bound once, so readers follow the inputs without an
 * effect; nodes and edges are reconciled with their previous models. Called in the constructor of the flow.
 */
export function bindVflowInputs(flow: VflowComponent) {
  const injector = inject(Injector);
  const settings = inject(FlowSettingsService);
  const entities = inject(FlowEntitiesService);
  const nodeRendering = inject(NodeRenderingService);

  settings.bind({
    ariaLabels: flow.ariaLabelConfig,
    view: flow.view,
    minZoom: flow.minZoom,
    maxZoom: flow.maxZoom,
    zoomOnScroll: flow.zoomOnScroll,
    zoomOnPinch: flow.zoomOnPinch,
    zoomOnDoubleClick: flow.zoomOnDoubleClick,
    panOnDrag: flow.panOnDrag,
    panOnScroll: flow.panOnScroll,
    paneClickDistance: flow.paneClickDistance,
    nodeDragThreshold: flow.nodeDragThreshold,
    connectionDragThreshold: flow.connectionDragThreshold,
    background: flow.background,
    optimization: flow.optimization,
    parentsBelowEdges: flow.parentsBelowEdges,
    nodesSelectable: flow.nodesSelectable,
    edgesSelectable: flow.edgesSelectable,
    nodesFocusable: flow.nodesFocusable,
    edgesFocusable: flow.edgesFocusable,
    selectionMode: flow.selectionMode,
    selectionBox: flow.selectionBox,
    snapGrid: flow.snapGrid,
    elevateNodesOnSelect: flow.elevateNodesOnSelect,
    elevateEdgesOnSelect: flow.elevateEdgesOnSelect,
    autoPan: flow.autoPan,
    autoPanOnNodeFocus: flow.autoPanOnNodeFocus,
    alignmentHelper: flow.alignmentHelper,
  });
  entities.connectionSettings.bind(flow.connection);
  inject(KeyboardService).bindShortcuts(flow.keyboardShortcuts);

  // Reconciliation reuses the models of the previous list and links edges to nodes, so it writes and cannot be
  // a computed. Component effects run before the template is checked, so the template sees the new models.
  effect(() => {
    const nodes = flow.nodes();
    untracked(() => {
      const models = runInInjectionContext(injector, () => ReferenceIdentityChecker.nodes(nodes, entities.nodes()));
      addNodesToEdges(models, entities.edges());
      entities.nodes.set(models);
      nodeRendering.pullNodes(models);
    });
  });

  effect(() => {
    const edges = flow.edges();
    untracked(() => {
      const models = runInInjectionContext(injector, () => ReferenceIdentityChecker.edges(edges, entities.edges()));
      addNodesToEdges(entities.nodes(), models);
      entities.edges.set(models);
    });
  });
}
