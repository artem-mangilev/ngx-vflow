import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  inject,
  runInInjectionContext,
  contentChild,
  viewChild,
  input,
  computed,
} from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportService } from '../../services/viewport.service';
import { toObservable, outputFromObservable } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import {
  ConnectionTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  GroupNodeTemplateDirective,
  NodeHtmlTemplateDirective,
} from '../../directives/template.directive';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
import { skip } from 'rxjs/operators';
import { Point } from '../../interfaces/point.interface';
import { ViewportState } from '../../interfaces/viewport.interface';
import { FlowStatusService } from '../../services/flow-status.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { ConnectionModel } from '../../models/connection.model';
import { ReferenceIdentityChecker } from '../../utils/identity-checker/reference-identity-checker';
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
import { SelectionMode } from '../../types/selection-mode.type';
import { KeyboardService } from '../../services/keyboard.service';
import { transformBackground } from '../../utils/transform-background';
import { OverlaysService } from '../../services/overlays.service';
import { ToolbarModel } from '../../models/toolbar.model';
import { NgTemplateOutlet } from '@angular/common';
import { EdgeComponent } from '../edge/edge.component';
import { EdgeLabelComponent } from '../edge-label/edge-label.component';
import { NodeComponent } from '../node/node.component';
import { ConnectionComponent } from '../connection/connection.component';
import { BackgroundComponent } from '../background/background.component';
import { DefsComponent } from '../defs/defs.component';
import { FlowSizeControllerDirective } from '../../directives/flow-size-controller.directive';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { RootSvgContextDirective } from '../../directives/root-svg-context.directive';
import { RootSvgReferenceDirective } from '../../directives/reference.directive';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import { getIntersectingNodes, getNodesAtPoint as findNodesAtPoint } from '../../utils/nodes';
import { IntersectingNodesOptions } from '../../interfaces/intersecting-nodes-options.interface';
import { PreviewFlowComponent } from '../preview-flow/preview-flow.component';
import {
  PreviewFlowRenderStrategyService,
  ViewportPreviewFlowRenderStrategyService,
} from '../../services/preview-flow-render-strategy.service';
import { toLazySignal } from '../../utils/signals/to-lazy-signal';
import { FlowRenderingService } from '../../services/flow-rendering.service';
import { AlignmentHelperComponent } from '../alignment-helper/alignment-helper.component';
import { AlignmentHelperSettings } from '../../interfaces/alignment-helper-settings.interface';
import { AutoPanDirective } from '../../directives/auto-pan.directive';
import { ResizeObserverService } from '../../services/resize-observer.service';
import { RequestAnimationFrameBatchingService } from '../../services/request-animation-frame-batching.service';
import { NodeDragControllerDirective } from '../../directives/node-drag-controller.directive';
import { HtmlElementCacheService } from '../../services/html-element-cache.service';
import { SvgGraphicElementCacheService } from '../../services/svg-graphic-element-cache.service';
import { BasicElementCacheService } from '../../services/basic-element-cache.service';
import { SelectionBoxComponent } from '../selection-box/selection-box.component';
import { SelectionBoxContextDirective } from '../../directives/selection-box-context.directive';
import { SelectionBoxSettings } from '../../interfaces/selection-box-settings.interface';

const changesControllerHostDirective = {
  directive: ChangesControllerDirective,
  outputs: [
    'nodesChanges',
    'nodesChanges.position',
    'nodesChanges.size',
    'nodesChanges.add',
    'nodesChanges.remove',
    'nodesChanges.select',
    'edgesChanges',
    'edgesChanges.detached',
    'edgesChanges.add',
    'edgesChanges.remove',
    'edgesChanges.select',
  ],
};

