import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { EdgeModel } from '../../models/edge.model';
import { EdgeLabelOrient, EdgeLabelPosition } from '../../interfaces/edge-label.interface';
import { FlowRenderingService } from '../../services/flow-rendering.service';

/** Brings an angle into `(-90, 90]`, so that text turned by it reads left to right. */
export function readableAngle(angle: number): number {
  let readable = angle;
  while (readable > 90) {
    readable -= 180;
  }
  while (readable <= -90) {
    readable += 180;
  }
  return readable;
}

/**
 * Renders one `ng-template[vEdgeLabel]` of an edge in the HTML label layer at its point of the path. The template has
 * no context: it closes over the edge presentation that declares it and resolves the edge through that declaration.
 */
@Component({
  selector: 'div[edgeLabelHost]',
  templateUrl: './edge-label.component.html',
  styles: [
    `
      :host {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        pointer-events: none;
      }

      .v-edge-label-wrapper {
        width: max-content;
        transform: translate(-50%, -50%);
        pointer-events: all;
      }
    `,
  ],
  // No signal reads in host bindings: see NodeComponent.
  host: {
    '(focusin)': 'edgeModel().focused.set(true)',
    '(focusout)': 'edgeModel().focused.set(false)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class EdgeLabelComponent {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public edgeModel = input.required<EdgeModel>();

  public position = input.required<EdgeLabelPosition>();

  public template = input.required<TemplateRef<unknown>>();

  /** With `path`, the label turns by the angle of its point; the wrapper is centered, so it turns in place. */
  public orient = input<EdgeLabelOrient>('horizontal');

  protected point = computed(() => this.edgeModel().path().labelPoints?.[this.position()]);

  constructor() {
    const flowRendering = inject(FlowRenderingService);

    effect(() => {
      this.element.style.zIndex = String(this.edgeModel().renderOrder());
    });
    effect(() => {
      const model = this.edgeModel();
      const hidden = flowRendering.hiddenUntil(model.isReady()) || model.reconnecting();
      this.element.style.visibility = hidden ? 'hidden' : '';
    });
    effect(() => {
      const point = this.point();
      if (!point) {
        this.element.style.transform = '';
        return;
      }
      const angle = this.orient() === 'path' && point.angle !== undefined ? readableAngle(point.angle) : 0;
      this.element.style.transform = `translate(${point.x}px, ${point.y}px)${angle ? ` rotate(${angle}deg)` : ''}`;
    });
  }
}
