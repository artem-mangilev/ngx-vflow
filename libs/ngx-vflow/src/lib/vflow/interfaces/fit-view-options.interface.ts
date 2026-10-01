import { ViewportOptions } from './viewport.interface';

export interface FitViewOptions extends ViewportOptions {
  /**
   * Padding around the fitted nodes, as a share of their size
   */
  padding?: number;

  /**
   * Nodes that should be visible after fitView.
   * The whole flow will be visible if not passed or passed an empty array
   */
  nodes?: string[];

  /**
   * The least zoom this fit may choose, within the flow's `minZoom` and `maxZoom`
   */
  minZoom?: number;

  /**
   * The greatest zoom this fit may choose, within the flow's `minZoom` and `maxZoom`.
   * Wins over {@link minZoom} when less than it
   */
  maxZoom?: number;
}
