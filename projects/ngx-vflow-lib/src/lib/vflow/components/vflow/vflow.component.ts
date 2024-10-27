import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Injector, Input, OnChanges, OnInit, Output, Signal, SimpleChanges, ViewChild, computed, effect, inject, runInInjectionContext } from '@angular/core';
import { DynamicNode, Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportService } from '../../services/viewport.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import { ConnectionTemplateDirective, EdgeLabelHtmlTemplateDirective, EdgeTemplateDirective, GroupNodeTemplateDirective, NodeHtmlTemplateDirective } from '../../directives/template.directive';
import { HandlePositions } from '../../interfaces/handle-positions.interface';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
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
import { NodeRenderingService } from '../../services/node-rendering.service';
import { SelectionService } from '../../services/selection.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import { Background } from '../../types/background.type';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { FitViewOptions } from '../../interfaces/fit-view-options.interface';
import { Optimization } from '../../interfaces/optimization.interface';
import { KeyboardShortcuts } from '../../types/keyboard-action.type';
import { KeyboardService } from '../../services/keyboard.service';
import { transformBackground } from '../../utils/transform-background';

const connectionControllerHostDirective = {
  directive: ConnectionControllerDirective,
  outputs: ['onConnect']
}

const changesControllerHostDirective = {
  directive: ChangesControllerDirective,
  outputs: [
    'onNodesChange',
    'onNodesChange.position',
    'onNodesChange.position.single',
    'onNodesChange.position.many',
    'onNodesChange.size',
    'onNodesChange.size.single',
    'onNodesChange.size.many',
    'onNodesChange.add',
    'onNodesChange.add.single',
    'onNodesChange.add.many',
    'onNodesChange.remove',
    'onNodesChange.remove.single',
    'onNodesChange.remove.many',
    'onNodesChange.select',
    'onNodesChange.select.single',
    'onNodesChange.select.many',
    'onEdgesChange',
    'onEdgesChange.detached',
    'onEdgesChange.detached.single',
    'onEdgesChange.detached.many',
    'onEdgesChange.add',
    'onEdgesChange.add.single',
    'onEdgesChange.add.many',
    'onEdgesChange.remove',
    'onEdgesChange.remove.single',
    'onEdgesChange.remove.many',
    'onEdgesChange.select',
    'onEdgesChange.select.single',
    'onEdgesChange.select.many',
  ]
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
    EdgeChangesService,
    NodeRenderingService,
    SelectionService,
    FlowSettingsService,
    ComponentEventBusService,
    KeyboardService
  ],
  hostDirectives: [
    connectionControllerHostDirective,
    changesControllerHostDirective
  ]
})
export class VflowComponent implements OnInit {
  // #region DI
  private viewportService = inject(ViewportService)
  private flowEntitiesService = inject(FlowEntitiesService)
  private nodesChangeService = inject(NodesChangeService)
  private edgesChangeService = inject(EdgeChangesService)
  private nodeRenderingService = inject(NodeRenderingService)
  private flowSettingsService = inject(FlowSettingsService)
  private componentEventBusService = inject(ComponentEventBusService)
  private keyboardService = inject(KeyboardService)
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
    this.flowSettingsService.view.set(view)
  }

  /**
   * Minimum zoom value
   */
  @Input()
  public set minZoom(value: number) {
    this.flowSettingsService.minZoom.set(value)
  }

  /**
   * Maximum zoom value
   */
  @Input()
  public set maxZoom(value: number) {
    this.flowSettingsService.maxZoom.set(value)
  }

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
    this.flowSettingsService.handlePositions.set(handlePositions)
  }

  /**
   * Background for flow
   */
  @Input()
  public set background(value: Background | string) {
    this.flowSettingsService.background.set(transformBackground(value))
  }

  @Input()
  public optimization: Optimization = {
    computeLayersOnInit: true
  }

  /**
   * Global rule if you can or can't select entities
   */
  @Input()
  public set entitiesSelectable(value: boolean) {
    this.flowSettingsService.entitiesSelectable.set(value)
  }

  @Input()
  public set keyboardShortcuts(value: KeyboardShortcuts) {
    this.keyboardService.setShortcuts(value)
  }

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
  public set nodes(newNodes: Node[] | DynamicNode[]) {
    const newModels = runInInjectionContext(this.injector,
      () => ReferenceKeeper.nodes(newNodes, this.flowEntitiesService.nodes())
    )

    // quick and dirty binding nodes to edges
    addNodesToEdges(newModels, this.flowEntitiesService.edges())

    this.flowEntitiesService.nodes.set(newModels)
  }

  protected nodeModels = computed(() => this.nodeRenderingService.nodes())

  /**
   * Edges to render
   */
  @Input()
  public set edges(newEdges: Edge[]) {
    const newModels = runInInjectionContext(this.injector,
      () => ReferenceKeeper.edges(newEdges, this.flowEntitiesService.edges())
    )

    // quick and dirty binding nodes to edges
    addNodesToEdges(this.nodeModels(), newModels)

    this.flowEntitiesService.edges.set(newModels)
  }

  protected edgeModels = computed(() => this.flowEntitiesService.validEdges())
  // #endregion

  // #region OUTPUTS
  /**
   * Event that accumulates all custom node events
   *
   * @experimental
   */
  @Output()
  public onComponentNodeEvent = this.componentEventBusService.event$ as any // TODO: research how to remove as any
  // #endregion

  // #region TEMPLATES
  @ContentChild(NodeHtmlTemplateDirective)
  protected nodeTemplateDirective?: NodeHtmlTemplateDirective

  @ContentChild(GroupNodeTemplateDirective)
  protected groupNodeTemplateDirective?: GroupNodeTemplateDirective

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

  @ViewChild(SpacePointContextDirective)
  protected spacePointContext!: SpacePointContextDirective
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
   * Observable with edges change
   */
  public readonly edgesChange$ = this.edgesChangeService.changes$
  // #endregion

  protected markers = this.flowEntitiesService.markers

  protected minimap = this.flowEntitiesService.minimap

  public ngOnInit(): void {
    this.setInitialNodesOrder()
  }

  // #region METHODS_API
  /**
   * Change viewport to specified state
   *
   * @param viewport viewport state
   */
  public viewportTo(viewport: ViewportState): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: viewport, duration: 0 })
  }

  /**
   * Change zoom
   *
   * @param zoom zoom value
   */
  public zoomTo(zoom: number): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: { zoom }, duration: 0 })
  }

  /**
   * Move to specified coordinate
   *
   * @param point point where to move
   */
  public panTo(point: Point): void {
    this.viewportService.writableViewport.set({ changeType: 'absolute', state: point, duration: 0 })
  }

  public fitView(options?: FitViewOptions) {
    this.viewportService.fitView(options)
  }

  /**
   * Get node by id
   *
   * @param id node id
   */
  public getNode<T = unknown>(id: string): Node<T> | DynamicNode<T> | undefined {
    return this.flowEntitiesService.getNode<T>(id)?.node
  }

  /**
   * Sync method to get detached edges
   */
  public getDetachedEdges(): Edge[] {
    return this.flowEntitiesService.getDetachedEdges().map(e => e.edge)
  }

  /**
   * Convert point received from document to point on the flow
   */
  public documentPointToFlowPoint(point: Point): Point {
    return this.spacePointContext.documentPointToFlowPoint(point)
  }
  // #endregion

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node
  }

  protected trackEdges(idx: number, { edge }: EdgeModel) {
    return edge
  }

  private setInitialNodesOrder() {
    if (this.optimization.computeLayersOnInit) {

      this.nodeModels().forEach(model => {
        switch (model.node.type) {
          case 'default-group':
          case 'template-group': {
            this.nodeRenderingService.pullNode(model)
          }
        }
      })
    }
  }
}

