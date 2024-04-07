import { AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnInit, inject, signal } from '@angular/core';
import { Position } from '../../types/position.type';
import { HandleService } from '../../services/handle.service';

@Component({
  selector: 'handle',
  templateUrl: './handle.component.html'
})
export class HandleComponent implements OnInit {
  private handleService = inject(HandleService)
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement

  @Input({ required: true })
  public position!: Position

  @Input({ required: true })
  public type!: 'source' | 'target'

  @Input()
  public id?: string

  public ngOnInit() {
    queueMicrotask(() => {
      const rect = this.parentRect()

      this.handleService.createHandle({
        position: this.position,
        type: this.type,
        id: this.id,
        parentPosition: signal({ x: rect.x, y: rect.y }),
        parentSize: signal({ width: rect.width, height: rect.height })
      })
    })
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
