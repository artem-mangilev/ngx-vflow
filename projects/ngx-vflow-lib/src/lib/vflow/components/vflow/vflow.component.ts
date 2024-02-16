import { ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportService } from '../../services/viewport.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, NodeHtmlTemplateDirective } from '../../directives/template.directive';
import { HandlePositions } from '../../interfaces/handle-positions.interface';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
import { FlowModel } from '../../models/flow.model';
import { skip } from 'rxjs';
import { Point } from '../../interfaces/point.interface';
import { ViewportState } from '../../interfaces/viewport.interface';
import { FlowStatusService } from '../../services/flow-status.service';
import { ConnectionControllerDirective } from '../../directives/connection-controller.directive';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { ConnectionModel } from '../../models/connection.model';

const connectionControllerHostDirective = {
  directive: ConnectionControllerDirective,
  outputs: ['onConnect']
}

@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  styleUrls: ['./vflow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DraggableService,
    ViewportService,
    FlowStatusService,
    FlowEntitiesService
  ],
  hostDirectives: [connectionControllerHostDirective]
})
export class VflowComponent implements OnChanges {
  // #region DI
  protected viewportService = inject(ViewportService)
  protected flowEntitiesService = inject(FlowEntitiesService)
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

  @Input({ transform: (settings: ConnectionSettings) => new ConnectionModel(settings) })
  public set connection(connection: ConnectionModel) { this.flowEntitiesService.connection.set(connection) }
  public get connection() { return this.flowEntitiesService.connection() }
  // #endregion

  // #region MAIN_INPUTS
  @Input({ required: true, transform: (nodes: Node[]) => nodes.map(n => new NodeModel(n)) })
  public set nodes(nodes: NodeModel[]) { this.flowEntitiesService.nodes.set(nodes) }
  public get nodes() { return this.flowEntitiesService.nodes() }

  // TODO: write some logic to keep old models when references inside Edge[] list not changed compared to prev input trigger
  @Input({ transform: (edges: Edge[]) => edges.map(e => new EdgeModel(e)) })
  public set edges(edges: EdgeModel[]) { this.flowEntitiesService.edges.set(edges) }
  public get edges() { return this.flowEntitiesService.edges() }

  // #endregion

  // #region TEMPLATES
  @ContentChild(NodeHtmlTemplateDirective)
  protected nodeHtmlDirective?: NodeHtmlTemplateDirective

  @ContentChild(EdgeTemplateDirective)
  protected edgeTemplateDirective?: EdgeTemplateDirective

  @ContentChild(EdgeLabelHtmlTemplateDirective)
  protected edgeLabelHtmlDirective?: EdgeLabelHtmlTemplateDirective

  @ContentChild(ConnectionTemplateDirective)
  protected connectionTemplateDirective?: ConnectionTemplateDirective
  // #endregion

  // #region DIRECTIVES
  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective
  // #endregion

  // #region SIGNAL_API
  public readonly viewport = this.viewportService.readableViewport.asReadonly()
  // #endregion

  // #region RX_API
  public readonly viewportChanges$ = toObservable(this.viewportService.readableViewport)
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
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: viewport })
  }

  public zoomTo(zoom: number) {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: { zoom } })
  }

  public panTo(point: Point) {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: point })
  }
  // #endregion

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node.id
  }

  protected trackEdges(idx: number, { edge }: EdgeModel) {
    return edge.id
  }
}

function bindFlowToNodes(flow: FlowModel, nodes: NodeModel[]) {
  nodes.forEach(n => n.bindFlow(flow))
}
