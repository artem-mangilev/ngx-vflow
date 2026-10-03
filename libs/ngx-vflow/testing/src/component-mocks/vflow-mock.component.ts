import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Input,
  output,
  signal,
  WritableSignal,
  OnInit,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  Node,
  Edge,
  Point,
  Background,
  KeyboardShortcuts,
  ConnectionSettings,
  ViewportState,
  ViewportOptions,
  SetCenterOptions,
  NodeChange,
  EdgeChange,
  FitViewOptions,
  VflowComponent,
  IntersectingNodesOptions,
  ɵConnectionModel as ConnectionModel,
  DEFAULT_OPTIMIZATION,
  AlignmentHelperSettings,
  SelectionMode,
  SelectionBoxSettings,
  AutoPanSettings,
  AriaLabelConfig,
  DeleteRequest,
  Connection,
  ConnectStartEvent,
  ConnectEndEvent,
  ReconnectStartEvent,
  ReconnectEvent,
  ReconnectEndEvent,
  Rect,
  getNodePositionInSpace,
} from 'ngx-vflow';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  ConnectionTemplateMockDirective,
  EdgeTemplateMockDirective,
  NodeTemplateMockDirective,
} from '../directive-mocks/template-mock.directive';
import { AsInterface } from '../types';

/** The zoom step of `VflowComponent.zoomIn` and `zoomOut`. */
const MOCK_ZOOM_STEP = 1.2;

