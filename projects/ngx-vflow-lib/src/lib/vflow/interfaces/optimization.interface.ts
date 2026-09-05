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
   * If true, enables viewport virtualization to improve performance by only rendering
   * nodes and edges that are currently visible in the viewport. This optimization
   * filters out entities that are outside the visible area, reducing the number of
   * DOM elements and improving rendering performance for large flows.
   *
   * Below virtualizationZoomThreshold, nodes are drawn as a canvas preview and edges
   * are hidden. At higher zoom, visible node views mount as the viewport changes.
   */
  virtualization?: boolean;

  /**
   * The zoom threshold below which the only virtualization layer is drawn.
   * This should help to avoid performance issues when zooming out too much.
   */
  virtualizationZoomThreshold?: number;

  /**
   * The trigger for lazy loading of entities.
   */
  lazyLoadTrigger?: 'immediate' | 'viewport';
}
