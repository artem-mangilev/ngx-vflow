import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';

@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DraggableService]
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

  @Input({ transform: (nodes: Node[]) => nodes.map(n => new NodeModel(n)) })
  public nodes: NodeModel[] = []

  @Input()
  public background: string = '#FFFFFF'

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

  protected trackById = (idx: number, { node }: NodeModel) => node.id
}

