import { AlignmentHelperSettings } from './alignment-helper-settings.interface';
import { AutoPanSettings } from './auto-pan-settings.interface';
import { ConnectionSettings } from './connection-settings.interface';
import { DEFAULT_OPTIMIZATION, Optimization } from './optimization.interface';
import { DEFAULT_SELECTION_BOX, SelectionBoxSettings } from './selection-box-settings.interface';
import { Background } from '../types/background.type';
import { SelectionMode } from '../types/selection-mode.type';

/**
 * The settings of a flow, named and typed as the inputs of `vflow`. A value bound to an input wins over one given
 * with `withSettings()`, which wins over the default in {@link VFLOW_SETTINGS_DEFAULTS}; an object setting merges
 * its keys through those three layers.
 */
export interface VflowSettings {
  /** @see {VflowComponent.view} */
  view: [number, number] | 'auto';
  /** @see {VflowComponent.minZoom} */
  minZoom: number;
  /** @see {VflowComponent.maxZoom} */
  maxZoom: number;
  /** @see {VflowComponent.zoomOnScroll} */
  zoomOnScroll: boolean;
  /** @see {VflowComponent.zoomOnPinch} */
  zoomOnPinch: boolean;
  /** @see {VflowComponent.zoomOnDoubleClick} */
  zoomOnDoubleClick: boolean;
  /** @see {VflowComponent.panOnDrag} */
  panOnDrag: boolean | readonly number[];
  /** @see {VflowComponent.panOnScroll} */
  panOnScroll: boolean;
  /** @see {VflowComponent.paneClickDistance} */
  paneClickDistance: number;
  /** @see {VflowComponent.nodeDragThreshold} */
  nodeDragThreshold: number;
  /** @see {VflowComponent.connectionDragThreshold} */
  connectionDragThreshold: number;
  /** @see {VflowComponent.background} */
  background: Background | null;
  /** @see {VflowComponent.optimization} */
  optimization: Optimization;
  /** @see {VflowComponent.parentsBelowEdges} */
  parentsBelowEdges: boolean;
  /** @see {VflowComponent.nodesSelectable} */
  nodesSelectable: boolean;
  /** @see {VflowComponent.edgesSelectable} */
  edgesSelectable: boolean;
  /** @see {VflowComponent.nodesFocusable} */
  nodesFocusable: boolean;
  /** @see {VflowComponent.edgesFocusable} */
  edgesFocusable: boolean;
  /** @see {VflowComponent.selectionMode} */
  selectionMode: SelectionMode;
  /** @see {VflowComponent.selectionBox} */
  selectionBox: SelectionBoxSettings;
  /** @see {VflowComponent.connection} */
  connection: ConnectionSettings;
  /** @see {VflowComponent.snapGrid} */
  snapGrid: [number, number];
  /** @see {VflowComponent.elevateNodesOnSelect} */
  elevateNodesOnSelect: boolean;
  /** @see {VflowComponent.elevateEdgesOnSelect} */
  elevateEdgesOnSelect: boolean;
  /** @see {VflowComponent.autoPan} */
  autoPan: boolean | AutoPanSettings;
  /** @see {VflowComponent.autoPanOnNodeFocus} */
  autoPanOnNodeFocus: boolean;
  /** @see {VflowComponent.alignmentHelper} */
  alignmentHelper: AlignmentHelperSettings | boolean;
}

/** The value of every setting of a flow that neither an input nor `withSettings()` sets. */
export const VFLOW_SETTINGS_DEFAULTS: Readonly<VflowSettings> = {
  view: 'auto',
  minZoom: 0.5,
  maxZoom: 3,
  zoomOnScroll: true,
  zoomOnPinch: true,
  zoomOnDoubleClick: false,
  panOnDrag: true,
  panOnScroll: false,
  paneClickDistance: 6,
  nodeDragThreshold: 0,
  connectionDragThreshold: 0,
  background: null,
  optimization: DEFAULT_OPTIMIZATION,
  parentsBelowEdges: false,
  nodesSelectable: true,
  edgesSelectable: true,
  nodesFocusable: true,
  edgesFocusable: true,
  selectionMode: 'default',
  selectionBox: DEFAULT_SELECTION_BOX,
  connection: {},
  snapGrid: [1, 1],
  elevateNodesOnSelect: true,
  elevateEdgesOnSelect: true,
  autoPan: true,
  autoPanOnNodeFocus: true,
  alignmentHelper: false,
};
