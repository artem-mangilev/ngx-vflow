import { ChangeDetectionStrategy, Component, ContentChild, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ZoomService } from '../../services/zoom.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import { EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, NodeHtmlTemplateDirective } from '../../directives/template.directive';
import { HandlePositions } from '../../interfaces/handle-positions.interface';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
import { FlowModel } from '../../models/flow.model';

@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DraggableService, ZoomService]
})
export class VflowComponent implements OnChanges {
  // #region DI
  protected zoomService = inject(ZoomService)
  // #endregion

  // #region SETTINGS

  /**
   * Size for flow view
   *
   * accepts
   * - absolute size in format [width, height] or
   * - 'auto' to compute size based on parent element size
   */
  @Input()
  public view: [number, number] | 'auto' = [400, 400]

  @Input()
  public minZoom = 0.5

  @Input()
  public maxZoom = 3

  @Input()
  public set zoom(value: number) {
    this.zoomService.zoom.set(value)
  }

  @Input()
  public set handlePositions(handlePositions: HandlePositions) {
    this.flowModel.handlePositions.set(handlePositions)
  }

  @Input()
  public background: string = '#FFFFFF'

  // #endregion

  // #region MAIN_DATA
  @Input({ required: true, transform: (nodes: Node[]) => nodes.map(n => new NodeModel(n)) })
  public nodes: NodeModel[] = []

  @Input({ transform: (edges: Edge[]) => edges.map(e => new EdgeModel(e)) })
  public edges: EdgeModel[] = []
  // #endregion

  // #region TEMPLATES
  @ContentChild(NodeHtmlTemplateDirective)
  protected nodeHtmlDirective?: NodeHtmlTemplateDirective

  @ContentChild(EdgeTemplateDirective)
  protected edgeTemplateDirective?: EdgeTemplateDirective

  @ContentChild(EdgeLabelHtmlTemplateDirective)
  protected edgeLabelHtmlDirective?: EdgeLabelHtmlTemplateDirective
  // #endregion

  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective

  // TODO: probably better to make it injectable
  private flowModel = new FlowModel()

  public readonly zoomPanSignal = this.zoomService.zoomPan

  public readonly zoomPan$ = toObservable(this.zoomService.zoomPan)

  protected get flowWidth() {
    return this.view === 'auto' ? '100%' : this.view[0]
  }

  protected get flowHeight() {
    return this.view === 'auto' ? '100%' : this.view[1]
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) bindFlowToNodes(this.flowModel, this.nodes)
    if (changes['edges']) addNodesToEdges(this.nodes, this.edges)
  }

  public zoomTo(value: number) {
    this.zoomService.zoom.set(value)
  }

  public panTo(x: number, y: number) {
    this.zoomService.pan.set({ x, y })
  }

  protected trackById(idx: number, { node }: NodeModel) {
    return node.id
  }
}

function bindFlowToNodes(flow: FlowModel, nodes: NodeModel[]) {
  nodes.forEach(n => n.bindFlow(flow))
}
