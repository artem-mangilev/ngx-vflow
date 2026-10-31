import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { SelectionBoxModel } from '../models/selection-box.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { KeyboardService } from '../services/keyboard.service';
import { SpacePointContextDirective } from './space-point-context.directive';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';
import { isPointInRect, rectContains, rectsIntersect } from '../utils/rect';
import { nodeToRect } from '../utils/nodes';
import { createPointerDrag } from '../gestures/pointer-drag';

const minSelectionSize = 2;

/**
 * The selection box: a drag on the pane while the selection modifier is held. The drag suppresses the click that
 * follows it, so the release does not select the entity under the pointer.
 */
@Directive({
  standalone: true,
  selector: 'div[selectionBoxContext]',
})
export class SelectionBoxContextDirective {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private keyboardService = inject(KeyboardService);
  private spacePointContext = inject(SpacePointContextDirective);

  public model = new SelectionBoxModel();

  constructor() {
    const drag = createPointerDrag(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, {
      filter: () =>
        this.flowSettingsService.selectionMode() !== 'manual' && this.keyboardService.isActiveModifier('selection'),
      onStart: ({ start }) => {
        this.clearPreselection();
        this.model.setStart(this.clientToFlowPosition(start));
      },
      onMove: ({ point }) => {
        this.model.setEnd(this.clientToFlowPosition(point));
        this.updatePreselection();
      },
      onEnd: () => this.finish(),
      onCancel: () => this.finish(),
    });
    inject(DestroyRef).onDestroy(() => drag.destroy());
  }

  private finish() {
    const rect = this.getSelectionRect();
    if (!rect || this.flowSettingsService.selectionMode() === 'manual') {
      this.clearPreselection();
      this.model.reset();
      return;
    }

    const nodes = this.flowEntitiesService.nodes();
    const edges = this.flowEntitiesService.edges();
    const entities = this.flowEntitiesService.entities();

    if (!this.keyboardService.isActiveModifier('multiSelection')) {
      entities.forEach((entity) => entity.selected.set(false));
    }

    nodes.filter((node) => node.preselected()).forEach((node) => node.selected.set(true));
    edges.filter((edge) => edge.preselected()).forEach((edge) => edge.selected.set(true));

    this.clearPreselection();
    this.model.reset();
  }

  private clientToFlowPosition(point: Point): Point {
    return this.spacePointContext.clientToFlowPosition(point);
  }

  private getSelectionRect(): Rect | null {
    const width = this.model.width();
    const height = this.model.height();

    if (width < minSelectionSize && height < minSelectionSize) {
      return null;
    }

    return {
      x: this.model.x(),
      y: this.model.y(),
      width,
      height,
    };
  }

  private updatePreselection() {
    const rect = this.getSelectionRect();

    if (!rect) {
      this.clearPreselection();
      return;
    }

    this.flowEntitiesService.nodes().forEach((node) => {
      node.preselected.set(node.selectable() && this.isNodeInside(node, rect));
    });

    this.flowEntitiesService.edges().forEach((edge) => {
      edge.preselected.set(edge.selectable() && this.isEdgeInside(edge, rect));
    });
  }

  private clearPreselection() {
    this.flowEntitiesService.entities().forEach((entity) => entity.preselected.set(false));
  }

  private isNodeInside(node: NodeModel, rect: Rect) {
    const nodeRect = nodeToRect(node);
    const mode = this.flowSettingsService.selectionBox().mode;

    if (mode === 'partial') {
      return rectsIntersect(nodeRect, rect);
    }

    return rectContains(nodeRect, rect);
  }

  private isEdgeInside(edge: EdgeModel, rect: Rect) {
    const source = edge.sourceHandle()?.pointAbsolute();
    const target = edge.targetHandle()?.pointAbsolute();
    const mode = this.flowSettingsService.selectionBox().mode;

    if (!source || !target) {
      return false;
    }

    const isSourceInside = isPointInRect(source, rect);
    const isTargetInside = isPointInRect(target, rect);

    if (mode === 'partial') {
      return isSourceInside || isTargetInside;
    }

    return isSourceInside && isTargetInside;
  }
}
