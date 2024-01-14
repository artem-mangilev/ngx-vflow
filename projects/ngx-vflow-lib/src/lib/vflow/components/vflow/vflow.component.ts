import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { Point } from '../../interfaces/point.interface';

@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VflowComponent {
  @Input()
  public view: [number, number] = [400, 400]

  @Input()
  public nodes: Node[] = []

  @Input()
  public background: string = '#FFFFFF'

  @ViewChild('flow', { static: true })
  protected flowRef!: ElementRef<SVGSVGElement>

  @ContentChild('nodeTemplate')
  protected nodeTemplate!: TemplateRef<any>

  private draggingNode: Node | null = null
  private draggingNodeOffset: Point = { x: 0, y: 0 }

  protected onDragStart(node: Node, event: Event) {
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

  protected getMousePosition(event: MouseEvent) {
    const CTM = this.flowRef.nativeElement.getScreenCTM()

    return {
      x: (event.clientX - CTM!.e) / CTM!.a,
      y: (event.clientY - CTM!.f) / CTM!.d
    };
  }
}

