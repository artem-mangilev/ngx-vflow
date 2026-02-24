import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs/operators';
import { SelectionBoxModel } from '../models/selection-box.model';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { KeyboardService } from '../services/keyboard.service';
import { RootSvgReferenceDirective } from './reference.directive';
import { RootPointerDirective } from './root-pointer.directive';
import { SpacePointContextDirective } from './space-point-context.directive';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { Point } from '../interfaces/point.interface';
import { Rect } from '../interfaces/rect';

const minSelectionSize = 2;

@Directive({
  standalone: true,
  selector: 'g[selectionBoxContext]',
})
export class SelectionBoxContextDirective {
  private flowEntitiesService = inject(FlowEntitiesService);
  private flowSettingsService = inject(FlowSettingsService);
  private keyboardService = inject(KeyboardService);
  private spacePointContext = inject(SpacePointContextDirective);
  private rootSvg = inject(RootSvgReferenceDirective).element;
  private rootPointer = inject(RootPointerDirective);

  public model = new SelectionBoxModel();

  protected startSub = this.rootPointer.pointerStart$
    .pipe(
      filter(() => this.flowSettingsService.entitiesSelectable()),
      filter(() => this.keyboardService.isActiveAction('selection')),
      filter(({ target }) => !target?.closest('.vflow-node') && !target?.closest('.selectable')),
      tap(({ x, y, originalEvent }) => {
        originalEvent.preventDefault();
        const point = this.documentPointToFlowPoint({ x, y });
        this.model.setStart(point);
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  protected moveSub = this.rootPointer.pointerMovement$
    .pipe(
      filter(() => this.model.active()),
      tap((event) => {
        const point = this.documentPointToFlowPoint({ x: event.x, y: event.y });
        this.model.setEnd(point);
      }),
      takeUntilDestroyed(),
    )
    .subscribe();

  protected endSub = this.rootPointer.documentPointerEnd$
    .pipe(
      filter(() => this.model.active()),
      tap(() => this.finish()),
      takeUntilDestroyed(),
    )
    .subscribe();

  private finish() {
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

  private documentPointToFlowPoint(documentPoint: Point): Point {
    return this.spacePointContext.documentPointToFlowPoint(documentPoint);
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
