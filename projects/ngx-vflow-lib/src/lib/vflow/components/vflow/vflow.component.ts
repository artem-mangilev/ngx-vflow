import { ChangeDetectionStrategy, Component, ContentChild, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportState, ZoomService } from '../../services/zoom.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import { EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, NodeHtmlTemplateDirective } from '../../directives/template.directive';
import { HandlePositions } from '../../interfaces/handle-positions.interface';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
import { FlowModel } from '../../models/flow.model';
import { skip } from 'rxjs';

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
  public set view(view: [number, number] | 'auto') {
    this.flowModel.view.set(view)
  }

  @Input()
  public minZoom = 0.5

  @Input()
  public maxZoom = 3

  @Input()
  public set handlePositions(handlePositions: HandlePositions) {
    this.flowModel.handlePositions.set(handlePositions)
  }

  @Input()
  public background: string = '#FFFFFF'

  // #endregion

  // #region MAIN_INPUTS
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

  // #region DIRECTIVES
  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective
  // #endregion

  // #region SIGNAL_API
  public readonly viewport = this.zoomService.readableViewport.asReadonly()
  // #endregion

  // #region RX_API
  public readonly viewportChanges$ = toObservable(this.zoomService.readableViewport)
    .pipe(skip(1)) // skip default value that set by signal
  // #endregion

  // TODO: probably better to make it injectable
  protected flowModel = new FlowModel()

  // #region ANGULAR_HOOKS
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['nodes']) bindFlowToNodes(this.flowModel, this.nodes)
    if (changes['edges']) addNodesToEdges(this.nodes, this.edges)
  }
  // #endregion

  // #region METHODS_API
  public viewportTo(viewport: ViewportState) {
    this.zoomService.writableViewport.set(viewport)
  }
  // #endregion

  protected trackById(idx: number, { node }: NodeModel) {
    return node.id
  }
}

function bindFlowToNodes(flow: FlowModel, nodes: NodeModel[]) {
  nodes.forEach(n => n.bindFlow(flow))
}
