import { AfterViewInit, Component, computed, ElementRef, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
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

type Side = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: '[resizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss']
})
export class ResizableComponent implements OnInit, AfterViewInit {
  private nodeAccessor = inject(NodeAccessorService)
  private rootPointer = inject(RootPointerDirective)
  private viewportService = inject(ViewportService)
  private hostRef = inject<ElementRef<Element>>(ElementRef)

  @Input()
  public set resizable(value: boolean | '') {
    if (typeof value === 'boolean') {
      this.model.resizable.set(value)
    } else {
      this.model.resizable.set(true)
    }
  }

  @Input()
  public resizerColor = '#2e414c'

  @Input()
  public gap = 1.5;

  @ViewChild('resizer', { static: true })
  private resizer!: TemplateRef<unknown>

  protected get model() {
    return this.nodeAccessor.model()!
  }

  protected lineGap = 3
  protected handleSize = 6

  private resizeSide: Side | null = null

  private zoom = computed(() => this.viewportService.readableViewport().zoom ?? 0)

  private minWidth = 0
  private minHeight = 0

  // TODO: allow reszie beside the flow
  protected resizeOnGlobalMouseMove = this.rootPointer.pointerMovement$
    .pipe(
      filter(() => this.resizeSide !== null),
      tap((event) => this.resize(event)),
      takeUntilDestroyed()
    )
    .subscribe()

  protected endResizeOnGlobalMouseUp = this.rootPointer.documentPointerEnd$
    .pipe(
      tap(() => this.endResize()),
      takeUntilDestroyed()
    )
    .subscribe()

  public ngOnInit(): void {
    this.model.resizerTemplate.set(this.resizer)
  }

  @Microtask
  public ngAfterViewInit() {
    this.minWidth = +getComputedStyle(this.hostRef.nativeElement).minWidth.replace('px', '') || 0
    this.minHeight = +getComputedStyle(this.hostRef.nativeElement).minHeight.replace('px', '') || 0
  }

  protected startResize(side: Side, event: Event) {
    event.stopPropagation()

    this.resizeSide = side
    this.model.resizing.set(true);
  }

  protected resize(event: { movementX: number, movementY: number }) {
    if (!this.resizeSide) return;

    const offset = calcOffset(event.movementX, event.movementY, this.zoom())
    const { x, y, width, height } = constrainRect(
      applyResize(this.resizeSide, this.model, offset),
      this.model,
      this.resizeSide,
      this.minWidth,
      this.minHeight
    )

    this.model.setPoint({ x, y }, false)
    this.model.size.set({ width, height })
  }

  protected endResize() {
    this.resizeSide = null
    this.model.resizing.set(false)
  }
}

function calcOffset(movementX: number, movementY: number, zoom: number) {
  return {
    offsetX: round(movementX / zoom),
    offsetY: round(movementY / zoom)
  };
}

function applyResize(
  side: Side,
  model: NodeModel,
  offset: { offsetX: number, offsetY: number }
): Rect {
  const { offsetX, offsetY } = offset
  const { x, y } = model.point()
  const { width, height } = model.size()

  // Handle each case of resizing (top, bottom, left, right, corners)
  switch (side) {
    case 'left':
      return { x: x + offsetX, y, width: width - offsetX, height }
    case 'right':
      return { x, y, width: width + offsetX, height }
    case 'top':
      return { x, y: y + offsetY, width, height: height - offsetY }
    case 'bottom':
      return { x, y, width, height: height + offsetY }
    case 'top-left':
      return { x: x + offsetX, y: y + offsetY, width: width - offsetX, height: height - offsetY }
    case 'top-right':
      return { x, y: y + offsetY, width: width + offsetX, height: height - offsetY }
    case 'bottom-left':
      return { x: x + offsetX, y, width: width - offsetX, height: height + offsetY }
    case 'bottom-right':
      return { x, y, width: width + offsetX, height: height + offsetY }
  }
}

function constrainRect(
  rect: Rect,
  model: NodeModel,
  side: Side,
  minWidth: number,
  minHeight: number
) {
  const parent = model.parent()
  const bounds = getNodesBounds(model.children())
  let { x, y, width, height } = rect

  // 1. Prevent negative dimensions
  width = Math.max(width, 0)
  height = Math.max(height, 0)

  // 2. Apply minimum size constraints
  width = Math.max(minWidth, width)
  height = Math.max(minHeight, height)

  // 3. Apply maximum size constraints based on parent size (if exists)
  if (parent) {
    x = Math.max(x, 0); // Left boundary of the parent
    y = Math.max(y, 0); // Top boundary of the parent

    width = Math.min(width, parent.size().width - model.point().x)
    height = Math.min(height, parent.size().height - model.point().y)
  }

  // 4. Apply child node constraints (if children exist)
  if (bounds) {
    if (side.includes('left')) {
      x = Math.min(x, (model.point().x + model.size().width) - (bounds.x + bounds.width))
      width = Math.max(width, bounds.x + bounds.width)
    }

    if (side.includes('right')) {
      width = Math.max(width, bounds.x + bounds.width)
    }

    if (side.includes('bottom')) {
      height = Math.max(height, bounds.y + bounds.height)
    }

    if (side.includes('top')) {
      y = Math.min(y, (model.point().y + model.size().height) - (bounds.y + bounds.height))
      height = Math.max(height, bounds.y + bounds.height)
    }
  }

  return {
    x,
    y,
    width,
    height
  };
}
