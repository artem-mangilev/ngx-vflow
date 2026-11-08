import { AutoPanSettings } from '../../interfaces/auto-pan-settings.interface';
import { KeyboardNavigationDirective } from '../../directives/keyboard-navigation.directive';
import { KeyboardEntityDirective } from '../../directives/keyboard-entity.directive';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  contentChild,
  contentChildren,
  computed,
  viewChild,
  input,
  effect,
  ElementRef,
  signal,
  output,
} from '@angular/core';
import { Node } from '../../interfaces/node.interface';
import { ViewportGesturesDirective } from '../../directives/viewport-gestures.directive';
import { DraggableService } from '../../services/draggable.service';
import { NodeModel } from '../../models/node.model';
import { ViewportService, ZOOM_STEP } from '../../services/viewport.service';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Edge } from '../../interfaces/edge.interface';
import { EdgeModel } from '../../models/edge.model';
import {
  VflowConnectionTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowMarkerTemplateDirective,
  VflowNodeTemplateDirective,
} from '../../public-directives/template.directive';
import { Point } from '../../interfaces/point.interface';
import { NodeAtPoint } from '../../interfaces/node-at-point.interface';
import { SetCenterOptions, ViewportOptions, ViewportState } from '../../interfaces/viewport.interface';
import { ConnectionService } from '../../services/connection.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
import { MarkerShapes } from '../../utils/marker-inset';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { NodesChangeService } from '../../services/node-changes.service';
import { EdgeChangesService } from '../../services/edge-changes.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NodeDragEvent } from '../../interfaces/node-drag-event.interface';
import { NodeDragGestureEvent } from '../../services/draggable.service';
import {
  ConnectEndEvent,
  ConnectStartEvent,
  ReconnectEndEvent,
  ReconnectEvent,
  ReconnectStartEvent,
} from '../../interfaces/connection-events.interface';
import { NodeRenderingService } from '../../services/node-rendering.service';
import { SelectionService } from '../../services/selection.service';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { ComponentEventBusService } from '../../services/component-event-bus.service';
import { Background } from '../../types/background.type';
import { SpacePointContextDirective } from '../../directives/space-point-context.directive';
import { FitViewOptions } from '../../interfaces/fit-view-options.interface';
import { Optimization } from '../../interfaces/optimization.interface';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';
import { SelectionMode } from '../../types/selection-mode.type';
import { KeyboardService } from '../../services/keyboard.service';
import { EdgeComponent } from '../edge/edge.component';
import { EdgeLabelComponent } from '../edge-label/edge-label.component';
import { NodeComponent } from '../node/node.component';
import { ConnectionComponent } from '../connection/connection.component';
import { BackgroundComponent } from '../background/background.component';
import { DefsComponent } from '../defs/defs.component';
import { FlowSizeControllerDirective } from '../../directives/flow-size-controller.directive';
import { EdgeRenderingService } from '../../services/edge-rendering.service';
import {
  getIntersectingNodes,
  getNodesAtPoint as findNodesAtPoint,
  getNodesFlowBounds,
  nodeToRect,
} from '../../utils/nodes';
import { Rect } from '../../interfaces/rect';
import { IntersectingNodesOptions } from '../../interfaces/intersecting-nodes-options.interface';
import { FlowRenderingService } from '../../services/flow-rendering.service';
import { AlignmentHelperComponent } from '../alignment-helper/alignment-helper.component';
import { AlignmentHelperSettings } from '../../interfaces/alignment-helper-settings.interface';
import { AlignmentService } from '../../services/alignment.service';
import { AutoPanDirective } from '../../directives/auto-pan.directive';
import { ResizeObserverService } from '../../services/resize-observer.service';
import { SelectionBoxComponent } from '../selection-box/selection-box.component';
import { SelectionBoxContextDirective } from '../../directives/selection-box-context.directive';
import { SelectionBoxSettings } from '../../interfaces/selection-box-settings.interface';
import { AriaDescriber } from '@angular/cdk/a11y';
import { EntityAccessibilityDirective } from '../../directives/entity-accessibility.directive';
import { LiveRegionDirective } from '../../directives/live-region.directive';
import { AnnouncerService } from '../../services/announcer.service';
import { KeyboardEntityCommandsService } from '../../services/keyboard-entity-commands.service';
import { KeyboardLabelsService } from '../../services/keyboard-labels.service';
import { KeyboardViewportCommandsService } from '../../services/keyboard-viewport-commands.service';
import { ViewportCullingDirective } from '../../directives/viewport-culling.directive';
import { AfterRenderBatchService } from '../../services/after-render-batch.service';
import { bindVflowInputs } from './bind-vflow-inputs';
import { ResolvedVflowSettingSignals } from './resolve-settings';

