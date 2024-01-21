import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, HostListener, Input, OnInit, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ZoomService } from '../../services/zoom.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DraggableService, ZoomService]
})
export class VflowComponent {
  protected zoomService = inject(ZoomService)

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
  public minZoom = 0.5

  @Input()
  public maxZoom = 3

  @Input()
  public set zoom(value: number) {
    this.zoomService.zoom.set(value)
  }

  public readonly zoomPanSignal = this.zoomService.zoomPan

  public readonly zoomPan$ = toObservable(this.zoomService.zoomPan)

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

  public zoomTo(value: number) {
    this.zoomService.zoom.set(value)
  }

  public panTo(x: number, y: number) {
    this.zoomService.pan.set({ x, y })
  }

  protected trackById(idx: number, { node }: NodeModel) {
    return node.id
  }
}

