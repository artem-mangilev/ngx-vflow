import { Injectable, computed, inject } from '@angular/core';
import { FlowEntitiesService } from './flow-entities.service';
import { NodeModel } from '../models/node.model';
import { isGroupNode } from '../utils/is-group-node';
import { FlowSettingsService } from './flow-settings.service';
import { isRectInViewport } from '../utils/viewport';
import { ViewportService } from './viewport.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { asyncScheduler, debounceTime, filter, map, merge, observeOn } from 'rxjs';
import { toLazySignal } from '../utils/signals/to-lazy-signal';

@Injectable()
export class NodeRenderingService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private viewportService = inject(ViewportService);

  public readonly nodes = computed(() => {
    if (!this.flowSettingsService.optimization().virtualization) {
      return [...this.flowEntitiesService.nodes()].sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
    }

    return this.viewportNodes().sort((aNode, bNode) => aNode.renderOrder() - bNode.renderOrder());
  });

  public readonly groups = computed(() => {
    return this.nodes().filter((n) => isGroupNode(n));
  });

  public readonly nonGroups = computed(() => {
    return this.nodes().filter((n) => !isGroupNode(n));
  });

  private viewportNodes = toLazySignal(
    merge(
      // TODO: maybe there is a better way wait when viewport is ready?
      // (to correctly calculate viewport nodes on first render)
      toObservable(this.flowEntitiesService.nodes).pipe(
        observeOn(asyncScheduler),
        filter((nodes) => !!nodes.length),
      ),

      this.viewportService.viewportChangeEnd$.pipe(
        debounceTime(500),
        map(() => this.flowEntitiesService.nodes()),
      ),
    ).pipe(map((nodes) => this.getViewportNodes(nodes))),
    {
      initialValue: [],
    },
  );

  private maxOrder = computed(() => {
    return Math.max(...this.flowEntitiesService.nodes().map((n) => n.renderOrder()));
  });

  public pullNode(node: NodeModel) {
    // pull node
    node.renderOrder.set(this.maxOrder() + 1);

    // pull children
    node.children().forEach((n) => this.pullNode(n));
  }

  private getViewportNodes(nodes: NodeModel[]) {
    const viewport = this.viewportService.readableViewport();
    const flowWidth = this.flowSettingsService.computedFlowWidth();
    const flowHeight = this.flowSettingsService.computedFlowHeight();

    const viewportNodes = nodes.filter((n) => {
      const { x, y } = n.globalPoint();
      const width = n.width();
      const height = n.height();

      return isRectInViewport({ x, y, width, height }, viewport, flowWidth, flowHeight);
    });

    const zoomThreshold = this.flowSettingsService.optimization().virtualizationZoomThreshold;

    return viewport.zoom < zoomThreshold ? [] : viewportNodes;
  }
}
