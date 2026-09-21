import { inject, Injectable, Injector, Signal, signal } from '@angular/core';
import {
  GeometryChange,
  GeometryIntent,
  GestureSession,
  GestureSource,
  IntentKind,
  WriteOrigin,
} from '../features/geometry-intent.interface';
import { VflowContext } from '../features/vflow-context';
import { Rect } from '../interfaces/rect';
import { NodeModel } from '../models/node.model';
import { id } from '../utils/id';
import { FeatureRegistryService } from './feature-registry.service';
import { FlowEntitiesService } from './flow-entities.service';

/**
 * The one seam between a computed geometry change and the application's signals: every library-originated move
 * or resize passes through the registered transforms here before it is written, in one synchronous pass.
 */
@Injectable()
export class GeometryPipelineService {
  private readonly entities = inject(FlowEntitiesService);
  // Looked up late: the registry creates entries, entries inject the context, the context injects this service.
  private readonly injector = inject(Injector);

  private readonly sessionState = signal<GestureSession | null>(null);
  private readonly revisionState = signal(0);

  /** The gesture session in progress. */
  public readonly session: Signal<GestureSession | null> = this.sessionState.asReadonly();
  /** Increments after every applied batch. */
  public readonly revision: Signal<number> = this.revisionState.asReadonly();

  public beginSession(session: GestureSession): void {
    this.sessionState.set(session);
  }

  public endSession(): void {
    this.sessionState.set(null);
  }

  /**
   * Runs the transforms that see this intent and, for `update` and `end`, applies what survives. Returns `false`
   * when a transform vetoed; the caller decides what a veto means for its phase.
   */
  public run(intent: GeometryIntent): boolean {
    if (!this.transform(intent)) return false;
    if (intent.phase !== 'start') this.apply(intent.changes);
    return true;
  }

  /**
   * A gesture that begins and ends in one tick: the transforms of `start` see the current geometry, those of
   * `update` and `end` the same proposal, and the result is written once. Returns whether anything was applied.
   */
  public runOneShot(
    kind: IntentKind,
    source: GestureSource,
    changes: GeometryChange[],
    origin: WriteOrigin,
    initiator = changes[0]?.id,
  ): boolean {
    if (!changes.length) return false;
    const session = this.createSession(
      source,
      initiator,
      changes.map((change) => change.id),
    );
    this.beginSession(session);
    try {
      const allowed =
        this.transform({ kind, phase: 'start', session, origin, changes: this.currentGeometry(session) }) &&
        this.transform({ kind, phase: 'update', session, origin, changes }) &&
        this.transform({ kind, phase: 'end', session, origin, changes });
      return allowed && this.apply(changes);
    } finally {
      this.endSession();
    }
  }

  /** Runs the transforms that see this intent; `false` when one vetoed. */
  private transform(intent: GeometryIntent): boolean {
    const registry = this.injector.get(FeatureRegistryService, null, { optional: true });
    const transforms = registry?.transformsFor(intent.kind, intent.phase) ?? [];
    if (!transforms.length) return true;
    const context = this.injector.get(VflowContext);
    for (const transform of transforms) {
      if (transform.transform(intent, context) === false) return false;
    }
    return true;
  }

  public createSession(source: GestureSource, initiator: string, nodes: readonly string[]): GestureSession {
    const initial = new Map<string, Rect>();
    for (const nodeId of nodes) {
      const model = this.entities.getNode(nodeId);
      if (model) initial.set(nodeId, { ...model.point(), width: model.width(), height: model.height() });
    }
    return { id: id(), source, initiator, nodes: [...nodes], initial, pointer: signal(null).asReadonly() };
  }

  /** The session's nodes as changes carrying their current position. */
  public currentGeometry(session: GestureSession): GeometryChange[] {
    const changes: GeometryChange[] = [];
    for (const nodeId of session.nodes) {
      const model = this.entities.getNode(nodeId);
      if (model) changes.push({ id: nodeId, point: { ...model.point() } });
    }
    return changes;
  }

  /** The session's nodes as changes carrying the geometry they had when it started. */
  public initialGeometry(session: GestureSession): GeometryChange[] {
    return [...session.initial].map(([nodeId, rect]) => ({ id: nodeId, point: { x: rect.x, y: rect.y } }));
  }

  /** Writes a batch into the application's signals without running transforms. */
  public apply(changes: readonly GeometryChange[]): boolean {
    let applied = false;
    for (const change of changes) {
      const model = this.entities.getNode(change.id);
      if (!model || !hasFiniteValues(change)) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          console.error(
            `[ngx-vflow] Dropped a geometry change for node "${change.id}": ${
              model ? 'a value is not a finite number' : 'no such node'
            }.`,
          );
        }
        continue;
      }
      write(model, change);
      applied = true;
    }
    if (applied) this.revisionState.update((revision) => revision + 1);
    return applied;
  }
}

function write(model: NodeModel, change: GeometryChange): void {
  if (change.width !== undefined || change.height !== undefined) {
    // A written size is data, as after a resize gesture: the node stops following its content.
    if (!model.resizedExplicitly()) model.resizedExplicitly.set(true);
    if (change.width !== undefined) model.width.set(change.width);
    if (change.height !== undefined) model.height.set(change.height);
  }
  if (change.point) model.setPoint({ x: change.point.x, y: change.point.y });
}

function hasFiniteValues(change: GeometryChange): boolean {
  const values = [change.point?.x, change.point?.y, change.width, change.height];
  return values.every((value) => value === undefined || Number.isFinite(value));
}
