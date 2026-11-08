import { Injector, effect, inject, runInInjectionContext, untracked } from '@angular/core';
import type { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { KeyboardService } from '../../services/keyboard.service';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { ReferenceIdentityChecker } from '../../utils/identity-checker/reference-identity-checker';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
import type { Node } from '../../interfaces/node.interface';
import type { Edge } from '../../interfaces/edge.interface';
import { VFLOW_SETTINGS } from '../../features/with-settings';
import { resolveSettings } from './resolve-settings';

/**
 * Makes the services of the flow read its inputs. Settings are bound once to resolved signals, so readers follow the
 * inputs and the provided settings without an effect; nodes and edges are reconciled with their previous models. Called in the constructor of the flow.
 */
export function bindVflowInputs<N extends Node, E extends Edge>(flow: VflowComponent<N, E>): void {
  const injector = inject(Injector);
  const settings = inject(FlowSettingsService);
  const entities = inject(FlowEntitiesService);
  const nodeRendering = inject(NodeRenderingService);

  // Every setting is read from its input when bound, else from `withSettings()`, else from the defaults.
  const { keyboardShortcuts, connection, ...sources } = resolveSettings(
    flow,
    inject(VFLOW_SETTINGS, { optional: true }),
  );
  settings.bind({ ...sources, ariaLabels: flow.ariaLabelConfig });
  entities.connectionSettings.bind(connection);
  inject(KeyboardService).bindShortcuts(keyboardShortcuts);

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
