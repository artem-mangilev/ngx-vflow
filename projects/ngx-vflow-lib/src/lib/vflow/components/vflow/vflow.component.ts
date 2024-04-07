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
  private viewportService = inject(ViewportService)
  private flowEntitiesService = inject(FlowEntitiesService)
  private nodesChangeService = inject(NodesChangeService)
  private edgesChangeService = inject(EdgeChangesService)
  private injector = inject(Injector)
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

  /**
   * Minimum zoom value
   */
  @Input()
  public minZoom = 0.5

  /**
   * Maximum zoom value
   */
  @Input()
  public maxZoom = 3

  /**
   * Object that controls flow direction.
   *
   * For example, if you want to archieve right to left direction
   * then you need to pass these positions { source: 'left', target: 'right' }
   *
   * @deprecated
   */
  @Input()
  public set handlePositions(handlePositions: HandlePositions) {
    this.flowModel.handlePositions.set(handlePositions)
  }

  /**
   * Background color for flow
   */
  @Input()
  public background: string = '#FFFFFF'

  /**
   * Settings for connection (it renders when user tries to create edge between nodes)
   *
   * You need to pass `ConnectionSettings` in this input.
   */
  @Input({ transform: (settings: ConnectionSettings) => new ConnectionModel(settings) })
  public set connection(connection: ConnectionModel) { this.flowEntitiesService.connection.set(connection) }

  public get connection() { return this.flowEntitiesService.connection() }
  // #endregion

  // #region MAIN_INPUTS
  /**
   * Nodes to render
   */
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

  protected get nodeModels() { return this.flowEntitiesService.nodes() }

  /**
   * Edges to render
   */
  @Input()
  public set edges(newEdges: Edge[]) {
    const newModels = ReferenceKeeper.edges(newEdges, this.flowEntitiesService.edges())

    // quick and dirty binding nodes to edges
    addNodesToEdges(this.nodeModels, newModels)

    this.flowEntitiesService.edges.set(newModels)
  }

  protected get edgeModels() { return this.flowEntitiesService.validEdges() }
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
  /**
   * Signal for reading viewport change
   */
  public readonly viewport = this.viewportService.readableViewport.asReadonly()

  /**
   * Signal for reading nodes change
   */
  public readonly nodesChange =
    toSignal(this.nodesChangeService.changes$, { initialValue: [] as NodeChange[] })

  /**
   * Signal to reading edges change
   */
  public readonly edgesChange =
    toSignal(this.edgesChangeService.changes$, { initialValue: [] as EdgeChange[] })
  // #endregion

  // #region RX_API
  /**
   * Observable with viewport change
   */
  public readonly viewportChange$ = toObservable(this.viewportService.readableViewport)
    .pipe(skip(1)) // skip default value that set by signal

  /**
   * Observable with nodes change
   */
  public readonly nodesChange$ = this.nodesChangeService.changes$

  /**
   * Observable with nodes change
   */
  public readonly edgesChange$ = this.edgesChangeService.changes$
  // #endregion

  // TODO: probably better to make it injectable
  protected flowModel = new FlowModel()

  protected markers = this.flowEntitiesService.markers

  // #region METHODS_API
  /**
   * Change viewport to specified state
   *
   * @param viewport viewport state
   */
  public viewportTo(viewport: ViewportState): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: viewport })
  }

  /**
   * Change zoom
   *
   * @param zoom zoom value
   */
  public zoomTo(zoom: number): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: { zoom } })
  }

  /**
   * Move to specified coordinate
   *
   * @param point point where to move
   */
  public panTo(point: Point): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: point })
  }

  /**
   * Get node by id
   *
   * @param id node id
   */
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

