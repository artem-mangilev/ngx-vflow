import { AfterViewInit, Component, computed, ElementRef, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NodeComponent } from '../../components/node/node.component';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { filter, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportService } from '../../services/viewport.service';
import { round } from '../../utils/round';
import { Microtask } from '../../decorators/microtask.decorator';
import { getNodesBounds } from '../../utils/nodes';

type Side = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: '[resizable]',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss']
})
export class ResizableComponent implements OnInit, AfterViewInit {
  private parentNode = inject(NodeComponent)
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
    return this.parentNode.nodeModel
  }

  protected lineGap = 3
  protected handleSize = 6

  private resizeSide: Side | null = null

  private zoom = computed(() => this.viewportService.readableViewport().zoom ?? 0)

  private minWidth = 0
  private minHeight = 0

  // TODO: allow reszie beside the flow
  protected resizeOnGlobalMouseMove = this.rootPointer.mouseMovement$
    .pipe(
      filter(() => this.resizeSide !== null),
      tap((event) => this.resize(event.originalEvent)),
      takeUntilDestroyed()
    )
    .subscribe()

  protected endResizeOnGlobalMouseUp = this.rootPointer.documentMouseUp$
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

  protected resize({ movementX, movementY }: MouseEvent) {
    const offsetX = round(movementX / this.zoom())
    const offsetY = round(movementY / this.zoom())

    switch (this.resizeSide) {
      case 'left':
        let x = this.model.point().x + offsetX
        x = Math.max(x, this.getMinX())
        x = Math.min(x, this.getMaxX())

        // TODO this fixes increasing width when current node hits the parent
        if (x === this.getMinX() || x === this.getMaxX()) {
          return
        }

        this.model.setPoint({ x, y: this.model.point().y }, false)

        this.model.size.update(({ height, width }) => {
          width -= offsetX
          width = Math.max(width, this.minWidth)
          width = Math.min(width, this.getMaxWidth())

          return { height, width: width }
        })

        return
      case 'right':
        this.model.size.update(({ height, width }) => {
          width += offsetX
          width = Math.max(width, this.minWidth)
          width = Math.min(width, this.getMaxWidth())

          const bounds = getNodesBounds(this.model.children())
          width = Math.max(width, bounds.x + bounds.width)

          return { height, width }
        })

        return
      case 'top':
        let y = this.model.point().y + offsetY
        y = Math.max(y, this.getMinY())
        y = Math.min(y, this.getMaxY())

        if (y === this.getMinY() || y === this.getMaxY()) {
          return
        }

        this.model.setPoint({ x: this.model.point().x, y }, false)

        this.model.size.update(({ height, width }) => {
          height -= offsetY
          height = Math.max(height, this.minHeight)
          height = Math.min(height, this.getMaxHeight())

          return { width, height }
        })

        return
      case 'bottom':
        this.model.size.update(({ height, width }) => {
          height += offsetY
          height = Math.max(height, this.minHeight)
          height = Math.min(height, this.getMaxHeight())

          const bounds = getNodesBounds(this.model.children())
          height = Math.max(height, bounds.y + bounds.height)

          return { width, height }
        })

        return

      case 'top-left': {
        let x = this.model.point().x + offsetX
        x = Math.max(x, this.getMinX())
        x = Math.min(x, this.getMaxX())

        let y = this.model.point().y + offsetY
        y = Math.max(y, this.getMinY())
        y = Math.min(y, this.getMaxY())

        if (
          x === this.getMinX() || y === this.getMinY() ||
          x === this.getMaxX() || y === this.getMaxY()
        ) {
          return
        }

        this.model.setPoint({ x, y }, false)

        this.model.size.update(({ height, width }) => {
          width -= offsetX
          width = Math.max(width, this.minWidth)
          width = Math.min(width, this.getMaxWidth())

          height -= offsetY
          height = Math.max(height, this.minHeight)
          height = Math.min(height, this.getMaxHeight())

          return { height, width }
        })

        return
      }

      case 'top-right': {
        let y = this.model.point().y + offsetY
        y = Math.max(y, this.getMinY())
        y = Math.min(y, this.getMaxY())

        if (y === this.getMinX() || y === this.getMaxY()) {
          return
        }

        this.model.setPoint({ x: this.model.point().x, y }, false)

        this.model.size.update(({ height, width }) => {
          const bounds = getNodesBounds(this.model.children())

          width += offsetX
          width = Math.max(width, this.minWidth)
          width = Math.min(width, this.getMaxWidth())
          width = Math.max(width, bounds.x + bounds.width)


          height -= offsetY
          height = Math.max(height, this.minHeight)
          height = Math.min(height, this.getMaxHeight())

          return { height, width }
        })

        return
      }

      case 'bottom-left': {
        let x = this.model.point().x + offsetX
        x = Math.max(x, this.getMinX())
        x = Math.min(x, this.getMaxX())

        if (x === this.getMinX() || x === this.getMaxX()) {
          return
        }

        this.model.setPoint({ x, y: this.model.point().y }, false)

        this.model.size.update(({ height, width }) => {
          width -= offsetX
          width = Math.max(width, this.minWidth)
          width = Math.min(width, this.getMaxWidth())

          height += offsetY
          height = Math.max(height, this.minHeight)
          height = Math.min(height, this.getMaxHeight())

          const bounds = getNodesBounds(this.model.children())
          height = Math.max(height, bounds.y + bounds.height)

          return { height, width }
        })

        return
      }

      case 'bottom-right': {
        this.model.size.update(({ height, width }) => {
          const bounds = getNodesBounds(this.model.children())

          width += offsetX
          width = Math.max(width, this.minWidth)
          width = Math.min(width, this.getMaxWidth())
          width = Math.max(width, bounds.x + bounds.width)


          height += offsetY
          height = Math.max(height, this.minHeight)
          height = Math.min(height, this.getMaxHeight())
          height = Math.max(height, bounds.y + bounds.height)

          return { height, width }
        })
      }
    }
  }

  protected endResize() {
    this.resizeSide = null
    this.model.resizing.set(false)
  }

  private getMaxWidth() {
    const parent = this.model.parent()

    if (parent) {
      return parent.size().width - this.model.point().x
    }

    return Infinity
  }

  private getMaxHeight() {
    const parent = this.model.parent()

    if (parent) {
      return parent.size().height - this.model.point().y
    }

    return Infinity
  }

  private getMinX() {
    const parent = this.model.parent()

    if (parent) {
      return 0
    }

    return -Infinity
  }

  private getMinY() {
    const parent = this.model.parent()

    if (parent) {
      return 0
    }

    return -Infinity
  }

  private getMaxX() {
    if (this.model.children()) {
      const bounds = getNodesBounds(this.model.children())

      return this.model.point().x + (bounds.x + bounds.width) >= this.model.point().x + this.model.size().width
        ? this.model.point().x
        : (this.model.size().width - this.minWidth) + this.model.point().x
    }

    return (this.model.size().width - this.minWidth) + this.model.point().x
  }

  private getMaxY() {
    if (this.model.children()) {
      const bounds = getNodesBounds(this.model.children())

      return this.model.point().y + (bounds.y + bounds.height) >= this.model.point().y + this.model.size().height
        ? this.model.point().y
        : (this.model.size().height - this.minHeight) + this.model.point().y
    }

    return (this.model.size().height - this.minHeight) + this.model.point().y
  }
}
