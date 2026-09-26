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

/** What the focused entity can do from the keyboard, so an instruction names only the commands that work. */
export interface KeyboardInstructionState {
  /** Whether a select command acquires selection: the entity is selectable and the flow is not in manual mode. */
  selectable: boolean;
  /** Whether the movement keys can move it: a draggable node that is selectable or already selected. */
  movable: boolean;
}

/** A sentence, or one written from the keys that are bound right now and what the entity can do. */
export type KeyboardInstruction = string | ((keys: KeyboardInstructionKeys, state: KeyboardInstructionState) => string);

/** Localizable graph names and descriptions. Formatters receive plain text. */
export interface AriaLabelConfig {
  flowLabel: string;
  flowDescription: string;
  minimapLabel: string;
  nodeLabel: (id: string) => string;
  edgeLabel: (endpoints: { source: string; target: string }) => string;
  /** `aria-roledescription` of a node, of a node that other nodes reference as parent, and of an edge. */
  nodeRole: string;
  groupRole: string;
  edgeRole: string;
  parentDescription: (parent: string) => string;
  selected: string;
  selectionUnavailable: string;
  movementUnavailable: string;
  /** Read out with a focusable node after its state. An empty key list means the command is disabled. */
  nodeInstructions: KeyboardInstruction;
  /** Read out with a focusable edge after its state. */
  edgeInstructions: KeyboardInstruction;
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
  nodeLabel: (id) => `Node ${id}`,
  edgeLabel: ({ source, target }) => `Connection from ${source} to ${target}`,
  nodeRole: 'node',
  groupRole: 'group',
  edgeRole: 'edge',
  parentDescription: (parent) => `Parent: ${parent}.`,
  selected: 'Selected.',
  selectionUnavailable: 'Selection unavailable.',
  movementUnavailable: 'Movement unavailable.',
  nodeInstructions: ({ select, move, delete: remove }, { selectable, movable }) =>
    [
      selectable && select ? `Press ${select} to select.` : '',
      movable && move ? `Use ${move} to move it while it is selected.` : '',
      remove ? `Press ${remove} to delete.` : '',
    ]
      .filter(Boolean)
      .join(' '),
  edgeInstructions: ({ select, delete: remove }, { selectable }) =>
    [selectable && select ? `Press ${select} to select.` : '', remove ? `Press ${remove} to delete.` : '']
      .filter(Boolean)
      .join(' '),
  selectionAnnouncement: ({ label, selected, count }) =>
    `${label} ${selected ? 'selected' : 'deselected'}. ${count} selected in total.`,
  selectionClearedAnnouncement: 'Selection cleared.',
  zoomAnnouncement: (zoom) => `Zoom ${Math.round(zoom * 100)}%.`,
  movedAnnouncement: ({ count, direction, x, y }) =>
    `Moved ${count === 1 ? 'node' : `${count} nodes`} ${direction}. Position: ${Math.round(x)}, ${Math.round(y)}.`,
};
