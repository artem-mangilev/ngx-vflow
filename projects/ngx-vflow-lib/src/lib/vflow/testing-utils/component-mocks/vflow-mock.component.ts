import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  Input,
  input,
  output,
  signal,
  WritableSignal,
  OnInit,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Node, DynamicNode } from '../../interfaces/node.interface';
import { Edge } from '../../interfaces/edge.interface';
import { LayeredPoint, Point } from '../../interfaces/point.interface';
import { Background } from '../../types/background.type';
import { Optimization } from '../../interfaces/optimization.interface';
import { KeyboardShortcuts } from '../../types/keyboard-action.type';
import { ConnectionSettings } from '../../interfaces/connection-settings.interface';
import { ViewportState } from '../../interfaces/viewport.interface';
import { NodeChange } from '../../types/node-change.type';
import { EdgeChange } from '../../types/edge-change.type';
import { toObservable } from '@angular/core/rxjs-interop';
import { FitViewOptions } from '../../interfaces/fit-view-options.interface';
import {
  ConnectionTemplateMockDirective,
  EdgeLabelHtmlTemplateMockDirective,
  EdgeTemplateMockDirective,
  GroupNodeTemplateMockDirective,
  NodeHtmlTemplateMockDirective,
} from '../directive-mocks/template-mock.directive';
import { VflowComponent } from '../../components/vflow/vflow.component';
import { ConnectionModel } from '../../models/connection.model';
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

        @if (edge.edgeLabels?.start) {
          <ng-component
            [ngTemplateOutlet]="edgeLabelHtmlDirective()?.templateRef ?? null"
            [ngTemplateOutletContext]="{
              $implicit: {
                edge: edge,
              },
            }" />
        }

        @if (edge.edgeLabels?.center) {
          <ng-component
            [ngTemplateOutlet]="edgeLabelHtmlDirective()?.templateRef ?? null"
            [ngTemplateOutletContext]="{
              $implicit: {
                edge: edge,
                label: edge.edgeLabels?.center,
              },
            }" />
        }

        @if (edge.edgeLabels?.end) {
          <ng-component
            [ngTemplateOutlet]="edgeLabelHtmlDirective()?.templateRef ?? null"
            [ngTemplateOutletContext]="{
              $implicit: {
                edge: edge,
                label: edge.edgeLabels?.end,
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
  standalone: true,
  imports: [NgTemplateOutlet],
})
export class VflowMockComponent implements AsInterface<VflowComponent>, OnInit {
  @Input({ required: true })
  public readonly nodes!: Node[] | DynamicNode[];

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

  public readonly optimization = input<Optimization>({
    detachedGroupsLayer: false,
  });

  @Input()
  public readonly entitiesSelectable = true;

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

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  public readonly onComponentNodeEvent = output<any>();

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

  public documentPointToFlowPoint(point: Point, options?: { layers: false }): Point;
  public documentPointToFlowPoint(point: Point, options: { layers: true }): LayeredPoint[];
  public documentPointToFlowPoint(point: Point, options?: { layers: boolean }): unknown {
    if (options?.layers) {
      return [
        {
          nodeId: null,
          x: point.x,
          y: point.y,
        },
      ];
    }

    return point;
  }

  public getNode<T = unknown>(id: string): Node<T> | DynamicNode<T> | undefined {
    return this.nodes.find((node) => node.id === id);
  }

  public getDetachedEdges(): Edge[] {
    return [];
  }

  protected createSignal<T>(value: T): WritableSignal<T> {
    return signal(value);
  }
}
