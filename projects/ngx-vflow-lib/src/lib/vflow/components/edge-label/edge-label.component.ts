import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  TemplateRef,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { EdgeLabelModel } from '../../models/edge-label.model';
import { EdgeModel } from '../../models/edge.model';
import { NgTemplateOutlet } from '@angular/common';
import { resizable } from '../../utils/resizable';
import { startWith, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME } from '../../constants/magic-number-to-fix-glitch-in-chrome.constant';

@Component({
  standalone: true,
  selector: 'g[edgeLabel]',
  templateUrl: './edge-label.component.html',
  styles: [
    `
      .edge-label-wrapper {
        width: max-content;

        /*
        this is a fix for bug in chrome, for some reason if the div fully matches the size
        of foreignObject there are occurs some visual artifacts around this div
       */
        margin-top: 1px;
        margin-left: 1px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class EdgeLabelComponent implements AfterViewInit {
  private zone = inject(NgZone);
  private destroyRef = inject(DestroyRef);

  // TODO: too many inputs
  public model = input.required<EdgeLabelModel>();

  public edgeModel = input.required<EdgeModel>();

  public point = input({ x: 0, y: 0 });

  public htmlTemplate = input<TemplateRef<any>>();

  public edgeLabelWrapperRef = viewChild.required<ElementRef<HTMLDivElement>>('edgeLabelWrapper');

  /**
   * Centered point of label
   *
   * TODO: maybe put it into EdgeLabelModel
   */
  protected edgeLabelPoint = computed(() => {
    const point = this.point();

    const { width, height } = this.model().size();

    return {
      x: point.x - width / 2,
      y: point.y - height / 2,
    };
  });

  public ngAfterViewInit(): void {
    resizable([this.edgeLabelWrapperRef().nativeElement], this.zone)
      .pipe(
        startWith(null),
        tap(() => {
          const width = this.edgeLabelWrapperRef().nativeElement.clientWidth + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME;
          const height = this.edgeLabelWrapperRef().nativeElement.clientHeight + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME;

          this.model().size.set({ width, height });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected getLabelContext() {
    return {
      $implicit: {
        edge: this.edgeModel().edge,
        label: this.model().edgeLabel,
      },
    };
  }
}
