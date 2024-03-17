import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Injector, Input, OnChanges, Output, Signal, SimpleChanges, ViewChild, computed, effect, inject, runInInjectionContext } from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportService } from '../../services/viewport.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, HandleTemplateDirective, NodeHtmlTemplateDirective } from '../../directives/template.directive';
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
import { ReferenceKeeper } from '../../utils/reference-keeper';
import { NodesChangeService } from '../../services/node-changes.service';
import { EdgeChangesService } from '../../services/edge-changes.service';
import { NodeChange } from '../../types/node-change.type';
import { ChangesControllerDirective } from '../../directives/changes-controller.directive';
import { EdgeChange } from '../../types/edge-change.type';

const connectionControllerHostDirective = {
  directive: ConnectionControllerDirective,
  outputs: ['onConnect']
}

const changesControllerHostDirective = {
  directive: ChangesControllerDirective,
  outputs: ['onNodesChange', 'onEdgesChange']
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
    FlowEntitiesService,
    NodesChangeService,
    EdgeChangesService
  ],
  hostDirectives: [
    connectionControllerHostDirective,
    changesControllerHostDirective
  ]
})
export class VflowComponent {
  // #region DI
  protected viewportService = inject(ViewportService)
  protected flowEntitiesService = inject(FlowEntitiesService)
  protected nodesChangeService = inject(NodesChangeService)
  protected edgesChangeService = inject(EdgeChangesService)
  protected injector = inject(Injector)
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
  @Input({ required: true })
  public set nodes(newNodes: Node[]) {
    const newModels = runInInjectionContext(this.injector,
      () => ReferenceKeeper.nodes(newNodes, this.flowEntitiesService.nodes())
    )

    // TODO better to solve this by DI
    bindFlowToNodes(this.flowModel, newModels)

    // quick and dirty binding nodes to edges
    addNodesToEdges(newModels, this.flowEntitiesService.edges())

    this.flowEntitiesService.nodes.set(newModels)
  }

  public get nodeModels() { return this.flowEntitiesService.nodes() }

  @Input()
  public set edges(newEdges: Edge[]) {
    const newModels = ReferenceKeeper.edges(newEdges, this.flowEntitiesService.edges())

    // quick and dirty binding nodes to edges
    addNodesToEdges(this.nodeModels, newModels)

    this.flowEntitiesService.edges.set(newModels)
  }

  public get edgeModels() { return this.flowEntitiesService.validEdges() }
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

  @ContentChild(HandleTemplateDirective)
  protected handleTemplateDirective?: HandleTemplateDirective
  // #endregion

  // #region DIRECTIVES
  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective
  // #endregion

  // #region SIGNAL_API
  public readonly viewport = this.viewportService.readableViewport.asReadonly()

  public readonly nodesChange =
    toSignal(this.nodesChangeService.changes$, { initialValue: [] as NodeChange[] })

  public readonly edgesChange =
    toSignal(this.edgesChangeService.changes$, { initialValue: [] as EdgeChange[] })
  // #endregion

  // #region RX_API
  public readonly viewportChanges$ = toObservable(this.viewportService.readableViewport)
    .pipe(skip(1)) // skip default value that set by signal

  public readonly nodesChange$ = this.nodesChangeService.changes$

  public readonly edgesChange$ = this.edgesChangeService.changes$
  // #endregion

  // TODO: probably better to make it injectable
  protected flowModel = new FlowModel()

  protected markers = this.flowEntitiesService.markers

  // #region METHODS_API
  public viewportTo(viewport: ViewportState): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: viewport })
  }

  public zoomTo(zoom: number): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: { zoom } })
  }

  public panTo(point: Point): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: point })
  }

  public getNode<T = unknown>(id: string): Node<T> | undefined {
    return this.flowEntitiesService.getNode<T>(id)?.node
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

