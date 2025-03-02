import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  input,
  viewChild,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportService } from '../../services/viewport.service';
import { round } from '../../utils/round';
import { Microtask } from '../../decorators/microtask.decorator';
import { getNodesBounds } from '../../utils/nodes';
import { NodeAccessorService } from '../../services/node-accessor.service';
import { NodeModel } from '../../models/node.model';
import { Rect } from '../../interfaces/rect';
import { PointerEvent } from '../../directives/root-pointer.directive';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { PointerDirective } from '../../directives/pointer.directive';

type Side = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  standalone: true,
  selector: '[resizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss'],
  imports: [PointerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizableComponent implements OnInit, AfterViewInit {
  private nodeAccessor = inject(NodeAccessorService);
  private rootPointer = inject(RootPointerDirective);
  private viewportService = inject(ViewportService);
  private spacePointContext = inject(SpacePointContextDirective);
  private hostRef = inject<ElementRef<Element>>(ElementRef);

  public resizable = input<boolean | ''>();

  public resizerColor = input('#2e414c');

  public gap = input(1.5);

  private resizer = viewChild.required<TemplateRef<unknown>>('resizer');

  protected get model() {
    return this.nodeAccessor.model()!;
  }

  protected lineGap = 3;
  protected handleSize = 6;

  private resizeSide: Side | null = null;

  private zoom = computed(() => this.viewportService.readableViewport().zoom ?? 0);

  private minWidth = 0;
  private minHeight = 0;

  // TODO: allow reszie beside the flow
  protected resizeOnGlobalMouseMove = this.rootPointer.pointerMovement$
    .pipe(
      filter(() => this.resizeSide !== null),
      filter((event) => event.movementX !== 0 || event.movementY !== 0),
      tap((event) => this.resize(event)),
      takeUntilDestroyed(),
    )
    .subscribe();

  protected endResizeOnGlobalMouseUp = this.rootPointer.documentPointerEnd$
    .pipe(
      tap(() => this.endResize()),
      takeUntilDestroyed(),
    )
    .subscribe();

  constructor() {
    effect(
      () => {
        const resizable = this.resizable();

        if (typeof resizable === 'boolean') {
          this.model.resizable.set(resizable);
        } else {
          this.model.resizable.set(true);
        }
      },
      { allowSignalWrites: true },
    );
  }

  public ngOnInit(): void {
    this.model.resizerTemplate.set(this.resizer());
  }

  @Microtask
  public ngAfterViewInit() {
    this.minWidth = +getComputedStyle(this.hostRef.nativeElement).minWidth.replace('px', '') || 0;
    this.minHeight = +getComputedStyle(this.hostRef.nativeElement).minHeight.replace('px', '') || 0;
  }

  protected startResize(side: Side, event: Event) {
    event.stopPropagation();
    this.resizeSide = side;
    this.model.resizing.set(true);
  }

  protected resize(event: PointerEvent) {
    if (!this.resizeSide) return;

    const offset = calcOffset(event.movementX, event.movementY, this.zoom());

    const resized = applyResize(this.resizeSide, this.model, offset, this.getDistanceToEdge(event));

    const { x, y, width, height } = constrainRect(resized, this.model, this.resizeSide, this.minWidth, this.minHeight);

    this.model.setPoint({ x, y });
    this.model.width.set(width);
    this.model.height.set(height);
  }

  protected endResize() {
    this.resizeSide = null;
    this.model.resizing.set(false);
  }

  private getDistanceToEdge(event: PointerEvent): number {
    const flowPoint = this.spacePointContext.documentPointToFlowPoint({ x: event.x, y: event.y });
    const { x } = this.model.globalPoint();
    const { width } = this.model.size();
    const distanceToEdge = {
      // left: Math.abs(flowPoint.x - x),
      right: flowPoint.x - (x + width),
      // top: Math.abs(flowPoint.y - y),
      // bottom: Math.abs(flowPoint.y - (y + height)),
    };

    return Math.min(...Object.values(distanceToEdge));
  }
}

function calcOffset(movementX: number, movementY: number, zoom: number) {
  return {
    offsetX: round(movementX / zoom),
    offsetY: round(movementY / zoom),
  };
}

function applyResize(
  side: Side,
  model: NodeModel,
  offset: { offsetX: number; offsetY: number },
  distanceToCursor: number,
): Rect {
  const { offsetX, offsetY } = offset;
  const { x, y } = model.point();
  const { width, height } = model.size();

  // Handle each case of resizing (top, bottom, left, right, corners)
  switch (side) {
    case 'left':
      return { x: x + offsetX, y, width: width - offsetX, height };
    case 'right':
      return { x, y, width: width + offsetX + distanceToCursor, height };
    case 'top':
      return { x, y: y + offsetY, width, height: height - offsetY };
    case 'bottom':
      return { x, y, width, height: height + offsetY };
    case 'top-left':
      return {
        x: x + offsetX,
        y: y + offsetY,
        width: width - offsetX,
        height: height - offsetY,
      };
    case 'top-right':
      return {
        x,
        y: y + offsetY,
        width: width + offsetX,
        height: height - offsetY,
      };
    case 'bottom-left':
      return {
        x: x + offsetX,
        y,
        width: width - offsetX,
        height: height + offsetY,
      };
    case 'bottom-right':
      return { x, y, width: width + offsetX, height: height + offsetY };
  }
}

function constrainRect(rect: Rect, model: NodeModel, side: Side, minWidth: number, minHeight: number) {
  let { x, y, width, height } = rect;

  // 1. Prevent negative dimensions
  width = Math.max(width, 0);
  height = Math.max(height, 0);

  // 2. Apply minimum size constraints
  width = Math.max(minWidth, width);
  height = Math.max(minHeight, height);

  // Apply left/top constraints based on minimum size
  x = Math.min(x, model.point().x + model.size().width - minWidth);
  y = Math.min(y, model.point().y + model.size().height - minHeight);

  const parent = model.parent();
  // 3. Apply maximum size constraints based on parent size (if exists)
  if (parent) {
    x = Math.max(x, 0); // Left boundary of the parent
    y = Math.max(y, 0); // Top boundary of the parent

    if (x === 0) {
      width = model.point().x + model.size().width;
    }

    if (y === 0) {
      height = model.point().y + model.size().height;
    }

    width = Math.min(width, parent.size().width - model.point().x);
    height = Math.min(height, parent.size().height - model.point().y);
  }

  const bounds = getNodesBounds(model.children());
  // 4. Apply child node constraints (if children exist)
  if (bounds) {
    if (side.includes('left')) {
      x = Math.min(x, model.point().x + model.size().width - (bounds.x + bounds.width));
      width = Math.max(width, bounds.x + bounds.width);
    }

    if (side.includes('right')) {
      width = Math.max(width, bounds.x + bounds.width);
    }

    if (side.includes('bottom')) {
      height = Math.max(height, bounds.y + bounds.height);
    }

    if (side.includes('top')) {
      y = Math.min(y, model.point().y + model.size().height - (bounds.y + bounds.height));
      height = Math.max(height, bounds.y + bounds.height);
    }
  }

  return {
    x,
    y,
    width,
    height,
  };
}
