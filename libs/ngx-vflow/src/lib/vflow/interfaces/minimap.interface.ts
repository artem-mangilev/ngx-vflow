import type { NodeComponentKey } from './entity-components.interface';

/**
 * How the minimap draws a node: a rectangle with one corner radius. A color is any CSS color, `var(--token)`
 * included, resolved on the minimap element, so it follows the theme. A key left out, or set to `undefined`, keeps
 * the value of the level below: the default of the minimap, then the style of the node's component in
 * `withMinimapSettings()`, then `Node.minimap`.
 *
 * By default a node is filled with `--v-minimap-node`, without an outline, and a node with children is an outline of
 * that color without a fill, so its members stay visible.
 */
export interface MinimapNodeStyle {
  /** Fill. */
  background?: string;
  /** Color of the outline, drawn when `borderWidth` is above zero. */
  borderColor?: string;
  /** Width of the outline in CSS pixels of the minimap, centered on the edge: it does not shrink with the graph. */
  borderWidth?: number;
  /**
   * Corner radius in flow units, the number of the `border-radius` of the node itself. It is limited to half the
   * shorter side, so a large value draws a pill or a circle.
   */
  borderRadius?: number;
}

/** Minimap settings of the flows below an injector, see `withMinimapSettings()`. */
export interface MinimapSettings {
  /** Style of the nodes of a component, by the key the component is registered under with `withNodeComponents()`. */
  nodeStyles?: Partial<Record<NodeComponentKey, MinimapNodeStyle>>;
}
