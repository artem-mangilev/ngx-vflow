import { Signal, computed } from '@angular/core';
import { VFLOW_SETTINGS_DEFAULTS, VflowSettings } from '../../interfaces/vflow-settings.interface';
import { suppliedEntries, withDefaults } from '../../utils/with-defaults';

/** The inputs of the flow that are settings: `undefined` while an input is not bound. */
export type SettingInputs = { readonly [K in keyof VflowSettings]: Signal<VflowSettings[K] | undefined> };

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

  const scalar = <K extends keyof VflowSettings>(key: K): Signal<VflowSettings[K]> =>
    computed(() => inputs[key]() ?? providedValue(key) ?? VFLOW_SETTINGS_DEFAULTS[key]);

  const distance = (key: 'paneClickDistance' | 'nodeDragThreshold' | 'connectionDragThreshold'): Signal<number> => {
    const value = scalar(key);
    return computed(() => nonNegative(value()));
  };

  const merged = <K extends 'connection'>(key: K): Signal<VflowSettings[K]> =>
    computed(() => withDefaults(withDefaults(VFLOW_SETTINGS_DEFAULTS[key], providedValue(key)), inputs[key]()));

  const booleanOrObject = <K extends 'autoPan' | 'alignmentHelper'>(key: K): Signal<VflowSettings[K]> =>
    computed(() => layerBooleanOrObject(VFLOW_SETTINGS_DEFAULTS[key], [providedValue(key), inputs[key]()]));

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
    connection: merged('connection'),
    snapGrid: scalar('snapGrid'),
    elevateNodesOnSelect: scalar('elevateNodesOnSelect'),
    elevateEdgesOnSelect: scalar('elevateEdgesOnSelect'),
    autoPan: booleanOrObject('autoPan'),
    autoPanOnNodeFocus: scalar('autoPanOnNodeFocus'),
    alignmentHelper: booleanOrObject('alignmentHelper'),
  };
}
