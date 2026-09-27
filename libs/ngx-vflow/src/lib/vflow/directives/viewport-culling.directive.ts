import { DestroyRef, Directive, EffectRef, Injector, NgZone, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { FlowSettingsService } from '../services/flow-settings.service';
import { ViewportService } from '../services/viewport.service';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { SpatialIndex } from '../utils/spatial-index';
import { Rect } from '../interfaces/rect';
import { getViewportBounds } from '../utils/viewport';
import { rectsIntersect } from '../utils/rect';

/** Entities a gesture moved out of view are reported this long after the last viewport change at the latest. */
const LEAVE_DELAY_MS = 300;

type Entity = NodeModel | EdgeModel;

/**
 * A host directive of the flow that maintains `inViewport` of every node and edge from a spatial index, so that a viewport change costs the entities
 * near the viewport rather than a scan of the whole graph. Each entity has one tracker effect for its own rect:
 * moving a node updates the index for that node and its edges only.
 *
 * An entity that enters the viewport is reported at once. One that a viewport gesture moves out of view is reported
 * when the gesture ends: hiding it earlier would spend a style recalculation in the middle of the motion on
 * something already outside the viewport. A change of the entity's own geometry reports both directions at once,
 * because no gesture end follows it.
 */
@Directive({ selector: '[vflowViewportCulling]', standalone: true })
export class ViewportCullingDirective {
  private readonly entities = inject(FlowEntitiesService);
  private readonly settings = inject(FlowSettingsService);
  private readonly viewport = inject(ViewportService);
  private readonly injector = inject(Injector);
  private readonly zone = inject(NgZone);

  private readonly nodeIndex = new SpatialIndex<NodeModel>();
  private readonly edgeIndex = new SpatialIndex<EdgeModel>();
  private readonly nodeTrackers = new Map<NodeModel, EffectRef>();
  private readonly edgeTrackers = new Map<EdgeModel, EffectRef>();
  /** Entities whose `inViewport` is true. */
  private readonly inside = new Set<Entity>();
  /** Members of {@link inside} that the current gesture moved out of view. */
  private readonly leaving = new Set<Entity>();
  private bounds: Rect | null = null;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const nodes = this.entities.nodes();
      untracked(() => this.track(nodes, this.nodeTrackers, this.nodeIndex, (node) => this.trackNode(node)));
    });
    effect(() => {
      const edges = this.entities.validEdges();
      untracked(() => this.track(edges, this.edgeTrackers, this.edgeIndex, (edge) => this.trackEdge(edge)));
    });
    effect(() => {
      const bounds = this.currentBounds();
      untracked(() => this.moveViewport(bounds));
    });
    this.viewport.viewportChangeEnd$.pipe(takeUntilDestroyed()).subscribe(() => this.sync());
    inject(DestroyRef).onDestroy(() => {
      this.clearLeaveTimer();
      for (const ref of this.nodeTrackers.values()) ref.destroy();
      for (const ref of this.edgeTrackers.values()) ref.destroy();
      this.nodeTrackers.clear();
      this.edgeTrackers.clear();
    });
  }

  /** Reports every entity against the current viewport at once, including those a gesture moved out of view. */
  public sync(): void {
    this.clearLeaveTimer();
    this.apply(this.currentBounds(), true);
  }

  private currentBounds(): Rect {
    return getViewportBounds(
      this.viewport.readableViewport(),
      this.settings.computedFlowWidth(),
      this.settings.computedFlowHeight(),
    );
  }

  private moveViewport(bounds: Rect) {
    this.apply(bounds, false);
    if (this.leaving.size > 0) this.scheduleLeave();
  }

  private apply(bounds: Rect, leaveNow: boolean) {
    this.bounds = bounds;
    const visible = new Set<Entity>(this.nodeIndex.query(bounds));
    for (const edge of this.edgeIndex.query(bounds)) visible.add(edge);
    for (const entity of visible) this.report(entity, true, true);
    for (const entity of [...this.inside]) if (!visible.has(entity)) this.report(entity, false, leaveNow);
  }

  private report(entity: Entity, visible: boolean, leaveNow: boolean) {
    if (visible) {
      this.leaving.delete(entity);
      if (!this.inside.has(entity)) {
        this.inside.add(entity);
        entity.inViewport.set(true);
      }
    } else if (this.inside.has(entity)) {
      if (leaveNow) {
        this.inside.delete(entity);
        this.leaving.delete(entity);
        entity.inViewport.set(false);
      } else {
        this.leaving.add(entity);
      }
    }
  }

  private place<T extends Entity>(entity: T, index: SpatialIndex<T>, rect: Rect | null) {
    if (rect) index.set(entity, rect);
    else index.delete(entity);
    if (this.bounds) this.report(entity, rect !== null && rectsIntersect(rect, this.bounds), true);
  }

  private track<T extends Entity>(
    list: T[],
    trackers: Map<T, EffectRef>,
    index: SpatialIndex<T>,
    create: (entity: T) => EffectRef,
  ) {
    const current = new Set(list);
    for (const [entity, ref] of trackers) {
      if (current.has(entity)) continue;
      ref.destroy();
      trackers.delete(entity);
      index.delete(entity);
      this.inside.delete(entity);
      this.leaving.delete(entity);
    }
    for (const entity of list) if (!trackers.has(entity)) trackers.set(entity, create(entity));
  }

  private trackNode(node: NodeModel): EffectRef {
    return effect(
      () => {
        const { x, y } = node.globalPoint();
        const rect = { x, y, width: node.width(), height: node.height() };
        untracked(() => this.place(node, this.nodeIndex, rect));
      },
      { injector: this.injector, manualCleanup: true },
    );
  }

  private trackEdge(edge: EdgeModel): EffectRef {
    return effect(
      () => {
        const rect = edge.bounds();
        untracked(() => this.place(edge, this.edgeIndex, rect));
      },
      { injector: this.injector, manualCleanup: true },
    );
  }

  private scheduleLeave() {
    this.clearLeaveTimer();
    this.zone.runOutsideAngular(() => {
      this.leaveTimer = setTimeout(() => {
        this.leaveTimer = null;
        this.zone.run(() => this.sync());
      }, LEAVE_DELAY_MS);
    });
  }

  private clearLeaveTimer() {
    if (this.leaveTimer !== null) clearTimeout(this.leaveTimer);
    this.leaveTimer = null;
  }
}
