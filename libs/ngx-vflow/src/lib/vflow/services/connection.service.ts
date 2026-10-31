import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { NodeModel } from '../models/node.model';
import { HandleModel } from '../models/handle.model';
import { EdgeModel } from '../models/edge.model';
import { Point } from '../interfaces/point.interface';
import { Connection } from '../interfaces/connection.interface';
import { ConnectionForValidation } from '../interfaces/connection-settings.interface';
import { ConnectionInternal } from '../interfaces/connection.internal.interface';
import {
  ConnectEndEvent,
  ConnectionEventHandle,
  ConnectStartEvent,
  ReconnectEndEvent,
  ReconnectEvent,
  ReconnectStartEvent,
} from '../interfaces/connection-events.interface';
import { FlowEntitiesService } from './flow-entities.service';
import { FlowSettingsService } from './flow-settings.service';
import { adjustDirection } from '../utils/adjust-direction';
import { sameConnection } from '../utils/same-connection';
import { listen } from '../utils/listen';
import { createPointerTracker } from '../gestures/pointer-drag';

/** The handle under the pointer and whether the connection it would make is valid. */
export interface ConnectionCandidate {
  node: NodeModel;
  handle: HandleModel;
  valid: boolean;
}

/** A connection gesture in progress: a reconnection is a connection dragged from one end of an existing edge. */
export interface ConnectionGesture {
  /** The node and handle the connection is dragged from. */
  source: NodeModel;
  sourceHandle: HandleModel;
  /** The edge being reconnected; a new connection has none. */
  oldEdge?: EdgeModel;
  candidate: ConnectionCandidate | null;
}

/**
 * The connection gesture of the flow: it starts on a handle or a reconnection handle, validates the handle under the
 * pointer and ends on the release. The gesture is one signal; the nodes, handles and edge it involves carry their
 * state themselves, written on each transition, so that a transition costs its participants and not every entity.
 */
@Injectable()
export class ConnectionService {
  private readonly settings = inject(FlowSettingsService);
  private readonly entities = inject(FlowEntitiesService);

  public readonly gesture = signal<ConnectionGesture | null>(null);

  /** Whether a connection gesture is in progress. */
  public readonly active = computed(() => this.gesture() !== null);

  /** Client position of the pointer of the gesture, from its press on. Its own signal: a move invalidates nothing else. */
  public readonly pointer = signal<Point>({ x: 0, y: 0 });

  public readonly connectStart$ = new Subject<ConnectStartEvent>();
  /** An application-owned structural connection request, after validation. */
  public readonly connect$ = new Subject<Connection>();
  public readonly connectEnd$ = new Subject<ConnectEndEvent>();
  public readonly reconnectStart$ = new Subject<ReconnectStartEvent>();
  public readonly reconnect$ = new Subject<ReconnectEvent>();
  public readonly reconnectEnd$ = new Subject<ReconnectEndEvent>();

  /** What the tracked press begins once it passes the drag threshold. */
  private pendingStart: (() => void) | null = null;
  private stopContextMenu: (() => void) | null = null;