/**
 * The flow. `N` and `E` are the node and edge types of the `nodes` and `edges` inputs; a template infers them from
 * the bindings, so `$event` of the node, connection and component events carries the application's own types. In
 * code, name them: `viewChild.required<VflowComponent<MyNode, MyEdge>>(VflowComponent)`.
 */
@Component({
  selector: 'vflow',
  templateUrl: './vflow.component.html',
  styleUrls: ['./vflow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AriaDescriber,
    DraggableService,
    ViewportService,
    ConnectionService,
    FlowEntitiesService,
    NodesChangeService,
    EdgeChangesService,
    NodeRenderingService,
    EdgeRenderingService,
    SelectionService,
    FlowSettingsService,
    ComponentEventBusService,
    KeyboardService,
    KeyboardEntityCommandsService,
    KeyboardLabelsService,
    KeyboardViewportCommandsService,
    AnnouncerService,
    FlowRenderingService,
    ResizeObserverService,
    AfterRenderBatchService,
    AlignmentService,
  ],
  hostDirectives: [ViewportCullingDirective],
  host: {
    // Lets scaled application content keep screen-sized details. The token is inherited by every element of the
    // flow, so a change recomputes the style of all of them: it follows the zoom once per gesture, not per frame.
    // The node focus ring, which must follow every frame, reads the token from its own node instead.
    '[style.--v-zoom]': 'settledZoom()',
    // Nothing that follows the viewport is painted before the first layout, so the first painted frame already
    // shows a viewport the application sets in reaction to `initialized`, such as a `fitView()` call.
    '[class.v-initializing]': '!flowInitialized()',
    // A DOM without layout never measures anything, so there nothing waits for a measurement (see the stylesheet).
    '[class.v-no-layout]': '!hasLayout',
  },
  imports: [
    KeyboardEntityDirective,
    KeyboardNavigationDirective,
    EntityAccessibilityDirective,
    LiveRegionDirective,
    FlowSizeControllerDirective,
    DefsComponent,
    BackgroundComponent,
    ViewportGesturesDirective,
    SpacePointContextDirective,
    ConnectionComponent,
    NodeComponent,
    EdgeComponent,
    EdgeLabelComponent,
    AlignmentHelperComponent,
    SelectionBoxComponent,
    SelectionBoxContextDirective,
    AutoPanDirective,
  ],
})
export class VflowComponent<N extends Node = Node, E extends Edge = Edge> {
  // #region DI
  private viewportService = inject(ViewportService);
  private flowEntitiesService = inject(FlowEntitiesService);
  private connectionService = inject(ConnectionService);
  private draggableService = inject(DraggableService);
  private nodesChangeService = inject(NodesChangeService);
  private edgesChangeService = inject(EdgeChangesService);
  private nodeRenderingService = inject(NodeRenderingService);
  private flowSettingsService = inject(FlowSettingsService);
  protected ariaLabels = this.flowSettingsService.ariaLabels;
  protected connectionModel = this.flowEntitiesService.connection;
  private componentEventBusService = inject(ComponentEventBusService);
  private keyboardService = inject(KeyboardService);
  private flowRenderingService = inject(FlowRenderingService);

  // #endregion

  // #region VIEWPORT
  private rootElement = viewChild.required<ElementRef<HTMLElement>>('flow');
  private paneElement = viewChild.required<ElementRef<HTMLElement>>('pane');
  private viewportElement = viewChild.required<ElementRef<HTMLElement>>('viewportElement');

  /**
   * The settings in effect, one signal each: a bound input, else the value given with `withSettings()`, else the
   * default. The inputs themselves hold only what is bound.
   */
  public readonly settings: ResolvedVflowSettingSignals;