const nodeDragControllerHostDirective = {
  directive: NodeDragControllerDirective,
  outputs: ['nodeDragStart', 'nodeDrag', 'nodeDragEnd'],
};

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
    EdgeRenderingService,
    SelectionService,
    FlowSettingsService,
    ComponentEventBusService,
    KeyboardService,
    OverlaysService,
    { provide: PreviewFlowRenderStrategyService, useClass: ViewportPreviewFlowRenderStrategyService },
    FlowRenderingService,
    ResizeObserverService,
    HtmlElementCacheService,
    BasicElementCacheService,
    SvgGraphicElementCacheService,
    RequestAnimationFrameBatchingService,
  ],
  hostDirectives: [changesControllerHostDirective, nodeDragControllerHostDirective],
  imports: [
    RootSvgReferenceDirective,
    RootSvgContextDirective,
    RootPointerDirective,
    FlowSizeControllerDirective,
    DefsComponent,
    BackgroundComponent,
    MapContextDirective,
    SpacePointContextDirective,
    ConnectionComponent,
    NodeComponent,
    EdgeComponent,
    EdgeLabelComponent,
    NgTemplateOutlet,
    PreviewFlowComponent,
    AlignmentHelperComponent,
    SelectionBoxComponent,
    SelectionBoxContextDirective,
    AutoPanDirective,
  ],
})
export class VflowComponent {
  // #region DI
  private viewportService = inject(ViewportService);
  private flowEntitiesService = inject(FlowEntitiesService);
  private nodesChangeService = inject(NodesChangeService);
  private edgesChangeService = inject(EdgeChangesService);
  private nodeRenderingService = inject(NodeRenderingService);
  private edgeRenderingService = inject(EdgeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  private componentEventBusService = inject(ComponentEventBusService);
  private keyboardService = inject(KeyboardService);
  private injector = inject(Injector);
  private flowRenderingService = inject(FlowRenderingService);
  private overlaysService = inject(OverlaysService);

  // #endregion

  // #region VIEWPORT
  /**
   * CSS transform applied to the viewport div (translate px + scale).
   */
  protected viewportTransform = computed(() => {
    const { x, y, zoom } = this.viewportService.readableViewport();

    return `translate(${x}px, ${y}px) scale(${zoom})`;
  });

  protected nodeToolbarsMap = this.overlaysService.nodeToolbarsMap;
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
    this.flowSettingsService.view.set(view);
  }

  /**
   * Minimum zoom value
   */
  @Input()
  public set minZoom(value: number) {
    this.flowSettingsService.minZoom.set(value);
  }

  /**
   * Maximum zoom value
   */
  @Input()
  public set maxZoom(value: number) {
    this.flowSettingsService.maxZoom.set(value);
  }

  /** Zoom with ordinary wheel/trackpad scrolling. */
  @Input()
  public set zoomOnScroll(value: boolean) {
    this.flowSettingsService.zoomOnScroll.set(value);
  }

  /** Zoom with trackpad or touchscreen pinch. */
  @Input()
  public set zoomOnPinch(value: boolean) {
    this.flowSettingsService.zoomOnPinch.set(value);
  }

  /** Zoom with double-click. */
  @Input()
  public set zoomOnDoubleClick(value: boolean) {
    this.flowSettingsService.zoomOnDoubleClick.set(value);
  }

  /** Pan by dragging. true allows all mouse buttons; arrays restrict mouse buttons, not touch. */
  @Input()
  public set panOnDrag(value: boolean | number[]) {
    this.flowSettingsService.panOnDrag.set(value);
  }

  /** Pan with scrolling, taking priority over ordinary wheel zoom. */
  @Input()
  public set panOnScroll(value: boolean) {
    this.flowSettingsService.panOnScroll.set(value);
  }

  /** Viewport click tolerance in CSS pixels. Default: 6. */
  @Input()
  public set paneClickDistance(value: number) {
    this.flowSettingsService.paneClickDistance.set(Number.isFinite(value) ? Math.max(0, value) : 0);
  }

  /** Distance in CSS pixels before node drag starts. Default: 0. */
  @Input()
  public set nodeDragThreshold(value: number) {
    this.flowSettingsService.nodeDragThreshold.set(Number.isFinite(value) ? Math.max(0, value) : 0);
  }

  /** Distance in CSS pixels before connection or reconnection starts. Default: 0. */
  @Input()
  public set connectionDragThreshold(value: number) {
    this.flowSettingsService.connectionDragThreshold.set(Number.isFinite(value) ? Math.max(0, value) : 0);
  }

  /**
   * Background for flow
   */
  @Input()
  public set background(value: Background | string) {
    this.flowSettingsService.background.set(transformBackground(value));
  }

  @Input()
  public set optimization(newOptimization: Optimization) {
    this.flowSettingsService.optimization.update((optimization) => ({
      ...optimization,
      ...newOptimization,
    }));
  }

  /** Global default for node selection eligibility. */
  @Input()
  public set nodesSelectable(value: boolean) {
    this.flowSettingsService.nodesSelectable.set(value);
  }

  /** Global default for edge selection eligibility. */
  @Input()
  public set edgesSelectable(value: boolean) {
    this.flowSettingsService.edgesSelectable.set(value);
  }

  /** Global default for node focus eligibility. */
  @Input()
  public set nodesFocusable(value: boolean) {
    this.flowSettingsService.nodesFocusable.set(value);
  }

  /** Global default for edge focus eligibility. */
  @Input()
  public set edgesFocusable(value: boolean) {
    this.flowSettingsService.edgesFocusable.set(value);
  }

