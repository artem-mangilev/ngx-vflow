import { ChangeDetectionStrategy, Component, TemplateRef, computed, inject, input } from '@angular/core';
import { EdgeLabelModel } from '../../models/edge-label.model';
import { EdgeModel } from '../../models/edge.model';
import { NgTemplateOutlet } from '@angular/common';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { HtmlEdgeLabelContext } from '../../interfaces/template-context.interface';
import { HtmlTemplateEdgeLabel } from '../../interfaces/edge-label.interface';

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
    '[style.transform]': 'transform()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class EdgeLabelComponent {
  private settingsService = inject(FlowSettingsService);
  // TODO: too many inputs
  public model = input.required<EdgeLabelModel>();

  public edgeModel = input.required<EdgeModel>();

  public point = input({ x: 0, y: 0 });

  public htmlTemplate = input<TemplateRef<any>>();

  protected transform = computed(() => {
    const { x, y } = this.point();

    return `translate(${x}px, ${y}px)`;
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
