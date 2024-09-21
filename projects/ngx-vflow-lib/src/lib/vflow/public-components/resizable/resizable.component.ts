import { Component, computed, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NodeComponent } from '../../components/node/node.component';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { filter, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportService } from '../../services/viewport.service';
import { round } from '../../utils/round';

type Side = 'top' | 'right' | 'bottom' | 'left'

@Component({
  selector: '[resizable]',
  templateUrl: './resizable.component.html'
})
export class ResizableComponent implements OnInit {
  private parentNode = inject(NodeComponent)
  private rootPointer = inject(RootPointerDirective)
  private viewportService = inject(ViewportService)

  @ViewChild('resizer', { static: true })
  private resizer!: TemplateRef<unknown>

  protected get model() {
    return this.parentNode.nodeModel
  }

  private resizeSide: Side | null = null

  private zoom = computed(() => this.viewportService.readableViewport().zoom ?? 0)

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
    this.model.resizable.set(true)
    this.model.resizerTemplate.set(this.resizer)
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
        if (this.model.size().width - offsetX > 0) {

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
        if (this.model.size().width + offsetX > 0) {

          this.model.size.update(({ height, width }) =>
            ({ height, width: width + offsetX })
          )
        }

        return
      case 'top':
        if (this.model.size().height - offsetY > 0) {

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
        if (this.model.size().height + offsetY > 0) {

          this.model.size.update(({ height, width }) =>
            ({ width, height: height + offsetY })
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