  /**
   * Selection mode strategy
   * - 'default': library manages selection automatically
   * - 'manual': library does not manage selection, user controls it via node.selected signal
   */
  @Input()
  public set selectionMode(value: SelectionMode) {
    this.flowSettingsService.selectionMode.set(value);
  }

  /**
   * Selection box behavior settings
   * - mode: 'full' selects only fully enclosed entities
   * - mode: 'partial' selects entities that intersect selection box
   * - color: stroke/fill color for selection area (fill uses opacity)
   */
  @Input()
  public set selectionBox(value: SelectionBoxSettings) {
    this.flowSettingsService.selectionBox.update((selectionBox) => ({
      ...selectionBox,
      ...value,
    }));
  }

  @Input()
  public set keyboardShortcuts(value: KeyboardShortcuts) {
    this.keyboardService.setShortcuts(value);
  }

  /**
   * Settings for connection (it renders when user tries to create edge between nodes)
   *
   * You need to pass `ConnectionSettings` in this input.
   */
  @Input({
    transform: (settings: ConnectionSettings) => new ConnectionModel(settings),
  })
  public set connection(connection: ConnectionModel) {
    this.flowEntitiesService.connection.set(connection);
  }

  public get connection() {
    return this.flowEntitiesService.connection();
  }

  /**
   * Snap grid for node movement. Passes as [x, y]
   */
  @Input()
  public set snapGrid(value: [number, number]) {
    this.flowSettingsService.snapGrid.set(value);
  }

  /**
   * Raizing z-index for selected node
   */
  @Input()
  public set elevateNodesOnSelect(value: boolean) {
    this.flowSettingsService.elevateNodesOnSelect.set(value);
  }

  /**
   * Raizing z-index for selected edge
   */
  @Input()
  public set elevateEdgesOnSelect(value: boolean) {
    this.flowSettingsService.elevateEdgesOnSelect.set(value);
  }

  /**
   * Enable auto-pan
   */
  @Input()
  public set autoPan(value: boolean) {
    this.flowSettingsService.autoPan.set(value);
  }
  // #endregion

  // #region MAIN_INPUTS
  /**
   * Nodes to render
   */
  @Input({ required: true })
  public set nodes(newNodes: Node[]) {
    const models = runInInjectionContext(this.injector, () =>
      ReferenceIdentityChecker.nodes(newNodes, this.flowEntitiesService.nodes()),
    );

    // TODO: consider calling only fo new nodes
    // quick and dirty binding nodes to edges
    addNodesToEdges(models, this.flowEntitiesService.edges());

    this.flowEntitiesService.nodes.set(models);

    models.forEach((model) => this.nodeRenderingService.pullNode(model));
  }

  public alignmentHelper = input<AlignmentHelperSettings | boolean>(false);

  protected nodeModels = this.nodeRenderingService.nodes;
  protected groups = this.nodeRenderingService.groups;
  protected nonGroups = this.nodeRenderingService.nonGroups;

  /**
   * Edges to render
   */
  @Input()
  public set edges(newEdges: Edge[]) {
    const newModels = runInInjectionContext(this.injector, () =>
      ReferenceIdentityChecker.edges(newEdges, this.flowEntitiesService.edges()),
    );

    // quick and dirty binding nodes to edges
    addNodesToEdges(this.flowEntitiesService.nodes(), newModels);

    this.flowEntitiesService.edges.set(newModels);
  }

  protected edgeModels = this.edgeRenderingService.edges;
  // #endregion

  // #region OUTPUTS
  /**
   * Event that accumulates all custom node events
   */
  public readonly componentNodeEvent = outputFromObservable<any>(this.componentEventBusService.event$); // TODO: research how to remove any
  // #endregion

  // #region TEMPLATES
  protected nodeTemplateDirective = contentChild(NodeHtmlTemplateDirective);

  protected groupNodeTemplateDirective = contentChild(GroupNodeTemplateDirective);

  protected edgeTemplateDirective = contentChild(EdgeTemplateDirective);

  protected edgeLabelHtmlDirective = contentChild(EdgeLabelHtmlTemplateDirective);

  protected connectionTemplateDirective = contentChild(ConnectionTemplateDirective);
  // #endregion

  // #region DIRECTIVES
  protected mapContext = viewChild(MapContextDirective);

  protected spacePointContext = viewChild.required(SpacePointContextDirective);
  // #endregion

  // #region SIGNAL_API
  /**
   * Signal for reading viewport change
   */
  public readonly viewport = this.viewportService.readableViewport.asReadonly();

  /**
   * Signal for reading nodes change
   */
  public readonly nodesChange = toLazySignal(this.nodesChangeService.changes$, {
    initialValue: [] as NodeChange[],
  });

