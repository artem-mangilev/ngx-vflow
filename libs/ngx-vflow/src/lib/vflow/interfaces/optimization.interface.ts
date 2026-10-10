export const DEFAULT_OPTIMIZATION: Required<Optimization> = {
  virtualization: false,
  lazyLoadTrigger: 'immediate',
};

export interface Optimization {
  /**
   * Hide offscreen nodes and edges with display:none while retaining their views
   * and component state. Nodes are initially loaded and measured even offscreen.
   * Focused elements and nodes in active gestures remain in layout.
   * Applies at every zoom; does not reduce DOM memory or stop component effects.
   */
  virtualization?: boolean;

  /**
   * The trigger for lazy loading of entities. Virtualization loads nodes immediately
   * to obtain their initial geometry, regardless of this setting.
   */
  lazyLoadTrigger?: 'immediate' | 'viewport';
}
