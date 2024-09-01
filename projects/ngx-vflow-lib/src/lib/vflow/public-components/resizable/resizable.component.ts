import { Component, computed, ElementRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NodeComponent } from '../../components/node/node.component';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { filter, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewportService } from '../../services/viewport.service';

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

  protected resizeOnGlobalMouseMove = this.rootPointer.mouseMovement$
    .pipe(
      filter(() => this.resizeSide !== null),
      tap((event) => this.resize(event.originalEvent)),
      takeUntilDestroyed()
    )
    .subscribe()

  protected endResizeOnGlobalMouseUp = this.rootPointer.mouseUp$
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
  }

  protected resize({ movementX, movementY }: MouseEvent) {
    switch (this.resizeSide) {
      case 'left':
        this.model.setPoint({
          x: this.model.point().x + (movementX / this.zoom()),
          y: this.model.point().y
        }, false)

        this.model.size.update(({ height, width }) =>
          ({ height, width: width - (movementX / this.zoom()) })
        )

        return
      case 'right':
        this.model.size.update(({ height, width }) =>
          ({ height, width: width + (movementX / this.zoom()) })
        )
        return
      case 'top':
        this.model.setPoint({
          x: this.model.point().x,
          y: this.model.point().y + (movementY / this.zoom())
        }, false)

        this.model.size.update(({ height, width }) =>
          ({ width, height: height - (movementY / this.zoom()) })
        )

        return
      case 'bottom':
        this.model.size.update(({ height, width }) =>
          ({ width, height: height + (movementY / this.zoom()) })
        )

        return
    }
  }

  protected endResize() {
    this.resizeSide = null
  }
}
