import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { Point } from '../../interfaces/point.interface';
import { DraggableContextDirective } from '../../directives/draggable-context.directive';
import { MapContextDirective } from '../../directives/map-context.directive';

@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VflowComponent {
  /**
   * Size for flow view
   *
   * accepts
   * - absolute size in format [width, height] or
   * - 'auto' to compute size based on parent element size
   */
  @Input()
  public view: [number, number] | 'auto' = [400, 400]

  @Input()
  public nodes: Node[] = []

  @Input()
  public background: string = '#FFFFFF'

  @ViewChild(DraggableContextDirective)
  protected draggableContext!: DraggableContextDirective

  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective

  @ContentChild('nodeTemplate')
  protected nodeTemplate!: TemplateRef<any>

  protected get flowWidth() {
    return this.view === 'auto' ? '100%' : this.view[0]
  }

  protected get flowHeight() {
    return this.view === 'auto' ? '100%' : this.view[1]
  }

  protected cdr = inject(ChangeDetectorRef)

  protected trackById = (idx: number, node: Node) => node.id
}