@Component({
  selector: 'vflow',
  template: `
    <ng-content />

    @for (node of nodes; track $index) {
      @if (!node.component) {
        <ng-component
          [ngTemplateOutlet]="nodeTemplateDirective()?.templateRef ?? null"
          [ngTemplateOutletContext]="{
            $implicit: {
              node: node,
              data: node.data ?? createSignal({}),
              selected: createSignal(false),
              preselected: createSignal(false),
              width: node.width ?? createSignal(0),
              height: node.height ?? createSignal(0),
              shouldLoad: createSignal(true),
            },
          }" />
      }
    }

    @for (edge of edges; track $index) {
      @if (edgeTemplateDirective()) {
        <ng-component
          [ngTemplateOutlet]="edgeTemplateDirective()?.templateRef ?? null"
          [ngTemplateOutletContext]="{
            $implicit: {
              edge: edge,
              data: edge.data ?? createSignal({}),
              selected: createSignal(false),
              path: createSignal(''),
              markerStart: createSignal(''),
              markerEnd: createSignal(''),
            },
          }" />
      }
    }

    @if (connectionTemplateDirective()?.templateRef; as connectionTemplate) {
      <ng-component
        [ngTemplateOutlet]="connectionTemplate"
        [ngTemplateOutletContext]="{
          $implicit: {
            path: createSignal(''),
            marker: createSignal(''),
          },
        }" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class VflowMockComponent implements AsInterface<VflowComponent>, OnInit {
  @Input() public ariaLabelConfig: Partial<AriaLabelConfig> = {};
  @Input({ required: true })
  public readonly nodes!: Node[];

  @Input()
  public readonly edges!: Edge[];

  @Input()
  public readonly view: [number, number] | 'auto' = [400, 400];

  @Input()
  public readonly minZoom = 0.5;

  @Input()
  public readonly maxZoom = 3;

  @Input()
  public readonly background: Background | null = null;

  @Input()
  public readonly optimization = DEFAULT_OPTIMIZATION;

  @Input()
  public readonly nodesSelectable = true;

  @Input()
  public readonly edgesSelectable = true;

  @Input()
  public readonly nodesFocusable = true;

  @Input()
  public readonly edgesFocusable = true;

  @Input()
  public readonly selectionMode: SelectionMode = 'default';

  @Input()
  public readonly selectionBox: SelectionBoxSettings = { mode: 'full' };

  @Input() public zoomOnScroll = true;
  @Input() public zoomOnPinch = true;
  @Input() public zoomOnDoubleClick = false;
  @Input() public panOnDrag: boolean | number[] = true;
  @Input() public panOnScroll = false;
  @Input() public paneClickDistance = 6;
  @Input() public nodeDragThreshold = 0;
  @Input() public connectionDragThreshold = 0;

  @Input()
  public readonly keyboardShortcuts: KeyboardShortcuts = {
    modifiers: { multiSelection: [] },
  };

  @Input({
    transform: (settings: ConnectionSettings) => new ConnectionModel(settings),
  })
  public readonly connection: ConnectionModel = new ConnectionModel({});

  @Input()
  public readonly snapGrid!: [number, number];

  @Input()
  public elevateNodesOnSelect!: boolean;

  @Input()
  public elevateEdgesOnSelect!: boolean;

  @Input()
  public autoPan: boolean | AutoPanSettings = true;

  @Input() public autoPanOnNodeFocus = true;

  public alignmentHelper = input<boolean | AlignmentHelperSettings>(false);

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly componentNodeEvent = output<any>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly componentEdgeEvent = output<any>();

  public readonly deleteRequest = output<DeleteRequest>();

  public readonly connectStart = output<ConnectStartEvent>();
  public readonly connect = output<Connection>();
  public readonly connectEnd = output<ConnectEndEvent>();
  public readonly reconnectStart = output<ReconnectStartEvent>();
  public readonly reconnect = output<ReconnectEvent>();
  public readonly reconnectEnd = output<ReconnectEndEvent>();

  protected nodeTemplateDirective = contentChild(NodeTemplateMockDirective);

  protected edgeTemplateDirective = contentChild(EdgeTemplateMockDirective);

  protected connectionTemplateDirective = contentChild(ConnectionTemplateMockDirective);

  public viewport = signal<ViewportState>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  public nodesChange = signal<NodeChange[]>([]);
  public edgesChange = signal<EdgeChange[]>([]);
  public initialized = signal(true);

  public initialized$ = toObservable(this.initialized);
  public viewportChange$ = toObservable(this.viewport);
  public nodesChange$ = toObservable(this.nodesChange);
  public edgesChange$ = toObservable(this.edgesChange);

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  public ngOnInit() {}

  // The viewport methods apply at once, keep the zoom to the limits and take the pane center at the flow origin.

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setViewport(viewport: ViewportState, options?: ViewportOptions): Promise<boolean> {
    this.viewport.set({ ...viewport, zoom: this.clampZoom(viewport.zoom) });
    return Promise.resolve(true);
  }

  public setCenter(point: Point, options?: SetCenterOptions): Promise<boolean> {
    const zoom = this.clampZoom(options?.zoom ?? this.viewport().zoom);
    this.viewport.set({ x: -point.x * zoom, y: -point.y * zoom, zoom });
    return Promise.resolve(true);
  }

  /** Does not move the viewport: the mock does not lay out nodes. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public fitView(options?: FitViewOptions): Promise<boolean> {
    return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public zoomTo(zoom: number, options?: ViewportOptions): Promise<boolean> {
    this.viewport.update((prev) => ({ ...prev, zoom: this.clampZoom(zoom) }));
    return Promise.resolve(true);
  }

  public zoomIn(options?: ViewportOptions): Promise<boolean> {
    return this.zoomTo(this.viewport().zoom * MOCK_ZOOM_STEP, options);
  }

  public zoomOut(options?: ViewportOptions): Promise<boolean> {
    return this.zoomTo(this.viewport().zoom / MOCK_ZOOM_STEP, options);
  }

  private clampZoom(zoom: number) {
    return Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
  }

  public clientToFlowPosition(point: Point): Point {
    return point;
  }

  public flowToClientPosition(point: Point): Point {
    return point;
  }

  public getNodesAtPoint<T = unknown>(): Array<Node<T> & { nodeSpacePoint: Point }> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getIntersectingNodes(nodeId: string, options?: IntersectingNodesOptions): Node[] {
    return [];
  }

  public getNode<T = unknown>(id: string): Node<T> | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  /** The mock does not measure: only a node with both `width` and `height` has a rectangle. */
  public getNodeRect(id: string): Rect | undefined {
    const node = this.getNode(id);
    const width = node?.width?.();
    const height = node?.height?.();
    if (!node || width === undefined || height === undefined) return undefined;

    const point = getNodePositionInSpace(id, null, this.nodes) ?? node.point();
    return { ...point, width, height };
  }

  public getNodesBounds(ids?: string[]): Rect {
    const rects = (ids ?? this.nodes.map((node) => node.id)).flatMap((id) => this.getNodeRect(id) ?? []);
    if (!rects.length) return { x: 0, y: 0, width: 0, height: 0 };

    const x = Math.min(...rects.map((rect) => rect.x));
    const y = Math.min(...rects.map((rect) => rect.y));
    return {
      x,
      y,
      width: Math.max(...rects.map((rect) => rect.x + rect.width)) - x,
      height: Math.max(...rects.map((rect) => rect.y + rect.height)) - y,
    };
  }

  public getDetachedEdges(): Edge[] {
    return [];
  }

  protected createSignal<T>(value: T): WritableSignal<T> {
    return signal(value);
  }
}