  constructor() {
    this.settings = bindVflowInputs(this);

    // Curves read the inset of a declared shape through the service; the defs render the shape itself.
    effect(() => this.flowEntitiesService.markerShapes.set(this.markerShapes()));

    effect(() => {
      const { x, y, zoom } = this.viewportService.readableViewport();
      // Camera movement must not reconcile every node, edge and label.
      this.viewportElement().nativeElement.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    });

    // The services that read the DOM get the elements from here, not from a class lookup.
    effect(() => {
      this.flowRenderingService.root.set(this.rootElement().nativeElement);
      this.flowRenderingService.pane.set(this.paneElement().nativeElement);
      this.flowRenderingService.viewport.set(this.viewportElement().nativeElement);
    });

    this.viewportService.viewportChangeEnd$
      .pipe(takeUntilDestroyed())
      .subscribe(({ zoom }) => this.settledZoom.set(zoom));

    // The output is emitted in the change detection pass that reveals the graph, so a viewport the application sets
    // in reaction to it is the first one painted. `flowInitialized` latches, so it is emitted once.
    effect(() => {
      if (this.flowRenderingService.flowInitialized()) this.initialized.emit();
    });
  }

  /** The zoom at the end of the latest gesture, bound to `--v-zoom` on the host. */
  protected readonly settledZoom = signal(1);

  // #endregion

  // #region SETTINGS

  /**
   * Size of the flow: `[width, height]` in pixels, or `'auto'` to fill the parent element. Default: `'auto'`, so
   * the parent needs a size of its own.
   */
  public readonly view = input<[number, number] | 'auto'>();

  /** Minimum zoom value. Default: 0.5. */
  public readonly minZoom = input<number>();

  /** Maximum zoom value. Default: 3. */
  public readonly maxZoom = input<number>();

  /** Zoom with ordinary wheel/trackpad scrolling. */
  public readonly zoomOnScroll = input<boolean>();

  /** Zoom with trackpad or touchscreen pinch. */
  public readonly zoomOnPinch = input<boolean>();

  /** Zoom with double-click. */
  public readonly zoomOnDoubleClick = input<boolean>();

  /** Pan by dragging. true allows all mouse buttons; arrays restrict mouse buttons, not touch. */
  public readonly panOnDrag = input<boolean | readonly number[]>();

  /** Pan with scrolling, taking priority over ordinary wheel zoom. */
  public readonly panOnScroll = input<boolean>();

  /** Viewport click tolerance in CSS pixels. Default: 6. */
  public readonly paneClickDistance = input<number>();

  /** Distance in CSS pixels before node drag starts. Default: 0. */
  public readonly nodeDragThreshold = input<number>();

  /** Distance in CSS pixels before connection or reconnection starts. Default: 0. */
  public readonly connectionDragThreshold = input<number>();

  /**
   * Background for flow
   */
  public readonly background = input<Background | null>();

  /** Rendering optimizations; omitted keys keep their defaults. */
  public readonly optimization = input<Optimization>();

  /**
   * Draws the nodes that other nodes reference as parent in a layer below the edges, so an edge inside a parent
   * can be selected. Such a parent then also stays below every other node. Default: false.
   */
  public readonly parentsBelowEdges = input<boolean>();

  /** Global default for node selection eligibility. */
  public readonly nodesSelectable = input<boolean>();

  /** Global default for edge selection eligibility. */
  public readonly edgesSelectable = input<boolean>();

  /** Global default for node focus eligibility. */
  public readonly nodesFocusable = input<boolean>();

  /** Global default for edge focus eligibility. */
  public readonly edgesFocusable = input<boolean>();

  /**
   * Selection mode strategy
   * - 'default': library manages selection automatically
   * - 'manual': library does not manage selection, user controls it via node.selected signal
   */
  public readonly selectionMode = input<SelectionMode>();

  /**
   * Selection box behavior settings; omitted keys keep their defaults.
   * - mode: 'full' selects only fully enclosed entities
   * - mode: 'partial' selects entities that intersect selection box
   */
  public readonly selectionBox = input<SelectionBoxSettings>();

  /** Keys of the graph; omitted entries keep their defaults and an empty list disables an entry. */
  public readonly keyboardShortcuts = input<KeyboardShortcuts>();

  /**
   * Settings for connection (it renders when user tries to create edge between nodes)
   */
  public readonly connection = input<ConnectionSettings>();

  /**
   * Snap grid for node movement. Passes as [x, y]
   */
  public readonly snapGrid = input<[number, number]>();

  /**
   * Raizing z-index for selected node
   */
  public readonly elevateNodesOnSelect = input<boolean>();

  /**
   * Raizing z-index for selected edge
   */
  public readonly elevateEdgesOnSelect = input<boolean>();

  /**
   * Pans the viewport while a dragged node or connection is held near its edge. `true` enables it for node and
   * connection drags with default speed and margin; `AutoPanSettings` tunes it. Default: true.
   */
  public readonly autoPan = input<boolean | AutoPanSettings>();

