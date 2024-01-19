import { Point } from '@angular/cdk/drag-drop';
import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { Node } from '../interfaces/node.interface';

@Directive({ selector: 'svg[draggableContext]' })
export class DraggableContextDirective {
  protected hostRef = inject<ElementRef<SVGSVGElement>>(ElementRef)

  private draggingNode: Node | null = null
  private draggingNodeOffset: Point = { x: 0, y: 0 }

  public onDragStart(node: Node, event: Event) {
    this.draggingNode = node

    this.draggingNodeOffset = this.getMousePosition(event as MouseEvent)
    this.draggingNodeOffset.x -= node.position.x;
    this.draggingNodeOffset.y -= node.position.y;
  }

  @HostListener('mousemove', ['$event'])
  protected onDrag(event: Event) {
    if (this.draggingNode) {
      event.preventDefault()
      const position = this.getMousePosition(event as MouseEvent)

      // TODO do not update model's value
      this.draggingNode.position = {
        x: position.x - this.draggingNodeOffset.x,
        y: position.y - this.draggingNodeOffset.y,
      }
    }
  }

  @HostListener('mouseup')
  protected onDragEnd() {
    this.draggingNode = null
    this.draggingNodeOffset = { x: 0, y: 0 }
  }

  private getMousePosition(event: MouseEvent) {
    const CTM = this.hostRef.nativeElement.getScreenCTM()

    return {
      x: (event.clientX - CTM!.e) / CTM!.a,
      y: (event.clientY - CTM!.f) / CTM!.d
    };
  }
}
