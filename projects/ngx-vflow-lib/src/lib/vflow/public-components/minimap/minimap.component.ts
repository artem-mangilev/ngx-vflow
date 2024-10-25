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

  @ViewChild('minimap', { static: true })
  private minimap!: TemplateRef<unknown>

  protected clipPathId = signal(id())
  protected clipPathUrl = computed(() => `url(#${this.clipPathId()})`)

  protected minimapWidth = computed(() => this.flowSettingsService.computedFlowWidth() * 0.2)
  protected minimapHeight = computed(() => this.flowSettingsService.computedFlowHeight() * 0.2)

  protected minimapTransform = computed(() => {
    const nodes = this.entitiesService.nodes()

    const state = getViewportForBounds(
      getNodesBounds(nodes),
      this.flowSettingsService.computedFlowWidth(),
      this.flowSettingsService.computedFlowHeight(),
      this.flowSettingsService.minZoom(),
      this.flowSettingsService.maxZoom(),
      0
    )

    return `translate(${state.x * 0.2}, ${state.y * 0.2}) scale(${state.zoom * 0.2})`
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
