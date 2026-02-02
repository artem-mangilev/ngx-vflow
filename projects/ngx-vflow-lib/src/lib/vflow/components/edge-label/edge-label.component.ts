import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { EdgeLabelModel } from '../../models/edge-label.model';
import { EdgeModel } from '../../models/edge.model';
import { NgTemplateOutlet } from '@angular/common';
import { MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME } from '../../constants/magic-number-to-fix-glitch-in-chrome.constant';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { HtmlEdgeLabelContext } from '../../interfaces/template-context.interface';
import { HtmlTemplateEdgeLabel } from '../../interfaces/edge-label.interface';
import { ResizeObserverService } from '../../services/resize-observer.service';
import { ElementCacheService } from '../../services/element-cache.service';
import { RequestAnimationFrameBatchingService } from '../../services/request-animation-frame-batching.service';

@Component({
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
export class EdgeLabelComponent implements AfterViewInit, OnDestroy {
  private settingsService = inject(FlowSettingsService);
  private resizeObserverService = inject(ResizeObserverService);
  private elementCacheService = inject(ElementCacheService);
  private requestAnimationFrameBatchService = inject(RequestAnimationFrameBatchingService);

  // TODO: too many inputs
  public model = input.required<EdgeLabelModel>();

  public edgeModel = input.required<EdgeModel>();

  public point = input({ x: 0, y: 0 });

  public htmlTemplate = input<TemplateRef<any>>();

  public edgeLabelWrapperRef = viewChild.required<ElementRef<Element>>('edgeLabelWrapper');

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

  protected edgeLabelStyle = computed(() => {
    const label = this.model().edgeLabel;

    if (label.type === 'default' && label.style) {
      const flowBackground = this.settingsService.background();

      let color = 'transparent';

      if (flowBackground.type === 'dots') {
        color = flowBackground.backgroundColor ?? '#fff';
      }

      if (flowBackground.type === 'solid') {
        color = flowBackground.color;
      }

      label.style.backgroundColor = label.style.backgroundColor ?? color;

      return label.style;
    }

    return null;
  });

  public ngAfterViewInit(): void {
    const labelElement = this.edgeLabelWrapperRef().nativeElement;
    this.elementCacheService.addElementCache({ element: labelElement, type: 'basicElement' });

    this.resizeObserverService.addObserver(labelElement, () => {
      this.updateModelSize();
    });

    //force run the first time since previous implementation used startWith(null) to force a first initialization
    //inside animation frame callback otherwise we ngAfterViewInit calls in between each edge label create
    this.requestAnimationFrameBatchService.batchAnimationFrame(() => {
      this.updateModelSize();
    });
  }

  public ngOnDestroy(): void {
    const labelElement = this.edgeLabelWrapperRef().nativeElement;
    this.elementCacheService.removeElementCache({ element: labelElement, type: 'basicElement' });
    this.resizeObserverService.removeObserver(labelElement);
  }

  // TODO: move to model with Contextable interface
  protected getLabelContext(): HtmlEdgeLabelContext {
    return {
      $implicit: {
        edge: this.edgeModel().edge,
        label: this.model().edgeLabel as HtmlTemplateEdgeLabel,
      },
    };
  }

  private updateModelSize() {
    const labelElement = this.edgeLabelWrapperRef().nativeElement;
    this.elementCacheService.markCacheAsDirty();
    let labelData = this.elementCacheService.getElementData({ element: labelElement, type: 'basicElement' });
    if (labelData === undefined) {
      //Ideally we never get here but in case we do, fallback to request a reflow of the layout.
      labelData = {
        clientWidth: labelElement.clientWidth,
        clientHeight: labelElement.clientHeight,
      };
    }

    const width = labelData.clientWidth + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME;
    const height = labelData.clientHeight + MAGIC_NUMBER_TO_FIX_GLITCH_IN_CHROME;
    this.model().size.set({ width, height });
  }
}
