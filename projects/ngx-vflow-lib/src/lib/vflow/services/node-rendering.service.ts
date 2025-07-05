import { Injectable, computed, inject, untracked } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { isGroupNode } from '../utils/is-group-node';
import { FlowSettingsService } from './flow-settings.service';
import { RenderZoneService } from './render-zone.service';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private renderZoneService = inject(RenderZoneService);

  public readonly nodes = computed(() => {
    return this.viewportNodes().sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
  });

  public readonly groups = computed(() => {
    return this.nodes().filter((n) => isGroupNode(n));
  });

  public readonly nonGroups = computed(() => {
    return this.nodes().filter((n) => !isGroupNode(n));
  });

  private viewportNodes = computed(() => {
    if (!this.flowSettingsService.optimization().viewportVirtualization) {
      return this.flowEntitiesService.nodes();
    }

    const viewportZones = this.renderZoneService.viewportZones();

    return this.flowEntitiesService.nodes().filter((n) => {
      const { x, y } = untracked(n.globalPoint);
      const width = untracked(n.width);
      const height = untracked(n.height);

      return viewportZones.some((zone) => {
        return x + width >= zone.x && x <= zone.x + zone.width && y + height >= zone.y && y <= zone.y + zone.height;
      });
    });
  });

  private maxOrder = computed(() => {
    return Math.max(...this.flowEntitiesService.nodes().map((n) => n.renderOrder()));
  });

  public pullNode(node: NodeModel) {
    // pull node
    node.renderOrder.set(this.maxOrder() + 1);

    // pull children
    node.children().forEach((n) => this.pullNode(n));
  }
}
