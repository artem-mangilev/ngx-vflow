import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';

@Component({
  selector: 'g[node]',
  templateUrl: './node.component.html',
  styles: [`
    .wrapper {
      width: max-content;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  public nodeModel!: NodeModel

  @Input()
  public nodeHtmlTemplate?: TemplateRef<any>

  @ViewChild('nodeContent')
  public nodeContentRef!: ElementRef<SVGGraphicsElement>

  @ViewChild('htmlWrapper')
  public htmlWrapperRef!: ElementRef<HTMLDivElement>

  private draggableService = inject(DraggableService)
  private hostRef = inject<ElementRef<SVGElement>>(ElementRef)

  public ngOnInit() {
    this.draggableService.makeDraggable(this.hostRef.nativeElement, this.nodeModel)
  }

  public ngAfterViewInit(): void {
    // TODO remove microtask

    if (this.nodeModel.node.type === 'default') {
      queueMicrotask(() => {
        const box = this.nodeContentRef.nativeElement.getBBox()

        this.nodeModel.width.set(box.width)
        this.nodeModel.height.set(box.height)
      })
    }

    if (this.nodeModel.node.type === 'html-template') {
      queueMicrotask(() => {
        const { width, height } = this.htmlWrapperRef.nativeElement.getBoundingClientRect()

        this.nodeModel.width.set(width)
        this.nodeModel.height.set(height)

      })
    }
  }

  public ngOnDestroy(): void {
    this.draggableService.destroy(this.hostRef.nativeElement)
  }
}