  private readonly tracker = createPointerTracker({
    threshold: () => this.settings.connectionDragThreshold(),
    onStart: ({ point }) => {
      this.pointer.set(point);
      const begin = this.pendingStart;
      this.pendingStart = null;
      begin?.();
    },
    onMove: ({ point }) => this.pointer.set(point),
    onEnd: () => this.end(),
    onCancel: () => this.end(),
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.tracker.destroy();
      this.stopContextMenu?.();
    });
  }

  /**
   * Starts a connection from the handle, or the reconnection of `oldEdge` from the handle that stays attached. With
   * a pointer event the gesture begins once the pointer passes the drag threshold and follows it to the release;
   * without one it begins at once and ends with {@link end}.
   */
  public start(handle: HandleModel, event?: Event, oldEdge?: EdgeModel) {
    if (!oldEdge && !handle.canStart()) return;

    this.tracker.release();
    this.pendingStart = null;

    if (!(event instanceof PointerEvent)) {
      this.begin(handle, oldEdge);
      return;
    }

    releaseImplicitCapture(event);
    this.pendingStart = () => this.begin(handle, oldEdge);
    this.tracker.press(event);
  }

  /** The pointer entered a handle, or the magnet around it: the handle becomes the candidate. */
  public hover(handle: HandleModel) {
    const gesture = this.gesture();
    if (!gesture) return;

    let valid = false;
    if (handle.canAccept()) {
      valid = this.isValid(this.toConnection(gesture, handle), gesture.oldEdge);
    }

    this.setGesture({ ...gesture, candidate: { node: handle.parentNode, handle, valid } });
  }

  /** The pointer left the candidate; leaving any other handle, the origin included, changes nothing. */
  public leave(handle: HandleModel) {
    const gesture = this.gesture();
    if (!gesture || gesture.candidate?.handle !== handle) return;

    this.setGesture({ ...gesture, candidate: null });
  }

  /**
   * The release: on a candidate that accepts, the connection is validated again and reported; anywhere else the
   * gesture is dropped. Either way the end is reported with the sides it connected, or `null` for a drop.
   */
  public end() {
    this.tracker.release();
    this.pendingStart = null;
    this.stopContextMenu?.();
    this.stopContextMenu = null;

    const gesture = this.gesture();
    if (!gesture) return;

    const { source, sourceHandle, oldEdge, candidate } = gesture;
    const from = { node: source.rawNode, handle: eventHandle(sourceHandle) };
    let valid: boolean | null = null;
    let to: ConnectEndEvent['to'] = { node: null, handle: null };
    let connection: ConnectionForValidation | null = null;

    if (candidate && candidate.handle.canAccept()) {
      connection = this.toConnection(gesture, candidate.handle);
      valid = this.isValid(connection, oldEdge);
      to = { node: candidate.node.rawNode, handle: eventHandle(candidate.handle) };
    }

    this.setGesture(null);

    if (oldEdge) {
      if (valid && connection) this.reconnect$.next({ edge: oldEdge.edge, connection });
      this.reconnectEnd$.next({ edge: oldEdge.edge, valid, from, to });
    } else {
      if (valid && connection) this.connect$.next(connection);
      this.connectEnd$.next({ valid, from, to });
    }
  }

  private begin(handle: HandleModel, oldEdge?: EdgeModel) {
    if (!oldEdge && !handle.canStart()) return;

    const source = handle.parentNode;
    this.setGesture({ source, sourceHandle: handle, oldEdge, candidate: null });
    // A context menu takes the pointer away without a release the gesture would see.
    this.stopContextMenu?.();
    this.stopContextMenu = listen(document, 'contextmenu', () => this.end());

    const start = { node: source.rawNode, handle: eventHandle(handle) };
    if (oldEdge) this.reconnectStart$.next({ edge: oldEdge.edge, ...start });
    else this.connectStart$.next(start);
  }

  /** Writes the state of the entities that leave or join the gesture, then publishes it. */
  private setGesture(next: ConnectionGesture | null) {
    const previous = this.gesture();
    const previousNodes = participants(previous);
    const nextNodes = participants(next);
    for (const node of previousNodes) if (!nextNodes.has(node)) node.connectionActive.set(false);
    for (const node of nextNodes) if (!previousNodes.has(node)) node.connectionActive.set(true);

    const previousCandidate = previous?.candidate?.handle;
    const nextCandidate = next?.candidate?.handle;
    if (previousCandidate && previousCandidate !== nextCandidate) previousCandidate.state.set('idle');
    if (next?.candidate) nextCandidate!.state.set(next.candidate.valid ? 'valid' : 'invalid');

    // The handle a connection is dragged from is `connecting`, unless it is also the candidate.
    const previousOrigin = previous?.sourceHandle;
    const nextOrigin = next?.sourceHandle;
    if (previousOrigin && previousOrigin !== nextOrigin) previousOrigin.state.set('idle');
    if (nextOrigin && nextOrigin !== nextCandidate) nextOrigin.state.set('connecting');

    if (previous?.oldEdge !== next?.oldEdge) {
      previous?.oldEdge?.reconnecting.set(false);
      next?.oldEdge?.reconnecting.set(true);
    }

    this.gesture.set(next);
  }

  /** Typed handles keep their roles whichever end the gesture started from. */
  private toConnection(gesture: ConnectionGesture, handle: HandleModel): ConnectionForValidation {
    const { source, target, sourceHandle, targetHandle } = adjustDirection({
      source: gesture.source,
      sourceHandle: gesture.sourceHandle,
      target: handle.parentNode,
      targetHandle: handle,
    } satisfies ConnectionInternal);

    return {
      source: source.rawNode.id,
      target: target.rawNode.id,
      sourceHandle: sourceHandle.id(),
      targetHandle: targetHandle.id(),
      sourceHandleType: sourceHandle.type(),
      targetHandleType: targetHandle.type(),
    };
  }

  /**
   * Rejects a duplicate before the validators run, so the application validator sees only connections the built-in
   * rules accept. A reconnected edge is no duplicate of itself.
   */
  private isValid(connection: ConnectionForValidation, reconnectedEdge?: EdgeModel) {
    const settings = this.entities.connection();
    const duplicate =
      !settings.allowDuplicateConnections &&
      this.entities.edges().some((model) => model !== reconnectedEdge && sameConnection(model.edge, connection));

    return !duplicate && settings.validator(connection);
  }
}

/** The nodes a gesture involves: the source, the candidate and both ends of a reconnected edge. */
function participants(gesture: ConnectionGesture | null): Set<NodeModel> {
  const nodes = new Set<NodeModel>();
  if (!gesture) return nodes;
  nodes.add(gesture.source);
  if (gesture.candidate) nodes.add(gesture.candidate.node);
  for (const node of [gesture.oldEdge?.source(), gesture.oldEdge?.target()]) if (node) nodes.add(node);
  return nodes;
}

function eventHandle(handle: HandleModel): ConnectionEventHandle {
  return { id: handle.id(), type: handle.type(), position: handle.position() };
}

/**
 * A touch pointer is captured by the element it pressed. A connection gesture releases it, so that, like the mouse,
 * the finger reports the handles and magnets it moves over and is released on.
 */
function releaseImplicitCapture(event: PointerEvent) {
  const target = event.target;
  if (event.pointerType === 'touch' && target instanceof Element && target.hasPointerCapture?.(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
}
