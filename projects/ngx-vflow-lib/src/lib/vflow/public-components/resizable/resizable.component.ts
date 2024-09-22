import { AfterViewInit, Component, computed, ElementRef, inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NodeComponent } from '../../components/node/node.component';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { filter, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportService } from '../../services/viewport.service';
import { round } from '../../utils/round';
import { Microtask } from '../../decorators/microtask.decorator';

type Side = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: '[resizable]',
  templateUrl: './resizable.component.html'
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
        if (this.model.size().width - offsetX > this.minWidth) {

          this.model.setPoint({
            x: this.model.point().x + offsetX,
            y: this.model.point().y
          }, false)

          this.model.size.update(({ height, width }) =>
            ({ height, width: width - offsetX })
          )
        }

        return
      case 'right':
        if (this.model.size().width + offsetX > this.minWidth) {

          this.model.size.update(({ height, width }) =>
            ({ height, width: width + offsetX })
          )
        }

        return
      case 'top':
        if (this.model.size().height - offsetY > this.minHeight) {

          this.model.setPoint({
            x: this.model.point().x,
            y: this.model.point().y + offsetY
          }, false)

          this.model.size.update(({ height, width }) =>
            ({ width, height: height - offsetY })
          )
        }

        return
      case 'bottom':
        if (this.model.size().height + offsetY > this.minHeight) {

          this.model.size.update(({ height, width }) =>
            ({ width, height: height + offsetY })
          )
        }

        return

      case 'top-left':
        if (
          this.model.size().height - offsetY > this.minHeight &&
          this.model.size().width - offsetX > this.minWidth
        ) {

          this.model.setPoint({
            x: this.model.point().x + offsetX,
            y: this.model.point().y + offsetY
          }, false)

          this.model.size.update(({ height, width }) =>
            ({ height: height - offsetY, width: width - offsetX })
          )
        }

        return

      case 'top-right':
        if (
          this.model.size().height - offsetY > this.minHeight &&
          this.model.size().width + offsetX > this.minWidth
        ) {

          this.model.setPoint({
            x: this.model.point().x,
            y: this.model.point().y + offsetY
          }, false)

          this.model.size.update(({ height, width }) =>
            ({ height: height - offsetY, width: width + offsetX })
          )
        }

        return

      case 'bottom-left':
        if (
          this.model.size().height + offsetY > this.minHeight &&
          this.model.size().width - offsetX > this.minWidth
        ) {

          this.model.setPoint({
            x: this.model.point().x + offsetX,
            y: this.model.point().y
          }, false)

          this.model.size.update(({ height, width }) =>
            ({ height: height + offsetY, width: width - offsetX })
          )
        }

        return

      case 'bottom-right':
        if (
          this.model.size().height + offsetY > this.minHeight &&
          this.model.size().width + offsetX > this.minWidth
        ) {

          this.model.size.update(({ height, width }) =>
            ({ height: height + offsetY, width: width + offsetX })
          )
        }

        return
    }
  }

  protected endResize() {
    this.resizeSide = null
    this.model.resizing.set(false)
  }
}
