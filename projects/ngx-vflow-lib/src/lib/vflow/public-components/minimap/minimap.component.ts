import { Component, computed, inject, Input, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';
import { NodeModel } from '../../models/node.model';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { getViewportForBounds } from '../../utils/viewport';
import { getNodesBounds } from '../../utils/nodes';
import { ViewportService } from '../../services/viewport.service';

type MinimapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

@Component({
  selector: 'minimap',
  templateUrl: './minimap.component.html',
  styleUrls: [`./minimap.component.scss`]
})
export class MinimapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService)
  protected flowSettingsService = inject(FlowSettingsService)
  protected viewportService = inject(ViewportService)

  @Input()
  public set position(value: MinimapPosition) {
    this.minimapPosition.set(value)
  }

  @ViewChild('minimap', { static: true })
  private minimap!: TemplateRef<unknown>

  private readonly minimapOffset = 10
  private readonly minimapScale = 0.2

  protected minimapPosition = signal<MinimapPosition>('bottom-right')

  protected minimapPoint = computed(() => {
    switch (this.minimapPosition()) {
      case 'top-left':
        return { x: this.minimapOffset, y: this.minimapOffset }
      case 'top-right':
        return {
          x: this.flowSettingsService.computedFlowWidth() - this.minimapWidth() - this.minimapOffset,
          y: this.minimapOffset
        }
      case 'bottom-left':
        return {
          x: this.minimapOffset,
          y: this.flowSettingsService.computedFlowHeight() - this.minimapHeight() - this.minimapOffset
        }
      case 'bottom-right':
        return {
          x: this.flowSettingsService.computedFlowWidth() - this.minimapWidth() - this.minimapOffset,
          y: this.flowSettingsService.computedFlowHeight() - this.minimapHeight() - this.minimapOffset
        }
    }
  })

  protected minimapWidth = computed(() =>
    this.flowSettingsService.computedFlowWidth() * this.minimapScale
  )
  protected minimapHeight = computed(() =>
    this.flowSettingsService.computedFlowHeight() * this.minimapScale
  )

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
    let scale = 1 / viewport.zoom

    let x = -(viewport.x * this.minimapScale) * scale
    x /= this.minimapScale

    let y = -(viewport.y * this.minimapScale) * scale
    y /= this.minimapScale

    scale /= this.minimapScale

    return `translate(${x}, ${y}) scale(${scale})`;
  });


  protected boundsViewport = computed(() => {
    const nodes = this.entitiesService.nodes()

    return getViewportForBounds(
      getNodesBounds(nodes),
      this.flowSettingsService.computedFlowWidth(),
      this.flowSettingsService.computedFlowHeight(),
      -Infinity,
      1.5,
      0
    )

  })

  protected minimapTransform = computed(() => {
    const vport = this.boundsViewport()

    const x = vport.x * this.minimapScale
    const y = vport.y * this.minimapScale
    const scale = vport.zoom * this.minimapScale

    return `translate(${x} ${y}) scale(${scale})`
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
