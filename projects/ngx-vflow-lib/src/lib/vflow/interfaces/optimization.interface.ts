export const DEFAULT_OPTIMIZATION: Required<Optimization> = {
  detachedGroupsLayer: false,
  virtualization: false,
  virtualizationZoomThreshold: 0.5,
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
   * It uses canvas as a virtualization layer during viewport change.
   * When the viewport change ends, the library hydrates the canvas with the actual nodes and edges.
   */
  virtualization: boolean;

  /**
   * The zoom threshold below which the only virtualization layer is drawn.
   * This should help to avoid performance issues when zooming out too much.
   */
  virtualizationZoomThreshold?: number;
}
