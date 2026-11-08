import { Injector, computed, effect, inject, runInInjectionContext, untracked } from '@angular/core';
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
import { VFLOW_ARIA_LABELS } from '../../features/with-accessibility';
import { VFLOW_SHORTCUTS } from '../../features/with-shortcuts';
import { DEFAULT_ARIA_LABEL_CONFIG } from '../../interfaces/aria-label-config.interface';
import { withDefaults } from '../../utils/with-defaults';
import { ResolvedVflowSettingSignals, resolveSettings } from './resolve-settings';

/**
 * Makes the services of the flow read its inputs. Settings are bound once to resolved signals, so readers follow the
 * inputs and the provided settings without an effect; nodes and edges are reconciled with their previous models. Called in the constructor of the flow; returns the
 * settings in effect.
 */
export function bindVflowInputs<N extends Node, E extends Edge>(
  flow: VflowComponent<N, E>,
): ResolvedVflowSettingSignals {
  const injector = inject(Injector);
  const settings = inject(FlowSettingsService);
  const entities = inject(FlowEntitiesService);
  const nodeRendering = inject(NodeRenderingService);

  // Every setting is read from its input when bound, else from `withSettings()`, else from the defaults.
  const resolved = resolveSettings(flow, inject(VFLOW_SETTINGS, { optional: true }));
  const { connection, ...sources } = resolved;
  // The labels have no input: they come from `withAccessibility()`, else they are the English defaults.
  const labels = inject(VFLOW_ARIA_LABELS, { optional: true });
  settings.bind({
    ...sources,
    // The size of one flow is not an application-wide setting: the input, else 'auto'.
    view: computed(() => flow.view() ?? 'auto'),
    ariaLabels: computed(() => withDefaults(DEFAULT_ARIA_LABEL_CONFIG, labels?.())),
  });
  entities.connectionSettings.bind(connection);
  // The keys have no input either: `withShortcuts()`, else the defaults of the keyboard service.
  const shortcuts = inject(VFLOW_SHORTCUTS, { optional: true });
  inject(KeyboardService).bindShortcuts(computed(() => shortcuts?.() ?? {}));

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

  return resolved;
}
