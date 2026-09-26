import { Injectable, computed, inject, untracked } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { FlowSettingsService } from './flow-settings.service';
import { isGroupNode } from '../utils/is-group-node';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private maxOrder = 0;

  public readonly nodes = computed(() =>
    byRenderOrder(this.flowEntitiesService.nodes().filter((node) => !node.culled())),
  );

  public readonly groups = computed(() => byRenderOrder(this.flowEntitiesService.nodes().filter(isGroupNode)));

  /**
   * Nodes whose rect intersects the viewport, as `ViewportCullingService` reports them. Read on demand only: a
   * consumer of this list depends on every node, so nothing on the per-frame path should read it.
   */
  public viewportNodes = computed(() => this.flowEntitiesService.nodes().filter((node) => node.inViewport()));

  public pullNode(node: NodeModel) {
    this.pull(node, (parent) => parent.children());
  }

  /**
   * Pulls every node in order. The children map is read once: every `renderOrder` write invalidates the
   * reactive epoch, so reading a computed with a producer per node after each write would poll all of them again.
   */
  public pullNodes(nodes: NodeModel[]) {
    const byParent = untracked(() => this.flowEntitiesService.nodesByParentIdMap());
    const children = (parent: NodeModel) => byParent.get(parent.rawNode.id) ?? [];
    for (const node of nodes) this.pull(node, children);
  }

  private pull(node: NodeModel, children: (parent: NodeModel) => NodeModel[]) {
    this.maxOrder++;
    // pull node
    node.renderOrder.set(this.maxOrder);

    // pull children
    children(node).forEach((n) => this.pull(n, children));
  }
}

/**
 * Reads each order once before sorting. A comparator that reads signals reads each one many times out of order,
 * and in a live consumer every such read walks all of its producers.
 */
function byRenderOrder(nodes: NodeModel[]): NodeModel[] {
  return nodes
    .map((node) => ({ node, order: node.renderOrder() }))
    .sort((a, b) => a.order - b.order)
    .map(({ node }) => node);
}
