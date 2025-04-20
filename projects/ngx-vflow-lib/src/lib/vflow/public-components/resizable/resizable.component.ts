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
import { FlowSettingsService } from '../../services/flow-settings.service';
import { Point } from '../../interfaces/point.interface';
import { align } from '../../utils/align-number';

type Side = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface DistanceToEdge {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

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
  private settingsService = inject(FlowSettingsService);
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

    const resized = this.applyResize(this.resizeSide, this.model, offset, this.getDistanceToEdge(event));

    const { x, y, width, height } = constrainRect(resized, this.model, this.resizeSide, this.minWidth, this.minHeight);

    this.model.setPoint({ x, y });
    this.model.width.set(width);
    this.model.height.set(height);
  }

  protected endResize() {
    this.resizeSide = null;
    this.model.resizing.set(false);
  }

  private getDistanceToEdge(event: PointerEvent): DistanceToEdge {
    const flowPoint = this.spacePointContext.documentPointToFlowPoint({ x: event.x, y: event.y });
    const { x, y } = this.model.globalPoint();

    return {
      left: flowPoint.x - x,
      right: flowPoint.x - (x + this.model.width()),
      top: flowPoint.y - y,
      bottom: flowPoint.y - (y + this.model.height()),
    };
  }

  private applyResize(side: Side, model: NodeModel, offset: Point, distanceToEdge: DistanceToEdge): Rect {
    const { x, y } = model.point();
    const width = model.width();
    const height = model.height();
    const [snapX, snapY] = this.settingsService.snapGrid();

    switch (side) {
      case 'left': {
        const movementX = offset.x + distanceToEdge.left;
        const newX = align(x + movementX, snapX);
        const deltaX = newX - x;

        return {
          x: newX,
          y,
          width: width - deltaX,
          height,
        };
      }
      case 'right': {
        const movementX = offset.x + distanceToEdge.right;
        const newWidth = align(width + movementX, snapX);

        return {
          x,
          y,
          width: newWidth,
          height,
        };
      }
      case 'top': {
        const movementY = offset.y + distanceToEdge.top;
        const newY = align(y + movementY, snapY);
        const deltaY = newY - y;

        return {
          x,
          y: newY,
          width,
          height: height - deltaY,
        };
      }
      case 'bottom': {
        const movementY = offset.y + distanceToEdge.bottom;
        const newHeight = align(height + movementY, snapY);

        return {
          x,
          y,
          width,
          height: newHeight,
        };
      }
      case 'top-left': {
        const movementX = offset.x + distanceToEdge.left;
        const movementY = offset.y + distanceToEdge.top;
        const newX = align(x + movementX, snapX);
        const newY = align(y + movementY, snapY);
        const deltaX = newX - x;
        const deltaY = newY - y;

        return {
          x: newX,
          y: newY,
          width: width - deltaX,
          height: height - deltaY,
        };
      }
      case 'top-right': {
        const movementX = offset.x + distanceToEdge.right;
        const movementY = offset.y + distanceToEdge.top;
        const newY = align(y + movementY, snapY);
        const deltaY = newY - y;

        return {
          x,
          y: newY,
          width: align(width + movementX, snapX),
          height: height - deltaY,
        };
      }
      case 'bottom-left': {
        const movementX = offset.x + distanceToEdge.left;
        const movementY = offset.y + distanceToEdge.bottom;
        const newX = align(x + movementX, snapX);
        const deltaX = newX - x;

        return {
          x: newX,
          y,
          width: width - deltaX,
          height: align(height + movementY, snapY),
        };
      }
      case 'bottom-right': {
        const movementX = offset.x + distanceToEdge.right;
        const movementY = offset.y + distanceToEdge.bottom;

        return {
          x,
          y,
          width: align(width + movementX, snapX),
          height: align(height + movementY, snapY),
        };
      }
    }
  }
}

function calcOffset(movementX: number, movementY: number, zoom: number): Point {
  return {
    x: round(movementX / zoom),
    y: round(movementY / zoom),
  };
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
  x = Math.min(x, model.point().x + model.width() - minWidth);
  y = Math.min(y, model.point().y + model.height() - minHeight);

  const parent = model.parent();
  // 3. Apply maximum size constraints based on parent size (if exists)
  if (parent) {
    const parentWidth = parent.width();
    const parentHeight = parent.height();
    const modelX = model.point().x;
    const modelY = model.point().y;

    x = Math.max(x, 0);
    y = Math.max(y, 0);

    // Stop resizing when hitting left or top boundary
    if (side.includes('left') && x === 0) {
      width = Math.min(width, modelX + model.width());
    }
    if (side.includes('top') && y === 0) {
      height = Math.min(height, modelY + model.height());
    }

    // Allow right/bottom resizing without being blocked
    width = Math.min(width, parentWidth - x);
    height = Math.min(height, parentHeight - y);
  }

  const bounds = getNodesBounds(model.children());
  // 4. Apply child node constraints (if children exist)
  if (bounds) {
    if (side.includes('left')) {
      x = Math.min(x, model.point().x + model.width() - (bounds.x + bounds.width));
      width = Math.max(width, bounds.x + bounds.width);
    }

    if (side.includes('right')) {
      width = Math.max(width, bounds.x + bounds.width);
    }

    if (side.includes('bottom')) {
      height = Math.max(height, bounds.y + bounds.height);
    }

    if (side.includes('top')) {
      y = Math.min(y, model.point().y + model.height() - (bounds.y + bounds.height));
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
