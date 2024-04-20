import { Component, ElementRef, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';
import { HandleModel } from '../../models/handle.model';

@Component({
  selector: 'handle',
  templateUrl: './handle.component.html'
})
export class HandleComponent implements OnInit, OnDestroy {
  private handleService = inject(HandleService)
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement

  /**
   * At what side of node this component should be placed
   */
  @Input({ required: true })
  public position!: Position

  /**
   * Source or target
   */
  @Input({ required: true })
  public type!: 'source' | 'target'

  /**
   * Should be used if node has more than one source/target
   */
  @Input()
  public id?: string

  public model!: HandleModel

  public ngOnInit() {
    queueMicrotask(() => {
      const rect = this.parentRect()

      this.model = new HandleModel(
        {
          position: this.position,
          type: this.type,
          id: this.id,
          parentPosition: { x: rect.x, y: rect.y },
          parentSize: { width: rect.width, height: rect.height }
        },
        this.handleService.node()!
      )


      this.handleService.createHandle(this.model)
    })
  }

  public ngOnDestroy(): void {
    this.handleService.destroyHandle(this.model)
  }

  private parentRect() {
    // we assume there is only one foreignObject that wraps node
    const fo = this.element.closest('foreignObject')
    const parent = this.element.parentElement!

    const foRect = fo!.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    return {
      x: parentRect.left - foRect.left,
      y: parentRect.top - foRect.top,
      width: parentRect.width,
      height: parentRect.height
    }
  }
}
