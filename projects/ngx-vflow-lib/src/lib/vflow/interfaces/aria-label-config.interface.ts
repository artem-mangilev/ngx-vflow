/** Localizable graph names and descriptions. Formatters receive plain text. */
export interface AriaLabelConfig {
  flowLabel: string;
  flowDescription: string;
  minimapLabel: string;
  minimapDescription: string;
  nodeLabel: (id: string) => string;
  groupLabel: (id: string) => string;
  edgeLabel: (endpoints: { source: string; target: string }) => string;
  handleLabel: (handle: { type: 'source' | 'target'; id?: string; node: string }) => string;
  parentDescription: (parent: string) => string;
  selected: string;
  selectionUnavailable: string;
  movementUnavailable: string;
  reconnectionUnavailable: string;
  connectionStartUnavailable: string;
  connectionAcceptUnavailable: string;
  connectionValid: string;
  connectionInvalid: string;
  keyboardNavigation: string;
  keyboardSelect: string;
  keyboardDeselect: string;
  keyboardMove: string;
}

export const DEFAULT_ARIA_LABEL_CONFIG: AriaLabelConfig = {
  flowLabel: 'Graph',
  flowDescription: '',
  minimapLabel: 'Graph minimap',
  minimapDescription: '',
  nodeLabel: (id) => `Node ${id}`,
  groupLabel: (id) => `Group ${id}`,
  edgeLabel: ({ source, target }) => `Connection from ${source} to ${target}`,
  handleLabel: ({ type, id, node }) =>
    `${type === 'source' ? 'Source' : 'Target'} connection point${id ? ` ${id}` : ''} of ${node}`,
  parentDescription: (parent) => `Parent: ${parent}.`,
  selected: 'Selected.',
  selectionUnavailable: 'Selection unavailable.',
  movementUnavailable: 'Movement unavailable.',
  reconnectionUnavailable: 'Reconnection unavailable.',
  connectionStartUnavailable: 'Starting connections unavailable.',
  connectionAcceptUnavailable: 'Accepting connections unavailable.',
  connectionValid: 'Valid connection target.',
  connectionInvalid: 'Invalid connection target.',
  keyboardNavigation: 'Use Tab and Shift+Tab to move focus.',
  keyboardSelect: 'Press Enter or Space to select. Hold the multiselection modifier to toggle selection.',
  keyboardDeselect: 'Press Escape to clear selection.',
  keyboardMove: 'When selected, use arrow keys to move movable selected nodes. Hold Shift to move faster.',
};
