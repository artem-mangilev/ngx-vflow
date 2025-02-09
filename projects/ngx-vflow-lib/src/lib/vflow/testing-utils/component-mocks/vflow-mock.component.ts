import { ChangeDetectionStrategy, Component, contentChild, input, output, signal, WritableSignal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Node, DynamicNode } from '../../interfaces/node.interface';
import { Edge } from '../../interfaces/edge.interface';
import { Point } from '../../interfaces/point.interface';
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
@Component({
  selector: 'vflow',
  template: `
    <ng-content />

    @for (node of nodes(); track $index) {
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

    @for (edge of edges(); track $index) {
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

    @if (connection()?.type === 'template') {
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
export class VflowMockComponent {
  public readonly nodes = input.required<Node[] | DynamicNode[]>();
  public readonly edges = input.required<Edge[]>();

  public readonly view = input<[number, number] | 'auto'>([400, 400]);
  public readonly minZoom = input(0.5);
  public readonly maxZoom = input(3);
  public readonly background = input<Background | string>('#fff');
  public readonly optimization = input<Optimization>({
    detachedGroupsLayer: false,
  });
  public readonly entitiesSelectable = input(true);
  public readonly keyboardShortcuts = input<KeyboardShortcuts>({
    multiSelection: null,
  });
  public readonly connection = input<ConnectionSettings>();

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

  public documentPointToFlowPoint(point: Point): Point {
    return point;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getNode<T = unknown>(id: string): Node<T> | DynamicNode<T> | undefined {
    return this.nodes().find((node) => node.id === id);
  }

  public getDetachedEdges(): Edge[] {
    return [];
  }

  protected createSignal<T>(value: T): WritableSignal<T> {
    return signal(value);
  }
}
