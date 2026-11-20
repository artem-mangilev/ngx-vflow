import { Signal, computed } from '@angular/core';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { VFLOW_SETTINGS_DEFAULTS, VflowSettings } from '../../interfaces/vflow-settings.interface';
import { suppliedEntries, withDefaults } from '../../utils/with-defaults';

/** The settings whose input has the type of the setting; the connection input is typed by its flow. */
type PlainSetting = Exclude<keyof VflowSettings, 'connection'>;

type PlainSettingInputs = { readonly [K in PlainSetting]: Signal<VflowSettings[K] | undefined> };

/**
 * The inputs of the flow that are settings: `undefined` while an input is not bound. The connection input carries
 * the node and edge types of its flow, so it is accepted with any of them.
 */
export type SettingInputs = PlainSettingInputs & {
  readonly connection: Signal<ConnectionSettings<never, never> | undefined>;
};

/** One signal per setting in effect, as `VflowComponent.settings` exposes them. */
export type ResolvedVflowSettingSignals = {
  readonly [K in keyof VflowSettings]: Signal<VflowSettings[K]>;
};

/** A distance in CSS pixels: negative and non-finite values read as 0. */
function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** Lays the given layers over `below`: an object merges into an object, a boolean replaces what is below it. */
function layerBooleanOrObject<T extends object>(below: boolean | T, layers: (boolean | T | undefined)[]): boolean | T {
  return layers.reduce<boolean | T>((result, layer) => {
    if (layer === undefined) return result;
    if (typeof layer === 'object' && typeof result === 'object') return { ...result, ...suppliedEntries(layer) };
    return layer;
  }, below);
}

/**
 * One signal per setting, read from the input when it is bound, else from `withSettings()` when it is given, else
 * from the defaults. Object settings merge their keys through the three layers; a `boolean | object` setting merges
 * objects and lets a boolean replace what is below it.
 */
export function resolveSettings(
  inputs: SettingInputs,
  provided: Signal<Partial<VflowSettings>> | null,
): ResolvedVflowSettingSignals {
  const providedValue = <K extends keyof VflowSettings>(key: K): VflowSettings[K] | undefined => provided?.()[key];

  const plain: PlainSettingInputs = inputs;

  const scalar = <K extends PlainSetting>(key: K): Signal<VflowSettings[K]> =>
    computed(() => plain[key]() ?? providedValue(key) ?? VFLOW_SETTINGS_DEFAULTS[key]);

  const distance = (key: 'paneClickDistance' | 'nodeDragThreshold' | 'connectionDragThreshold'): Signal<number> => {
    const value = scalar(key);
    return computed(() => nonNegative(value()));
  };

  // The settings are read without the node and edge types of the flow: its validator is handed the nodes and edges
  // of that flow either way.
  const connectionInput = inputs.connection as Signal<ConnectionSettings | undefined>;
  const connection = computed(() =>
    withDefaults(withDefaults(VFLOW_SETTINGS_DEFAULTS.connection, providedValue('connection')), connectionInput()),
  );

  const booleanOrObject = <K extends 'autoPan' | 'alignmentHelper'>(key: K): Signal<VflowSettings[K]> =>
    computed(() => layerBooleanOrObject(VFLOW_SETTINGS_DEFAULTS[key], [providedValue(key), plain[key]()]));

  return {
    minZoom: scalar('minZoom'),
    maxZoom: scalar('maxZoom'),
    zoomOnScroll: scalar('zoomOnScroll'),
    zoomOnPinch: scalar('zoomOnPinch'),
    zoomOnDoubleClick: scalar('zoomOnDoubleClick'),
    panOnDrag: scalar('panOnDrag'),
    panOnScroll: scalar('panOnScroll'),
    paneClickDistance: distance('paneClickDistance'),
    nodeDragThreshold: distance('nodeDragThreshold'),
    connectionDragThreshold: distance('connectionDragThreshold'),
    background: scalar('background'),
    virtualization: scalar('virtualization'),
    lazyLoadTrigger: scalar('lazyLoadTrigger'),
    parentsBelowEdges: scalar('parentsBelowEdges'),
    nodesSelectable: scalar('nodesSelectable'),
    edgesSelectable: scalar('edgesSelectable'),
    nodesFocusable: scalar('nodesFocusable'),
    edgesFocusable: scalar('edgesFocusable'),
    selectionMode: scalar('selectionMode'),
    selectionBoxMode: scalar('selectionBoxMode'),
    connection,
    snapGrid: scalar('snapGrid'),
    elevateNodesOnSelect: scalar('elevateNodesOnSelect'),
    elevateEdgesOnSelect: scalar('elevateEdgesOnSelect'),
    autoPan: booleanOrObject('autoPan'),
    autoPanOnNodeFocus: scalar('autoPanOnNodeFocus'),
    alignmentHelper: booleanOrObject('alignmentHelper'),
  };
}
