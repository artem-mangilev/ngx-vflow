import type { NodeComponentKey } from './entity-components.interface';
import type { Node } from './node.interface';

/**
 * How the minimap draws the nodes of a component, over the tokens that draw every node: `--v-minimap-node`,
 * `--v-minimap-node-border` and `--v-minimap-node-radius`, or `--v-minimap-group` and `--v-minimap-group-border` for a
 * node with children. A key left out, or set to `undefined`, keeps the token.
 */
export interface MinimapNodeStyle {
  /** Fill; any CSS color, `var(--token)` included, resolved on the minimap element. */
  background?: string;
  /** Color of an outline one pixel of the minimap wide; `transparent` draws none. */
  borderColor?: string;
  /**
   * Corner radius in flow pixels, the unit of the node's own `border-radius`. It is limited to half the shorter
   * side, so a large value draws a pill or a circle.
   */
  borderRadius?: number;
}

/**
 * A style, or a function that derives one from a node: from its data, or from its `selected` signal. The signals the
 * function reads are followed. It runs again when one of them changes, and it is not called while
 * nodes move; return a few shared objects rather than a new color per node, so that nodes still share a path.
 */
export type MinimapNodeStyleRule<N extends Node = Node> =
  MinimapNodeStyle | ((node: N) => MinimapNodeStyle | undefined);

/** Minimap settings of the flows below an injector, see `withMinimapSettings()`. */
export interface MinimapSettings<N extends Node = Node> {
  /**
   * How the nodes of a component are drawn, by the key the component is registered under with
   * `withNodeComponents()`. Nodes drawn by a template, or by a component named by its class, take the tokens.
   */
  nodeStyles?: Partial<Record<NodeComponentKey, MinimapNodeStyleRule<N>>>;
}
