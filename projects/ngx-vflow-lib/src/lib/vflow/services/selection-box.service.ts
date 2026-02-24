import { Injectable, inject } from '@angular/core';
import { EdgeModel } from '../models/edge.model';
import { NodeModel } from '../models/node.model';
import { SelectionBoxModel } from '../models/selection-box.model';
import { FlowEntitiesService } from './flow-entities.service';
import { KeyboardService } from './keyboard.service';
import { Point } from '../interfaces/point.interface';

const minSelectionSize = 2;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Injectable()
export class SelectionBoxService {
  private flowEntitiesService = inject(FlowEntitiesService);
  private keyboardService = inject(KeyboardService);

  public model = new SelectionBoxModel();

  public start(point: Point) {
    this.model.setStart(point);
  }

  public update(point: Point) {
    this.model.setEnd(point);
  }

  public finish() {
    const rect = this.getSelectionRect();
    if (!rect) {
      this.model.reset();
      return;
    }

    const nodes = this.flowEntitiesService.nodes();
    const edges = this.flowEntitiesService.edges();
    const entities = this.flowEntitiesService.entities();

    if (!this.keyboardService.isActiveAction('multiSelection')) {
      entities.forEach((entity) => entity.selected.set(false));
    }

    nodes.forEach((node) => {
      if (this.isNodeInside(node, rect)) {
        node.selected.set(true);
      }
    });

    edges.forEach((edge) => {
      if (this.isEdgeInside(edge, rect)) {
        edge.selected.set(true);
      }
    });

    this.model.reset();
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

  private isNodeInside(node: NodeModel, rect: Rect) {
    const nodePoint = node.globalPoint();

    return this.isRectInside(
      {
        x: nodePoint.x,
        y: nodePoint.y,
        width: node.width(),
        height: node.height(),
      },
      rect,
    );
  }

  private isEdgeInside(edge: EdgeModel, rect: Rect) {
    const source = edge.sourceHandle()?.pointAbsolute();
    const target = edge.targetHandle()?.pointAbsolute();

    if (!source || !target) {
      return false;
    }

    const edgeRect: Rect = {
      x: Math.min(source.x, target.x),
      y: Math.min(source.y, target.y),
      width: Math.abs(target.x - source.x),
      height: Math.abs(target.y - source.y),
    };

    return this.isRectInside(edgeRect, rect);
  }

  private isRectInside(inner: Rect, outer: Rect) {
    return (
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height
    );
  }
}
