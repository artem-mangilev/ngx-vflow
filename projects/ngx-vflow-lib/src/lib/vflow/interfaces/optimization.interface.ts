export const DEFAULT_OPTIMIZATION: Required<Optimization> = {
  detachedGroupsLayer: false,
  virtualization: false,
  virtualizationZoomThreshold: 0.5,
  lazyLoadTrigger: 'immediate',
};

export interface Optimization {
  /**
   * If true, the layer with groups will be placed behind the edges layer.
   * This approach fixes the issue when you can't select an edge inside group.
   *
   * @default false
   */
  detachedGroupsLayer?: boolean;

  /**
   * Hide offscreen nodes and edges with display:none while retaining their views
   * and component state. Nodes are initially loaded and measured even offscreen.
   * Focused elements and nodes in active gestures remain in layout.
   * Applies at every zoom; does not reduce DOM memory or stop component effects.
   */
  virtualization?: boolean;

  /**
   * @deprecated Ignored. Virtualization now uses CSS culling at every zoom.
   */
  virtualizationZoomThreshold?: number;

  /**
   * The trigger for lazy loading of entities. Virtualization loads nodes immediately
   * to obtain their initial geometry, regardless of this setting.
   */
  lazyLoadTrigger?: 'immediate' | 'viewport';
}
