import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
})
export class NodeComponent implements OnInit, OnDestroy {
  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeTemplate!: TemplateRef<any>

  private draggableService = inject(DraggableService)
  private hostRef = inject<ElementRef<SVGGElement>>(ElementRef)

  public ngOnInit() {
    this.draggableService.makeDraggable(this.hostRef.nativeElement, this.nodeModel)
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement)
  }
}