  /**
   * Signal to reading edges change
   */
  public readonly edgesChange = toLazySignal(this.edgesChangeService.changes$, {
    initialValue: [] as EdgeChange[],
  });

  public readonly initialized = this.flowRenderingService.flowInitialized.asReadonly();
  // #endregion

  // #region RX_API
  /**
   * Observable with viewport change
   */
  public readonly viewportChange$ = toObservable(this.viewportService.readableViewport).pipe(skip(1)); // skip default value that set by signal

  /**
   * Observable with nodes change
   */
  public readonly nodesChange$ = this.nodesChangeService.changes$;

  /**
   * Observable with edges change
   */
  public readonly edgesChange$ = this.edgesChangeService.changes$;

  public readonly initialized$ = toObservable(this.flowRenderingService.flowInitialized);
  // #endregion

  protected markers = this.flowEntitiesService.markers;
  protected minimap = this.flowEntitiesService.minimap;

  protected flowOptimization = this.flowSettingsService.optimization;
  protected flowWidth = this.flowSettingsService.computedFlowWidth;
  protected flowHeight = this.flowSettingsService.computedFlowHeight;

  // #region METHODS_API
  /**
   * Change viewport to specified state
   *
   * @param viewport viewport state
   */
  public viewportTo(viewport: ViewportState): void {
    this.viewportService.writableViewport.set({
      changeType: 'absolute',
      state: viewport,
      duration: 0,
    });
  }

  /**
   * Change zoom
   *
   * @param zoom zoom value
   */
  public zoomTo(zoom: number): void {
    this.viewportService.writableViewport.set({
      changeType: 'absolute',
      state: { zoom },
      duration: 0,
    });
  }

  /**
   * Sets the D3 zoom **translation** (`x`, `y`) while keeping the current zoom — the same meaning as
   * `x` / `y` on the public {@link viewport} signal. This is not a node position in flow space; to
   * center on a world point, use {@link fitView} or compute translate from flow coordinates and current `zoom`.
   *
   * @param point viewport translation `{ x, y }`
   */
  public panTo(point: Point): void {
    this.viewportService.writableViewport.set({
      changeType: 'absolute',
      state: point,
      duration: 0,
    });
  }

  public fitView(options?: FitViewOptions) {
    this.viewportService.fitView(options);
  }

  /**
   * Get node by id
   *
   * @param id node id
   */
  public getNode<T = unknown>(id: string): Node<T> | undefined {
    return this.flowEntitiesService.getNode<T>(id)?.rawNode;
  }

  /**
   * Sync method to get detached edges
   */
  public getDetachedEdges(): Edge[] {
    return this.flowEntitiesService.getDetachedEdges().map((e) => e.edge);
  }

  /** Converts a DOM client-space position to flow space. */
  public clientToFlowPosition(point: Point): Point {
    return this.spacePointContext().clientToFlowPosition(point);
  }

  /** Converts a flow-space position to DOM client space. */
  public flowToClientPosition(point: Point): Point {
    return this.spacePointContext().flowToClientPosition(point);
  }

  /** Gets rendered nodes containing a flow-space position, with the topmost node first. */
  public getNodesAtPoint<T = unknown>(point: Point): Array<Node<T> & { nodeSpacePoint: Point }> {
    return findNodesAtPoint(point, this.nodeModels())
      .reverse()
      .map((model) => {
        const globalPoint = model.globalPoint();

        return {
          ...(model.rawNode as Node<T>),
          nodeSpacePoint: { x: point.x - globalPoint.x, y: point.y - globalPoint.y },
        };
      });
  }

  /**
   * Gets nodes that intersect with the specified node
   *
   * @template T - The type of data associated with the nodes
   * @param nodeId - The ID of the node to check intersections for
   * @param options.partially - If true, returns nodes that partially intersect. If false, only returns fully intersecting nodes
   * @returns An array of nodes that intersect with the specified node
   */
  public getIntersectingNodes<T>(nodeId: string, options: IntersectingNodesOptions = { partially: true }): Node<T>[] {
    return getIntersectingNodes(nodeId, this.nodeModels(), options).map((n) => n.rawNode) as Node<T>[];
  }
  // #endregion

  protected toolbarTransform(node: NodeModel, toolbar: ToolbarModel): string {
    const { x, y } = node.globalPoint();
    const point = toolbar.point();

    return `translate(${x + point.x}px, ${y + point.y}px)`;
  }

  protected trackNodes(idx: number, { rawNode: node }: NodeModel) {
    return node;
  }

  protected trackEdges(idx: number, { edge }: EdgeModel) {
    return edge;
  }
}