  /** Center fully offscreen keyboard-focused nodes without changing zoom. Default: true. */
  public readonly autoPanOnNodeFocus = input<boolean>();

  /**
   * Snaps a dragged node, or a dragged selection as a whole, to other nodes and draws the guides that hold: aligned
   * edges and centers, equal gaps between neighbours and straight edges to connected nodes. `true` enables it with
   * default settings. Holding the `alignmentBypass` modifier (Alt) moves freely.
   */
  public readonly alignmentHelper = input<AlignmentHelperSettings | boolean>();
  // #endregion

  // #region MAIN_INPUTS
  /**
   * Nodes to render
   */
  public readonly nodes = input.required<readonly N[]>();

  protected nodeModels = this.nodeRenderingService.nodes;
  protected orderedNodes = this.flowEntitiesService.nodes;

  /**
   * Edges to render
   */
  public readonly edges = input<readonly E[]>([]);

  protected orderedEdges = this.flowEntitiesService.validEdges;
  // #endregion

  // #region OUTPUTS
  /**
   * Changes of nodes that have already happened: position, size, add, remove and select. Every change of one tick
   * comes in a single array. To subscribe in code, use `nodesChanges.subscribe()` or `outputToObservable()`.
   */
  public readonly nodesChanges = outputFromObservable(this.nodesChangeService.changes$);

  /**
   * Changes of edges that have already happened: detached, add, remove and select. Every change of one tick comes
   * in a single array. To subscribe in code, use `edgesChanges.subscribe()` or `outputToObservable()`.
   */
  public readonly edgesChanges = outputFromObservable(this.edgesChangeService.changes$);

  // The changes of one type as separate outputs: `(nodesChanges.position)` and so on.
  public readonly nodesChangesPosition = outputFromObservable(this.nodesChangeService.changesOfType('position'), {
    alias: 'nodesChanges.position',
  });
  public readonly nodesChangesSize = outputFromObservable(this.nodesChangeService.changesOfType('size'), {
    alias: 'nodesChanges.size',
  });
  public readonly nodesChangesAdd = outputFromObservable(this.nodesChangeService.changesOfType('add'), {
    alias: 'nodesChanges.add',
  });
  public readonly nodesChangesRemove = outputFromObservable(this.nodesChangeService.changesOfType('remove'), {
    alias: 'nodesChanges.remove',
  });
  public readonly nodesChangesSelect = outputFromObservable(this.nodesChangeService.changesOfType('select'), {
    alias: 'nodesChanges.select',
  });
  public readonly edgesChangesDetached = outputFromObservable(this.edgesChangeService.changesOfType('detached'), {
    alias: 'edgesChanges.detached',
  });
  public readonly edgesChangesAdd = outputFromObservable(this.edgesChangeService.changesOfType('add'), {
    alias: 'edgesChanges.add',
  });
  public readonly edgesChangesRemove = outputFromObservable(this.edgesChangeService.changesOfType('remove'), {
    alias: 'edgesChanges.remove',
  });
  public readonly edgesChangesSelect = outputFromObservable(this.edgesChangeService.changesOfType('select'), {
    alias: 'edgesChanges.select',
  });

  // The models hold the objects of the `nodes` and `edges` inputs, so the events of the services are events of `N`
  // and `E`; the services do not know the types, hence the casts.

  /** The pointer passed the drag threshold on a draggable node. */
  public readonly nodeDragStart = outputFromObservable(this.dragEvents('start'));
  /** A move of the node drag gesture, after the nodes moved. */
  public readonly nodeDrag = outputFromObservable(this.dragEvents('move'));
  /** The release of the node drag gesture. */
  public readonly nodeDragEnd = outputFromObservable(this.dragEvents('end'));

  public readonly connectStart = outputFromObservable(
    this.connectionService.connectStart$.pipe(map((event) => event as ConnectStartEvent<N>)),
  );
  /** An application-owned structural connection request, after validation. */
  public readonly connect = outputFromObservable(this.connectionService.connect$);
  public readonly connectEnd = outputFromObservable(
    this.connectionService.connectEnd$.pipe(map((event) => event as ConnectEndEvent<N>)),
  );
  public readonly reconnectStart = outputFromObservable(
    this.connectionService.reconnectStart$.pipe(map((event) => event as ReconnectStartEvent<N, E>)),
  );
  /** A reconnection of an existing edge, after validation; apply it with `reconnectEdges([event], graph)`. */
  public readonly reconnect = outputFromObservable(
    this.connectionService.reconnect$.pipe(map((event) => event as ReconnectEvent<E>)),
  );
  public readonly reconnectEnd = outputFromObservable(
    this.connectionService.reconnectEnd$.pipe(map((event) => event as ReconnectEndEvent<N, E>)),
  );

