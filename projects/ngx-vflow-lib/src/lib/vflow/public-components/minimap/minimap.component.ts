import { Component, computed, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';
import { NodeModel } from '../../models/node.model';
import { id } from '../../utils/id';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { getViewportForBounds } from '../../utils/viewport';
import { getNodesBounds } from '../../utils/nodes';
import { ViewportService } from '../../services/viewport.service';

@Component({
  selector: 'minimap',
  templateUrl: './minimap.component.html',
  styleUrls: [`./minimap.component.scss`]
})
export class MinimapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService)
  protected flowSettingsService = inject(FlowSettingsService)
  protected viewportService = inject(ViewportService)

  @ViewChild('minimap', { static: true })
  private minimap!: TemplateRef<unknown>

  private readonly minimapScale = 0.2

  protected clipPathId = signal(id())
  protected clipPathUrl = computed(() => `url(#${this.clipPathId()})`)

  protected minimapWidth = computed(() => this.flowSettingsService.computedFlowWidth() * this.minimapScale)
  protected minimapHeight = computed(() => this.flowSettingsService.computedFlowHeight() * this.minimapScale)

  protected viewportWidth = computed(() => {
    const width = this.flowSettingsService.computedFlowWidth()
    const zoom = this.viewportService.readableViewport().zoom

    return (width / zoom) * this.minimapScale
  });
  protected viewportHeight = computed(() => {
    const height = this.flowSettingsService.computedFlowHeight()
    const zoom = this.viewportService.readableViewport().zoom

    return (height / zoom) * this.minimapScale
  });

  protected viewportTransform = computed(() => {
    const viewport = this.viewportService.readableViewport();
    const scale = 1 / viewport.zoom
    const x = -(viewport.x * this.minimapScale) * scale
    const y = -(viewport.y * this.minimapScale) * scale

    return `translate(${x}, ${y}) scale(${scale})`;
  });

  protected boundsViewport = computed(() => {
    const nodes = this.entitiesService.nodes()

    return getViewportForBounds(
      getNodesBounds(nodes),
      this.flowSettingsService.computedFlowWidth(),
      this.flowSettingsService.computedFlowHeight(),
      this.flowSettingsService.minZoom(),
      this.flowSettingsService.maxZoom(),
      0
    )

  })

  protected minimapTransform = computed(() => {
    return `scale(${this.minimapScale})`
  })

  public ngOnInit(): void {
    const model = new MinimapModel()
    model.template.set(this.minimap)

    this.entitiesService.minimap.set(model)
  }

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node
  }
}
