import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild, computed, signal } from '@angular/core';
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
export class EdgeLabelComponent {
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

    const width = this.model.width()
    const height = this.model.height()

    return {
      x: point.x - (width / 2),
      y: point.y - (height / 2)
    }
  })

  private pointSignal = signal({ x: 0, y: 0 })

  public ngAfterViewInit(): void {
    queueMicrotask(() => {
      const { width, height } = this.edgeLabelWrapperRef.nativeElement.getBoundingClientRect()

      this.model.width.set(width)
      this.model.height.set(height)
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
