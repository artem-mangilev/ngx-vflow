import { MinimapNodeStyle } from '../../interfaces/minimap.interface';
import { NodeModel } from '../../models/node.model';
import { isGroupNode } from '../../utils/is-group-node';
import { clamp } from '../../utils/viewport';
import { withDefaults } from '../../utils/with-defaults';

export type ResolvedNodeStyle = Required<MinimapNodeStyle>;

/** The nodes painted with one style, as one path in flow space: a repaint costs per style, not per node. */
export interface MinimapNodeBatch {
  style: ResolvedNodeStyle;
  path: Path2D;
}

const DEFAULT_NODE_STYLE: ResolvedNodeStyle = {
  background: 'var(--v-minimap-node)',
  borderColor: 'transparent',
  borderWidth: 0,
  borderRadius: 2,
};

/** A group is the outline of the color it would be filled with, so its members stay visible inside it. */
const DEFAULT_GROUP_STYLE: ResolvedNodeStyle = {
  ...DEFAULT_NODE_STYLE,
  background: 'transparent',
  borderColor: DEFAULT_NODE_STYLE.background,
  borderWidth: 1,
};

/**
 * The nodes as paths in flow space, in painting order: parents before their members, and within a depth one path
 * per style. The style of a node is the default, for a node or for a group, under the style of its component in
 * `componentStyles`, under its own.
 */
export function minimapNodeBatches(
  nodes: readonly NodeModel[],
  componentStyles: Partial<Record<string, MinimapNodeStyle>>,
): MinimapNodeBatch[] {
  // A DOM without a canvas, such as a server or jsdom, has no paths: nothing is drawn there.
  if (typeof Path2D === 'undefined') return [];

  const layers: Map<string, MinimapNodeBatch>[] = [];
  // The style shared by the nodes of one component, as a node or as a group: merged once, not per node.
  const shared = new Map<string, ResolvedNodeStyle>();

  for (const node of nodes) {
    const group = isGroupNode(node);
    const component = typeof node.rawNode.component === 'string' ? node.rawNode.component : '';
    const sharedKey = (group ? 'group ' : 'node ') + component;
    let style = shared.get(sharedKey);
    if (!style) {
      style = withDefaults(group ? DEFAULT_GROUP_STYLE : DEFAULT_NODE_STYLE, componentStyles[component]);
      shared.set(sharedKey, style);
    }
    const own = node.minimapStyle();
    if (own) style = withDefaults(style, own);

    const layer = (layers[depthOf(node)] ??= new Map());
    const key = `${style.background}\n${style.borderColor}\n${style.borderWidth}`;
    let batch = layer.get(key);
    if (!batch) layer.set(key, (batch = { style, path: new Path2D() }));

    const { x, y } = node.globalPoint();
    const [width, height] = [node.width(), node.height()];
    batch.path.roundRect(x, y, width, height, clamp(style.borderRadius, 0, Math.min(width, height) / 2));
  }

  // A depth without nodes of its own is a hole in the array.
  return layers.filter(Boolean).flatMap((layer) => [...layer.values()]);
}

function depthOf(node: NodeModel): number {
  let depth = 0;
  for (let parent = node.parent(); parent; parent = parent.parent()) depth++;
  return depth;
}
