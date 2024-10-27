import { Component, computed, inject, Injector, Input, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MinimapModel } from '../../models/minimap.model';
import { NodeModel } from '../../models/node.model';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { getViewportForBounds } from '../../utils/viewport';
import { getNodesBounds } from '../../utils/nodes';
import { ViewportService } from '../../services/viewport.service';

export type MiniMapPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

@Component({
  selector: 'mini-map',
  templateUrl: './minimap.component.html',
  styleUrls: [`./minimap.component.scss`]
})
export class MiniMapComponent implements OnInit {
  protected entitiesService = inject(FlowEntitiesService)
  protected flowSettingsService = inject(FlowSettingsService)
  protected viewportService = inject(ViewportService)
  protected injector = inject(Injector)

  /**
   * The corner of the flow where to render a mini-map
   */
  @Input()
  public set position(value: MiniMapPosition) {
    this.minimapPosition.set(value)
  }

  /**
   * The color outside the viewport (invisible area)
   */
  @Input()
  public maskColor = `rgba(215, 215, 215, 0.6)`

  /**
   * The minimap stroke color
   */
  @Input()
  public strokeColor = `rgb(200, 200, 200)`

  /**
   * Make a minimap bigger on hover
   */
  @Input()
  public set scaleOnHover(value: boolean) {
    this.scaleOnHoverSignal.set(value)
  }

  @ViewChild('minimap', { static: true })
  private minimap!: TemplateRef<unknown>

  private readonly minimapOffset = 10

  private readonly minimapScale = computed(() => {
    if (this.scaleOnHoverSignal()) {
      return this.hovered() ? 0.4 : 0.2
    }

    return 0.2
  })

  protected viewportColor = computed(() => this.flowSettingsService.background().color ?? '#fff')

  protected hovered = signal(false)

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
    this.flowSettingsService.computedFlowWidth() * this.minimapScale()
  )
  protected minimapHeight = computed(() =>
    this.flowSettingsService.computedFlowHeight() * this.minimapScale()
  )

  protected viewportTransform = computed(() => {
    const viewport = this.viewportService.readableViewport();
    let scale = 1 / viewport.zoom

    let x = -(viewport.x * this.minimapScale()) * scale
    x /= this.minimapScale()

    let y = -(viewport.y * this.minimapScale()) * scale
    y /= this.minimapScale()

    scale /= this.minimapScale()

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

    const x = vport.x * this.minimapScale()
    const y = vport.y * this.minimapScale()
    const scale = vport.zoom * this.minimapScale()

    return `translate(${x} ${y}) scale(${scale})`
  })

  private minimapPosition = signal<MiniMapPosition>('bottom-right')

  private scaleOnHoverSignal = signal(false)

  public ngOnInit(): void {
    const model = new MinimapModel()
    model.template.set(this.minimap)

    this.entitiesService.minimap.set(model)
  }

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node
  }
}
