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
} from 'ngx-vflow';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  ConnectionTemplateMockDirective,
  EdgeLabelHtmlTemplateMockDirective,
  EdgeTemplateMockDirective,
  GroupNodeTemplateMockDirective,
  NodeHtmlTemplateMockDirective,
} from '../directive-mocks/template-mock.directive';
import { AsInterface } from '../types';

@Component({
  selector: 'vflow',
  template: `
    <ng-content />

    @for (node of nodes; track $index) {
      @if (node.type === 'html-template') {
        <ng-component
          [ngTemplateOutlet]="nodeTemplateDirective()?.templateRef ?? null"
          [ngTemplateOutletContext]="{
            $implicit: {
              node: node,
              selected: createSignal(false),
            },
          }" />
      }

      @if (node.type === 'template-group') {
        <ng-component
          [ngTemplateOutlet]="groupNodeTemplateDirective()?.templateRef ?? null"
          [ngTemplateOutletContext]="{
            $implicit: {
              node: node,
              selected: createSignal(false),
              width: createSignal(node.width),
              height: createSignal(node.height),
            },
          }" />
      }
    }

    @for (edge of edges; track $index) {
      @if (edge.type === 'template') {
        <ng-component
          [ngTemplateOutlet]="edgeTemplateDirective()?.templateRef ?? null"
          [ngTemplateOutletContext]="{
            $implicit: {
              edge: edge,
              selected: createSignal(false),
              path: createSignal(''),
              markerStart: createSignal(''),
              markerEnd: createSignal(''),
            },
          }" />

        @if (edge.edgeLabels?.()?.start; as label) {
          <ng-component
            [ngTemplateOutlet]="edgeLabelHtmlDirective()?.templateRef ?? null"
            [ngTemplateOutletContext]="{
              $implicit: {
                edge: edge,
                label,
              },
            }" />
        }

        @if (edge.edgeLabels?.()?.center; as label) {
          <ng-component
            [ngTemplateOutlet]="edgeLabelHtmlDirective()?.templateRef ?? null"
            [ngTemplateOutletContext]="{
              $implicit: {
                edge: edge,
                label,
              },
            }" />
        }

        @if (edge.edgeLabels?.()?.end; as label) {
          <ng-component
            [ngTemplateOutlet]="edgeLabelHtmlDirective()?.templateRef ?? null"
            [ngTemplateOutletContext]="{
              $implicit: {
                edge: edge,
                label,
              },
            }" />
        }
      }
    }

    @if (connection.type === 'template') {
      <ng-component
        [ngTemplateOutlet]="connectionTemplateDirective()?.templateRef ?? null"
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
  public readonly background: Background | string = '#fff';

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
  public readonly selectionBox: SelectionBoxSettings = {
    mode: 'full',
    color: '#bbe1fa',
  };

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
    multiSelection: null,
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

  public alignmentHelper = input<boolean | AlignmentHelperSettings>(false);

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly componentNodeEvent = output<any>();

  protected nodeTemplateDirective = contentChild(NodeHtmlTemplateMockDirective);

  protected groupNodeTemplateDirective = contentChild(GroupNodeTemplateMockDirective);

  protected edgeTemplateDirective = contentChild(EdgeTemplateMockDirective);

  protected edgeLabelHtmlDirective = contentChild(EdgeLabelHtmlTemplateMockDirective);

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

  public viewportTo(viewport: ViewportState): void {
    this.viewport.set(viewport);
  }

  public zoomTo(zoom: number): void {
    this.viewport.update((prev) => ({ ...prev, zoom }));
  }

  public panTo(point: Point): void {
    this.viewport.update((prev) => ({ ...prev, x: point.x, y: point.y }));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public fitView(options?: FitViewOptions): void {}

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

  public getDetachedEdges(): Edge[] {
    return [];
  }

  protected createSignal<T>(value: T): WritableSignal<T> {
    return signal(value);
  }
}
