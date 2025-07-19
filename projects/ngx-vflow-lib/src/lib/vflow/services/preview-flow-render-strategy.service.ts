import { Injectable } from '@angular/core';
import { NodeModel } from '../models/node.model';

@Injectable()
export abstract class PreviewFlowRenderStrategyService {
  public abstract shouldRenderNode(node: NodeModel): boolean;
}

@Injectable()
export class ViewportPreviewFlowRenderStrategyService extends PreviewFlowRenderStrategyService {
  public shouldRenderNode(node: NodeModel): boolean {
    // Do not render preview node if the real node is visible
    return !node.isVisible();
  }
}
