import { MinimapNodeStyle, MinimapNodeStyleRule } from '../../interfaces/minimap.interface';
import { NodeModel } from '../../models/node.model';
import { isGroupNode } from '../../utils/is-group-node';
import { clamp } from '../../utils/viewport';
import { withDefaults } from '../../utils/with-defaults';

type NodeStyle = Required<Pick<MinimapNodeStyle, 'background' | 'borderColor'>> & MinimapNodeStyle;

const NODE_TOKENS: NodeStyle = { background: 'var(--v-minimap-node)', borderColor: 'var(--v-minimap-node-border)' };

/** Not registered, the outline of a group falls back to the fill of nodes, so that it follows a theme that sets only that. */
const GROUP_TOKENS: NodeStyle = {
  background: 'var(--v-minimap-group)',
  borderColor: 'var(--v-minimap-group-border, var(--v-minimap-node))',
};

export interface StyledNode {
  node: NodeModel;
  style: NodeStyle;
}

/** The nodes painted with one style, as one SVG path in flow space: the browser paints per style, not per node. */
export interface MinimapNodeBatch {
  background: string;
  borderColor: string;
  d: string;
}

/** The style the minimap draws a node with: the tokens, for a node or for a group, under the rule of its component. */
export function minimapNodeStyle(node: NodeModel, rules: Partial<Record<string, MinimapNodeStyleRule>>): NodeStyle {
  const component = node.rawNode.component;
  const rule = typeof component === 'string' && Object.hasOwn(rules, component) ? rules[component] : undefined;
  const tokens = isGroupNode(node) ? GROUP_TOKENS : NODE_TOKENS;
  return withDefaults(tokens, typeof rule === 'function' ? rule(node.rawNode) : rule);
}

/**
 * The nodes as paths in flow space, in painting order: parents before their members, and within a depth one path
 * per style. A node whose style sets no radius takes `radius`, the token.
 */
export function minimapNodeBatches(nodes: readonly StyledNode[], radius: number): MinimapNodeBatch[] {
  const layers: Map<string, MinimapNodeBatch>[] = [];
  for (const { node, style } of nodes) {
    const { background, borderColor, borderRadius } = style;
    const layer = (layers[depthOf(node)] ??= new Map());
    const key = `${background}\n${borderColor}`;
    let batch = layer.get(key);
    if (!batch) layer.set(key, (batch = { background, borderColor, d: '' }));

    const { x, y } = node.globalPoint();
    const [width, height] = [node.width(), node.height()];
    batch.d += roundRect(x, y, width, height, clamp(borderRadius ?? radius, 0, Math.min(width, height) / 2));
  }

  // A depth without nodes of its own is a hole in the array.
  return layers.filter(Boolean).flatMap((layer) => [...layer.values()]);
}

function roundRect(x: number, y: number, width: number, height: number, r: number): string {
  const [w, h] = [width - 2 * r, height - 2 * r];
  if (!r) return `M${x},${y}h${width}v${height}h${-width}z`;
  return `M${x + r},${y}h${w}a${r},${r} 0 0 1 ${r},${r}v${h}a${r},${r} 0 0 1 ${-r},${r}h${-w}a${r},${r} 0 0 1 ${-r},${-r}v${-h}a${r},${r} 0 0 1 ${r},${-r}z`;
}

function depthOf(node: NodeModel): number {
  let depth = 0;
  for (let parent = node.parent(); parent; parent = parent.parent()) depth++;
  return depth;
}
