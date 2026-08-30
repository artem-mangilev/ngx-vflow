import {
  Component,
  computed,
  inject,
  Injector,
  OnInit,
  TemplateRef,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';
import { NodeModel } from '../../models/node.model';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { getViewportForBounds } from '../../utils/viewport';
import { getNodesFlowBounds } from '../../utils/nodes';
import { ViewportService } from '../../services/viewport.service';

export type MiniMapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Component({
  selector: 'mini-map',
  templateUrl: './minimap.component.html',
  styleUrls: [`./minimap.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniMapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService);
  protected flowSettingsService = inject(FlowSettingsService);
  protected viewportService = inject(ViewportService);
  protected injector = inject(Injector);

  /**
   * The color outside the viewport (invisible area)
   */
  public maskColor = input(`rgba(215, 215, 215, 0.6)`);

  /**
   * The minimap stroke color
   */
  public strokeColor = input(`rgb(200, 200, 200)`);

  /**
   * The corner of the flow where to render a mini-map
   */
  public position = input<MiniMapPosition>('bottom-right');

  private minimap = viewChild.required<TemplateRef<unknown>>('minimap');

  private readonly minimapOffset = 10;
  private readonly minimapScale = 0.2;

  protected viewportColor = computed(() => {
    const bg = this.flowSettingsService.background();

    if (bg.type === 'dots' || bg.type === 'solid') {
      return bg.color ?? '#fff';
    }

    return '#fff';
  });

  protected minimapPoint = computed(() => {
    switch (this.position()) {
      case 'top-left':
        return { x: this.minimapOffset, y: this.minimapOffset };
      case 'top-right':
        return {
          x: this.flowSettingsService.computedFlowWidth() - this.minimapWidth() - this.minimapOffset,
          y: this.minimapOffset,
        };
      case 'bottom-left':
        return {
          x: this.minimapOffset,
          y: this.flowSettingsService.computedFlowHeight() - this.minimapHeight() - this.minimapOffset,
        };
      case 'bottom-right':
        return {
          x: this.flowSettingsService.computedFlowWidth() - this.minimapWidth() - this.minimapOffset,
          y: this.flowSettingsService.computedFlowHeight() - this.minimapHeight() - this.minimapOffset,
        };
    }
  });

  protected minimapWidth = computed(() => this.flowSettingsService.computedFlowWidth() * this.minimapScale);
  protected minimapHeight = computed(() => this.flowSettingsService.computedFlowHeight() * this.minimapScale);

  protected viewportTransform = computed(() => {
    const viewport = this.viewportService.readableViewport();
    let scale = 1 / viewport.zoom;

    let x = -(viewport.x * this.minimapScale) * scale;
    x /= this.minimapScale;

    let y = -(viewport.y * this.minimapScale) * scale;
    y /= this.minimapScale;

    scale /= this.minimapScale;

    return `translate(${x}, ${y}) scale(${scale})`;
  });

  protected boundsViewport = computed(() => {
    const nodes = this.entitiesService.nodes();
    const width = this.flowSettingsService.computedFlowWidth();
    const height = this.flowSettingsService.computedFlowHeight();

    if (!nodes.length || width <= 0 || height <= 0) return { x: 0, y: 0, zoom: 1 };

    return getViewportForBounds(getNodesFlowBounds(nodes), width, height, Number.MIN_VALUE, 1.5, 0);
  });

  protected minimapTransform = computed(() => {
    const vport = this.boundsViewport();

    const x = vport.x * this.minimapScale;
    const y = vport.y * this.minimapScale;
    const scale = vport.zoom * this.minimapScale;

    return `translate(${x} ${y}) scale(${scale})`;
  });

  public ngOnInit(): void {
    const model = new MinimapModel();
    model.template.set(this.minimap());

    this.entitiesService.minimap.set(model);
  }

  protected trackNodes(idx: number, { rawNode }: NodeModel) {
    return rawNode;
  }
}