  /**
   * Every output of every component node: the node id, the component class, the property name of the output and
   * its payload. `isComponentNodeEvent(event, Cmp)` narrows the event to the outputs of one class.
   */
  public readonly componentNodeEvent = outputFromObservable(this.componentEventBusService.nodeEvent$);

  /** Every output of every component edge; `isComponentEdgeEvent(event, Cmp)` narrows it to one class. */
  public readonly componentEdgeEvent = outputFromObservable(this.componentEventBusService.edgeEvent$);

  /**
   * A keyboard user pressed a deletion key on a focused node or edge while entities were selected. Carries the
   * selected IDs only; apply it with `removeElements(request, graph)` or ignore it.
   */
  public readonly deleteRequest = outputFromObservable(this.keyboardService.deleteRequest$);

  /**
   * Emitted once, when the first layout is complete: the flow has a size, and every node has its size and handle
   * positions. An empty graph completes it too. The graph is not painted before that, so a viewport set in reaction,
   * such as `(initialized)="flow.fitView()"`, is the first viewport the user sees. A directive on the flow element
   * may hold it back with a `VFLOW_INITIALIZATION_GATE`, for example until a layout has placed the nodes.
   *
   * A subscription made after the emission does not receive it; keep a flag, such as
   * `(initialized)="ready.set(true)"`, to know later whether the flow is ready. A DOM without layout, such as jsdom,
   * never emits it.
   */
  public readonly initialized = output<void>();

  /**
   * The viewport at the end of each change: when a gesture ends, a series of wheel events included, and when a
   * programmatic change lands or is interrupted. The `viewport` signal follows every frame; this is the moment to
   * save the viewport.
   */
  public readonly viewportChangeEnd = outputFromObservable(this.viewportService.viewportChangeEnd$);
  // #endregion

  // #region TEMPLATES
  protected nodeTemplateDirective = contentChild(VflowNodeTemplateDirective);

  protected edgeTemplateDirective = contentChild(VflowEdgeTemplateDirective);

  protected connectionTemplateDirective = contentChild(VflowConnectionTemplateDirective);

  private markerTemplateDirectives = contentChildren(VflowMarkerTemplateDirective);

  /** Marker shapes declared with `ng-template[vMarker]`, by type. */
  protected markerShapes = computed<MarkerShapes>(
    () =>
      new Map(
        this.markerTemplateDirectives().map((directive) => [
          directive.vMarker(),
          { template: directive.templateRef, inset: directive.inset() },
        ]),
      ),
  );
  // #endregion

  // #region DIRECTIVES
  protected spacePointContext = viewChild.required(SpacePointContextDirective);
  // #endregion

  // #region SIGNAL_API
  /**
   * Signal for reading viewport change
   */
  public readonly viewport = this.viewportService.readableViewport.asReadonly();

  protected readonly flowInitialized = this.flowRenderingService.flowInitialized;
  protected readonly hasLayout = this.flowRenderingService.hasLayout;
  // #endregion

  protected markers = this.flowEntitiesService.markers;

  // #region METHODS_API
  // Viewport methods apply at once and in order, each from where the previous one leads, so consecutive calls
  // compose. Zoom keeps to `minZoom` and `maxZoom`. Each animates over `options.duration` ms and returns a promise
  // that settles when the change ends: `true` when the viewport reached the target, `false` when there was nothing
  // to change or another change or a gesture interrupted it first.
  //
  // Viewport methods write and read nothing tracked, so an effect may call them without `untracked`. The queries
  // below them read signals like any signal read: `computed(() => flow.getNodesBounds())` follows the nodes, and
  // an effect that reads a query reruns when its answer may change. Read a query in `untracked` when the effect
  // must not follow it, for example before a `setCenter()` call that should not repeat on every node move.

  /**
   * Sets the viewport: the same `x`, `y` and `zoom` as on the {@link viewport} signal. A zoom outside the limits is
   * clamped; `x` and `y` stay as given. To pan without zooming, pass `{ ...flow.viewport(), x, y }`.
   *
   * @param viewport viewport state
   */
  public setViewport(viewport: ViewportState, options?: ViewportOptions): Promise<boolean> {
    return this.viewportService.change(viewport, options?.duration);
  }

