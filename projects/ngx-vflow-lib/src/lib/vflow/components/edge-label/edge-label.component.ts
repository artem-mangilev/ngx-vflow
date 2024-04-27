import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild, computed, signal } from '@angular/core';
import { EdgeLabelModel } from '../../models/edge-label.model';
import { EdgeModel } from '../../models/edge.model';
import { Point } from '../../interfaces/point.interface';
import { Microtask } from '../../decorators/microtask.decorator';

@Component({
  selector: 'g[edgeLabel]',
  templateUrl: './edge-label.component.html',
  styles: [`
    .edge-label-wrapper {
      width: max-content;

      /*
        this is a fix for bug in chrome, for some reason if the div fully matches the size
        of foreignObject there are occurs some visual artifacts around this div
       */
      margin-top: 1px;
      margin-left: 1px;
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

  @Microtask
  public ngAfterViewInit(): void {
    // this is a fix for visual artifact in chrome that for some reason adresses only for edge label.
    // the bug reproduces if edgeLabelWrapperRef size fully matched the size of parent foreignObject
    const MAGIC_VALUE_TO_FIX_GLITCH_IN_CHROME = 2

    const width = this.edgeLabelWrapperRef.nativeElement.clientWidth + MAGIC_VALUE_TO_FIX_GLITCH_IN_CHROME
    const height = this.edgeLabelWrapperRef.nativeElement.clientHeight + MAGIC_VALUE_TO_FIX_GLITCH_IN_CHROME

    this.model.size.set({ width, height })

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
