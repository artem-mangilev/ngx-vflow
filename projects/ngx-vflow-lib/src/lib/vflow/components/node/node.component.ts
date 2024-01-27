import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeTemplate!: TemplateRef<any>

  @ViewChild('nodeContent')
  public nodeContentRef!: ElementRef<SVGGraphicsElement>

  // TODO: may lead to perf issues
  @HostBinding('attr.transform')
  public get transform() {
    return `translate(${this.nodeModel.point().x}, ${this.nodeModel.point().y})`
  }

  private draggableService = inject(DraggableService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)

  public ngOnInit() {
    this.draggableService.makeDraggable(this.hostRef.nativeElement, this.nodeModel)
  }

  public ngAfterViewInit(): void {
    // TODO: remove microtask
    queueMicrotask(() => {
      const box = this.nodeContentRef.nativeElement.getBBox()

      this.nodeModel.width.set(box.width)
      this.nodeModel.height.set(box.height)
    })
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement)
  }
}
