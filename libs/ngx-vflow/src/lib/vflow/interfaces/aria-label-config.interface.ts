/** Key lists of the commands an instruction talks about, already formatted for a reader. */
export interface KeyboardInstructionKeys {
  select: string;
  clearSelection: string;
  delete: string;
  /** The four movement keys as one phrase. */
  move: string;
  /** The four panning keys as one phrase. */
  pan: string;
  zoomIn: string;
  zoomOut: string;
  fitView: string;
  /** The key held to toggle one entity instead of replacing the selection. */
  multiSelection: string;
}

/** A sentence, or one written from the keys that are bound right now. */
export type KeyboardInstruction = string | ((keys: KeyboardInstructionKeys) => string);

/** Localizable graph names and descriptions. Formatters receive plain text. */
export interface AriaLabelConfig {
  flowLabel: string;
  flowDescription: string;
  minimapLabel: string;
  minimapDescription: string;
  nodeLabel: (id: string) => string;
  groupLabel: (id: string) => string;
  edgeLabel: (endpoints: { source: string; target: string }) => string;
  parentDescription: (parent: string) => string;
  selected: string;
  selectionUnavailable: string;
  movementUnavailable: string;
  reconnectionUnavailable: string;
  keyboardNavigation: KeyboardInstruction;
  keyboardSelect: KeyboardInstruction;
  keyboardDeselect: KeyboardInstruction;
  keyboardMove: KeyboardInstruction;
  keyboardDelete: KeyboardInstruction;
  keyboardPan: KeyboardInstruction;
  keyboardZoom: KeyboardInstruction;
  /**
   * Display names for keys, looked up by the binding in lower case, as in `{ arrowup: 'стрелка вверх' }`. Two
   * entries are reserved: `or` joins a list of keys and `arrowkeys` names the four arrows together.
   */
  keyNames: Record<string, string>;
  /** Live feedback after a keyboard selection change of one entity. */
  selectionAnnouncement: (selection: { label: string; selected: boolean; count: number }) => string;
  /** Live feedback after Escape clears the selection. */
  selectionClearedAnnouncement: string;
  /** Live feedback after a keyboard zoom command, including fit view; `zoom` is the resulting scale. */
  zoomAnnouncement: (zoom: number) => string;
  /** Live feedback after arrow keys move the selected nodes; `x` and `y` are the focused node's position. */
  movedAnnouncement: (move: {
    count: number;
    direction: 'left' | 'right' | 'up' | 'down';
    x: number;
    y: number;
  }) => string;
}

export const DEFAULT_ARIA_LABEL_CONFIG: AriaLabelConfig = {
  flowLabel: 'Graph',
  flowDescription: '',
  minimapLabel: 'Graph minimap',
  minimapDescription: '',
  nodeLabel: (id) => `Node ${id}`,
  groupLabel: (id) => `Group ${id}`,
  edgeLabel: ({ source, target }) => `Connection from ${source} to ${target}`,
  parentDescription: (parent) => `Parent: ${parent}.`,
  selected: 'Selected.',
  selectionUnavailable: 'Selection unavailable.',
  movementUnavailable: 'Movement unavailable.',
  reconnectionUnavailable: 'Reconnection unavailable.',
  keyboardNavigation: 'Use Tab and Shift+Tab to move focus.',
  keyboardSelect: ({ select, multiSelection }) =>
    `Press ${select} to select. Hold ${multiSelection} to toggle selection.`,
  keyboardDeselect: ({ clearSelection }) => `Press ${clearSelection} to clear selection.`,
  keyboardMove: ({ move }) => `When selected, use ${move} to move movable selected nodes. Hold Shift to move faster.`,
  keyboardDelete: ({ delete: remove }) =>
    `Press ${remove} to request deletion of this item, or of the whole selection when it is selected.`,
  keyboardPan: ({ pan }) => `Use ${pan} to pan the view when they do not move a node. Hold Shift to pan faster.`,
  keyboardZoom: ({ zoomIn, zoomOut, fitView }) =>
    `Press ${zoomIn} to zoom in, ${zoomOut} to zoom out and ${fitView} to fit the graph.`,
  keyNames: {},
  selectionAnnouncement: ({ label, selected, count }) =>
    `${label} ${selected ? 'selected' : 'deselected'}. ${count} selected in total.`,
  selectionClearedAnnouncement: 'Selection cleared.',
  zoomAnnouncement: (zoom) => `Zoom ${Math.round(zoom * 100)}%.`,
  movedAnnouncement: ({ count, direction, x, y }) =>
    `Moved ${count === 1 ? 'node' : `${count} nodes`} ${direction}. Position: ${Math.round(x)}, ${Math.round(y)}.`,
};