  /**
   * Puts a flow-space point in the center of the flow, at `options.zoom` or the current zoom.
   *
   * @param point flow-space point
   */
  public setCenter(point: Point, options?: SetCenterOptions): Promise<boolean> {
    return this.viewportService.setCenter(point, options?.zoom, options?.duration);
  }

  /**
   * Fits the given nodes, or all of them, into the flow. Settles with `false` when there is nothing to fit.
   */
  public fitView(options?: FitViewOptions): Promise<boolean> {
    return this.viewportService.fitView(options);
  }

  /**
   * Zooms around the center of the flow.
   *
   * @param zoom zoom value
   */
  public zoomTo(zoom: number, options?: ViewportOptions): Promise<boolean> {
    return this.viewportService.change({ zoom }, options?.duration);
  }

  /** Zooms in around the center of the flow by the step of the zoom-in key. */
  public zoomIn(options?: ViewportOptions): Promise<boolean> {
    return this.viewportService.zoomBy(ZOOM_STEP, options?.duration);
  }

  /** Zooms out around the center of the flow by the step of the zoom-out key. */
  public zoomOut(options?: ViewportOptions): Promise<boolean> {
    return this.viewportService.zoomBy(1 / ZOOM_STEP, options?.duration);
  }

  /**
   * Get node by id
   *
   * @param id node id
   */
  public getNode(id: string): N | undefined {
    return this.flowEntitiesService.getNode(id)?.rawNode as N | undefined;
  }

  /**
   * Rendered rectangle of a node in flow space: its absolute position and measured size, or the explicit size
   * the browser rendered. `undefined` for an unknown node or one that has not been measured yet.
   */
  public getNodeRect(id: string): Rect | undefined {
    const model = this.flowEntitiesService.getNode(id);
    return model?.hasMeasurement() ? nodeToRect(model) : undefined;
  }

  /**
   * Flow-space bounds of the rendered rectangles of the given nodes, or of all nodes. Unknown and unmeasured
   * nodes are skipped; with nothing to bound the result is an empty rectangle at the origin.
   */
  public getNodesBounds(ids?: readonly string[]): Rect {
    const requested = ids ? new Set(ids) : null;
    // Culled nodes keep their last geometry, so the entity list, not the rendered one, is bounded.
    const models = this.flowEntitiesService
      .nodes()
      .filter((model) => model.hasMeasurement() && (!requested || requested.has(model.rawNode.id)));
    return getNodesFlowBounds(models);
  }

  /**
   * Sync method to get detached edges
   */
  public getDetachedEdges(): E[] {
    return this.flowEntitiesService.getDetachedEdges().map((e) => e.edge as E);
  }

  /** Converts a DOM client-space position to flow space. */
  public clientToFlowPosition(point: Point): Point {
    return this.spacePointContext().clientToFlowPosition(point);
  }

  /** Converts a flow-space position to DOM client space. */
  public flowToClientPosition(point: Point): Point {
    return this.spacePointContext().flowToClientPosition(point);
  }

  /**
   * Gets rendered nodes containing a flow-space position, with the topmost node first. `node` is the application
   * object; `nodeSpacePoint` is a snapshot of the position relative to that node's top-left corner.
   */
  public getNodesAtPoint(point: Point): NodeAtPoint<N>[] {
    return findNodesAtPoint(point, this.nodeModels())
      .reverse()
      .map((model) => {
        const globalPoint = model.globalPoint();

        return {
          node: model.rawNode as N,
          nodeSpacePoint: { x: point.x - globalPoint.x, y: point.y - globalPoint.y },
        };
      });
  }

  /**
   * Gets the rendered nodes whose rectangle overlaps the rectangle of the node. With `partially: false` only nodes
   * that contain the whole rectangle count.
   */
  public getIntersectingNodes(nodeId: string, options?: IntersectingNodesOptions): N[] {
    return getIntersectingNodes(nodeId, this.nodeModels(), options).map((n) => n.rawNode as N);
  }
  // #endregion

  private dragEvents(type: NodeDragGestureEvent['type']): Observable<NodeDragEvent<N>> {
    return this.draggableService.events$.pipe(
      filter((event) => event.type === type),
      map(({ node, nodes, event }) => ({
        node: node.rawNode as N,
        nodes: nodes.map((model) => model.rawNode as N),
        sourceEvent: event,
      })),
    );
  }

  protected trackNodes(idx: number, { rawNode: node }: NodeModel) {
    return node;
  }

  protected trackEdges(idx: number, { edge }: EdgeModel) {
    return edge;
  }
}
