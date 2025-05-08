import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  computed,
  inject,
  runInInjectionContext,
  input,
  contentChild,
  viewChild,
} from '@angular/core';
import { DynamicNode, Node } from '../../interfaces/node.interface';
import { MapContextDirective } from '../../directives/map-context.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportService } from '../../services/viewport.service';
import { toObservable, toSignal, outputFromObservable } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import {
  ConnectionTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  GroupNodeTemplateDirective,
  NodeHtmlTemplateDirective,
  NodeSvgTemplateDirective,
} from '../../directives/template.directive';
import { addNodesToEdges } from '../../utils/add-nodes-to-edges';
import { skip } from 'rxjs';
import { LayeredPoint, Point } from '../../interfaces/point.interface';
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
import { KeyboardService } from '../../services/keyboard.service';
import { transformBackground } from '../../utils/transform-background';
import { OverlaysService } from '../../services/overlays.service';
import { NgTemplateOutlet } from '@angular/common';
import { EdgeComponent } from '../edge/edge.component';
import { NodeComponent } from '../node/node.component';
import { ConnectionComponent } from '../connection/connection.component';
import { BackgroundComponent } from '../background/background.component';
import { DefsComponent } from '../defs/defs.component';
import { FlowSizeControllerDirective } from '../../directives/flow-size-controller.directive';
import { RootPointerDirective } from '../../directives/root-pointer.directive';
import { RootSvgContextDirective } from '../../directives/root-svg-context.directive';
import { RootSvgReferenceDirective } from '../../directives/reference.directive';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import { getLayeredPoints } from '../../utils/get-layered-points';

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
  ],
};

@Component({
  standalone: true,
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
  ],
  hostDirectives: [changesControllerHostDirective],
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
    NgTemplateOutlet,
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

  /**
   * Background for flow
   */
  @Input()
  public set background(value: Background | string) {
    this.flowSettingsService.background.set(transformBackground(value));
  }

  public optimization = input<Optimization>({
    detachedGroupsLayer: false,
  });

  /**
   * Global rule if you can or can't select entities
   */
  @Input()
  public set entitiesSelectable(value: boolean) {
    this.flowSettingsService.entitiesSelectable.set(value);
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
  // #endregion

  // #region MAIN_INPUTS
  /**
   * Nodes to render
   */
  @Input({ required: true })
  public set nodes(newNodes: Node[] | DynamicNode[]) {
    const models = runInInjectionContext(this.injector, () =>
      ReferenceIdentityChecker.nodes(newNodes, this.flowEntitiesService.nodes()),
    );
    const all = [...models.old, ...models.new];

    models.new
      .filter(({ rawNode }) => rawNode.type === 'default-group' || rawNode.type === 'template-group')
      .forEach((model) => this.nodeRenderingService.pullNode(model));

    // TODO: consider calling only fo new nodes
    // quick and dirty binding nodes to edges
    addNodesToEdges(all, this.flowEntitiesService.edges());

    this.flowEntitiesService.nodes.set(all);
  }

  protected nodeModels = computed(() => this.nodeRenderingService.nodes());
  protected groups = computed(() => this.nodeRenderingService.groups());
  protected nonGroups = computed(() => this.nodeRenderingService.nonGroups());

  /**
   * Edges to render
   */
  @Input()
  public set edges(newEdges: Edge[]) {
    const newModels = runInInjectionContext(this.injector, () =>
      ReferenceIdentityChecker.edges(newEdges, this.flowEntitiesService.edges()),
    );

    // quick and dirty binding nodes to edges
    addNodesToEdges(this.nodeModels(), newModels);

    this.flowEntitiesService.edges.set(newModels);
  }

  protected edgeModels = computed(() => this.edgeRenderingService.edges());
  // #endregion

  // #region OUTPUTS
  /**
   * Event that accumulates all custom node events
   *
   * @experimental
   */
  public readonly onComponentNodeEvent = outputFromObservable<any>(this.componentEventBusService.event$); // TODO: research how to remove any
  // #endregion

  // #region TEMPLATES
  protected nodeTemplateDirective = contentChild(NodeHtmlTemplateDirective);

  protected nodeSvgTemplateDirective = contentChild(NodeSvgTemplateDirective);

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
  public readonly nodesChange = toSignal(this.nodesChangeService.changes$, {
    initialValue: [] as NodeChange[],
  });

  /**
   * Signal to reading edges change
   */
  public readonly edgesChange = toSignal(this.edgesChangeService.changes$, {
    initialValue: [] as EdgeChange[],
  });
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
  // #endregion

  protected markers = this.flowEntitiesService.markers;

  protected minimap = this.flowEntitiesService.minimap;

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
   * Move to specified coordinate
   *
   * @param point point where to move
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
  public getNode<T = unknown>(id: string): Node<T> | DynamicNode<T> | undefined {
    return this.flowEntitiesService.getNode<T>(id)?.rawNode;
  }

  /**
   * Sync method to get detached edges
   */
  public getDetachedEdges(): Edge[] {
    return this.flowEntitiesService.getDetachedEdges().map((e) => e.edge);
  }

  /**
   * Convert point received from document to point on the flow
   */
  public documentPointToFlowPoint(point: Point): Point;
  public documentPointToFlowPoint(point: Point, options?: { layers: false }): Point;
  /**
   * Convert point received from document to a stack of layered points on the flow
   * Layered point has a nodeId, coordinates are relative to this node
   */
  public documentPointToFlowPoint(point: Point, options?: { layers: true }): LayeredPoint[];
  public documentPointToFlowPoint(point: Point, options?: { layers: boolean }): unknown {
    const transformedPoint = this.spacePointContext().documentPointToFlowPoint(point);

    if (options?.layers) {
      return getLayeredPoints(transformedPoint, this.nodeRenderingService.groups());
    }

    return transformedPoint;
  }
  // #endregion

  protected trackNodes(idx: number, { rawNode: node }: NodeModel) {
    return node;
  }

  protected trackEdges(idx: number, { edge }: EdgeModel) {
    return edge;
  }
}
