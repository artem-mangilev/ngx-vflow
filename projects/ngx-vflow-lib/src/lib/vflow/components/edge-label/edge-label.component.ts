import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild, computed, signal } from '@angular/core';
import { EdgeLabelModel } from '../../models/edge-label.model';
import { EdgeModel } from '../../models/edge.model';
import { Point } from '../../interfaces/point.interface';

@Component({
  selector: 'g[edgeLabel]',
  templateUrl: './edge-label.component.html',
  styles: [`
    .edge-label-wrapper {
      width: max-content;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeLabelComponent implements AfterViewInit {
  // TODO: too many inputs
  @Input()
  public model!: EdgeLabelModel

  @Input()
  public edgeModel!: EdgeModel

  @Input()
  public set point(point: Point) { this.pointSignal.set(point) }

  @Input()
  public htmlTemplate?: TemplateRef<any>

  @ViewChild('edgeLabelWrapper')
  public edgeLabelWrapperRef!: ElementRef<HTMLDivElement>

  /**
   * Centered point of label
   *
   * TODO: maybe put it into EdgeLabelModel
   */
  protected edgeLabelPoint = computed(() => {
    const point = this.pointSignal()

    const { width, height } = this.model.size()

    return {
      x: point.x - (width / 2),
      y: point.y - (height / 2)
    }
  })

  private pointSignal = signal({ x: 0, y: 0 })

  public ngAfterViewInit(): void {
    queueMicrotask(() => {
      const width = this.edgeLabelWrapperRef.nativeElement.clientWidth
      const height = this.edgeLabelWrapperRef.nativeElement.clientHeight

      this.model.size.set({ width, height })
    })
  }

  protected getLabelContext() {
    return {
      $implicit: {
        edge: this.edgeModel.edge,
        label: this.model.edgeLabel
      }
    }
  }
}
