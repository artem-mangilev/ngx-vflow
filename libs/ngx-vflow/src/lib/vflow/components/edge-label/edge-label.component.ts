import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { EdgeLabelModel } from '../../models/edge-label.model';
import { EdgeModel } from '../../models/edge.model';
import { NgTemplateOutlet } from '@angular/common';
import { HtmlEdgeLabelContext } from '../../interfaces/template-context.interface';
import { EdgeLabelPosition, HtmlTemplateEdgeLabel } from '../../interfaces/edge-label.interface';

@Component({
  selector: 'div[edgeLabel]',
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

      .edge-label-wrapper {
        width: max-content;
        transform: translate(-50%, -50%);
        pointer-events: all;
      }
    `,
  ],
  host: {
    '(focusin)': 'edgeModel().focused.set(true)',
    '(focusout)': 'edgeModel().focused.set(false)',
    '[style.visibility]': 'edgeModel().isReady() && !edgeModel().reconnecting() ? "visible" : "hidden"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class EdgeLabelComponent {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  // TODO: too many inputs
  public model = input.required<EdgeLabelModel>();

  public edgeModel = input.required<EdgeModel>();

  public position = input.required<EdgeLabelPosition>();

  protected point = computed(() => this.edgeModel().path().labelPoints?.[this.position()]);

  public htmlTemplate = input<TemplateRef<any>>();

  constructor() {
    effect(() => {
      this.element.style.zIndex = String(this.edgeModel().renderOrder());
    });
    effect(() => {
      const point = this.point();
      this.element.style.transform = point ? `translate(${point.x}px, ${point.y}px)` : '';
    });
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
}
