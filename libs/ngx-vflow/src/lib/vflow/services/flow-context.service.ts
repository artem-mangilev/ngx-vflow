import { computed, effect, ElementRef, inject, Injectable, Signal, signal, untracked } from '@angular/core';
import { GeometryChange, GestureSession, IntentKind } from '../features/geometry-intent.interface';
import { FlowInteraction, ProposeOptions, RenderedNodeGeometry, VflowContext } from '../features/vflow-context';
import { Node } from '../interfaces/node.interface';
import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';
import { NodeModel } from '../models/node.model';
import {
  clientToFlowPosition,
  flowToClientPosition,
  flowToNodeSpacePosition,
  nodeSpaceToFlowPosition,
} from '../utils/coordinates';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { FlowStatusService } from './flow-status.service';
import { ViewportService } from './viewport.service';

/** The flow's implementation of {@link VflowContext}, provided on `<vflow>` under the abstract class. */
@Injectable()
export class FlowContextService extends VflowContext {
  private readonly entities = inject(FlowEntitiesService);
  private readonly settings = inject(FlowSettingsService);
  private readonly status = inject(FlowStatusService);
  private readonly viewportService = inject(ViewportService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The pane that positions flow space; the host stands in until the view attaches it. */
  private pane: HTMLElement | null = null;

  private readonly gestureState = signal<GestureSession | null>(null);
  private readonly revisionState = signal(0);
  private readonly pointerState = signal<Point | null>(null);
  private readonly rawNodeById = computed(() => new Map(this.entities.rawNodes().map((node) => [node.id, node])));

  public readonly gesture: Signal<GestureSession | null> = this.gestureState.asReadonly();
  public readonly revision: Signal<number> = this.revisionState.asReadonly();
  public readonly pointer: Signal<Point | null> = this.pointerState.asReadonly();
  public readonly viewport: Signal<ViewportState> = this.viewportService.readableViewport.asReadonly();
  public readonly size = computed(() => ({
    width: this.settings.computedFlowWidth(),
    height: this.settings.computedFlowHeight(),
  }));

  public readonly interaction = computed<FlowInteraction | null>(() => {
    const state = this.status.status().state;
    if (state.startsWith('node-drag')) return state === 'node-drag-end' ? null : 'node-drag';
    if (state.startsWith('reconnection')) return state.endsWith('dropped') ? null : 'reconnection';
    if (state.startsWith('connection')) return state.endsWith('dropped') ? null : 'connection';
    return null;
  });

  constructor() {
    super();
    // One document listener for every feature, alive only while a gesture is.
    effect((onCleanup) => {
      if (!this.interaction()) {
        untracked(() => this.pointerState.set(null));
        return;
      }
      const update = (event: PointerEvent) => this.pointerState.set(this.toViewportPoint(event));
      const options = { capture: true, passive: true };
      document.addEventListener('pointerdown', update, options);
      document.addEventListener('pointermove', update, options);
      onCleanup(() => {
        document.removeEventListener('pointerdown', update, options);
        document.removeEventListener('pointermove', update, options);
      });
    });
  }

  /** Called by the pane directive once the view exists. */
  public attachPane(pane: HTMLElement): void {
    this.pane = pane;
  }

  public getNodeGeometry(id: string): RenderedNodeGeometry | null {
    const model = this.entities.getNode(id);
    if (!model) return null;
    const { x, y } = model.globalPoint();

    return {
      id,
      x,
      y,
      width: model.width(),
      height: model.height(),
      point: model.point(),
      parentId: model.parent()?.rawNode.id ?? null,
      measured: model.isMeasured(),
    };
  }

  public propose(kind: IntentKind, changes: GeometryChange[], options: ProposeOptions = {}): boolean {
    // Until the intent pipeline lands, a proposal is applied as given.
    void kind;
    void options;
    let applied = false;
    for (const change of changes) {
      const model = this.entities.getNode(change.id);
      if (!model || !isFinite(change)) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          console.error(
            `[ngx-vflow] Dropped a geometry change for node "${change.id}": ${
              model ? 'a value is not a finite number' : 'no such node'
            }.`,
          );
        }
        continue;
      }
      this.apply(model, change);
      applied = true;
    }
    if (applied) this.revisionState.update((revision) => revision + 1);
    return applied;
  }

  public panBy(delta: Point): void {
    const { x, y, zoom } = this.viewportService.readableViewport();
    this.viewportService.writableViewport.set({
      changeType: 'absolute',
      state: { x: x + delta.x, y: y + delta.y, zoom },
      duration: 0,
    });
  }

  public clientToFlowPosition(point: Point): Point {
    return clientToFlowPosition(point, this.transformOptions());
  }

  public flowToClientPosition(point: Point): Point {
    return flowToClientPosition(point, this.transformOptions());
  }

  public nodeSpaceToFlowPosition(point: Point, spaceNodeId: string): Point | undefined {
    return nodeSpaceToFlowPosition(point, spaceNodeId, this.rawNodeById() as ReadonlyMap<string, Node>);
  }

  public flowToNodeSpacePosition(point: Point, spaceNodeId: string): Point | undefined {
    return flowToNodeSpacePosition(point, spaceNodeId, this.rawNodeById() as ReadonlyMap<string, Node>);
  }

  private apply(model: NodeModel, change: GeometryChange): void {
    if (change.width !== undefined || change.height !== undefined) {
      // A written size is data, as after a resize gesture: the node stops following its content.
      if (!model.resizedExplicitly()) model.resizedExplicitly.set(true);
      if (change.width !== undefined) model.width.set(change.width);
      if (change.height !== undefined) model.height.set(change.height);
    }
    if (change.point) model.setPoint({ x: change.point.x, y: change.point.y });
  }

  private transformOptions() {
    const rect = (this.pane ?? this.host).getBoundingClientRect();
    return { viewport: this.viewportService.readableViewport(), containerPosition: { x: rect.left, y: rect.top } };
  }

  private toViewportPoint(event: PointerEvent): Point {
    const rect = (this.pane ?? this.host).getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
}

function isFinite(change: GeometryChange): boolean {
  const values = [change.point?.x, change.point?.y, change.width, change.height];
  return values.every((value) => value === undefined || Number.isFinite(value));
}
