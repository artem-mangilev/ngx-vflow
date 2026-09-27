import { Injectable, inject, signal } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { Point } from '../interfaces/point.interface';
import { HandleModel } from '../models/handle.model';
import {
  AlignmentGuides,
  AlignmentHandlePair,
  AlignmentScene,
  NO_GUIDES,
  alignmentGuides,
  alignmentOffset,
  findAlignmentGaps,
} from '../utils/alignment';
import { getBoundsOfRects } from '../utils/rect';
import { getNodesFlowBounds, nodeToRect } from '../utils/nodes';
import { FlowSettingsService } from './flow-settings.service';
import { ViewportService } from './viewport.service';
import { NodeRenderingService } from './node-rendering.service';
import { FlowEntitiesService } from './flow-entities.service';
import { KeyboardService } from './keyboard.service';

const DEFAULT_TOLERANCE = 10;

/** Snaps dragged nodes to the alignment helper's guides and publishes the guides that hold. */
@Injectable()
export class AlignmentService {
  private settingsService = inject(FlowSettingsService);
  private viewportService = inject(ViewportService);
  private nodeRenderingService = inject(NodeRenderingService);
  private entitiesService = inject(FlowEntitiesService);
  private keyboardService = inject(KeyboardService);

  public readonly guides = signal<AlignmentGuides>(NO_GUIDES);

  private scene: AlignmentScene | null = null;
  private nodes: NodeModel[] = [];
  /** Flow position of each dragged node's parent, which stays put during the drag. */
  private parentOrigins: Point[] = [];

  /** Collects what the dragged nodes may align with. Does nothing while the helper is off. */
  public begin(nodes: NodeModel[]) {
    this.end();
    if (!this.settingsService.alignmentHelper()) return;

    const moving = new Set<NodeModel>();
    const collect = (node: NodeModel) => {
      moving.add(node);
      node.children().forEach(collect);
    };
    nodes.forEach(collect);

    const ancestors = new Set<NodeModel>();
    for (const node of nodes) {
      for (let parent = node.parent(); parent; parent = parent.parent()) ancestors.add(parent);
    }

    const targets = this.nodeRenderingService
      .viewportNodes()
      .filter((node) => !moving.has(node))
      .map((node) => ({ rect: nodeToRect(node), centerOnly: ancestors.has(node) }));
    const origin = getNodesFlowBounds(nodes);

    this.nodes = nodes;
    this.parentOrigins = nodes.map((node) => ({
      x: node.globalPoint().x - node.point().x,
      y: node.globalPoint().y - node.point().y,
    }));
    this.scene = {
      targets,
      gaps: findAlignmentGaps(targets.filter((target) => !target.centerOnly).map((target) => target.rect)),
      handles: this.handlePairs(moving, origin),
    };
  }

  /** Shifts the proposed node-space points of the dragged nodes onto the nearest alignment. Returns the snapped axes. */
  public snap(points: Point[]): { x: boolean; y: boolean } {
    const settings = this.settingsService.alignmentHelper();
    if (!this.scene || !settings || this.bypassed()) return { x: false, y: false };
    const tolerance = settings === true ? DEFAULT_TOLERANCE : settings.tolerance;

    const bounds = getBoundsOfRects(
      points.map((point, index) => ({
        x: point.x + this.parentOrigins[index].x,
        y: point.y + this.parentOrigins[index].y,
        width: this.nodes[index].width(),
        height: this.nodes[index].height(),
      })),
    );
    const offset = alignmentOffset(this.scene, bounds, tolerance / this.viewportService.readableViewport().zoom);

    for (const point of points) {
      point.x += offset.x ?? 0;
      point.y += offset.y ?? 0;
    }

    return { x: offset.x !== null, y: offset.y !== null };
  }

  /** Publishes the guides for where the dragged nodes are now. */
  public update() {
    this.guides.set(
      this.scene && !this.bypassed() ? alignmentGuides(this.scene, getNodesFlowBounds(this.nodes)) : NO_GUIDES,
    );
  }

  public end() {
    this.scene = null;
    this.nodes = [];
    this.parentOrigins = [];
    this.guides.set(NO_GUIDES);
  }

  private bypassed() {
    return this.keyboardService.isActiveModifier('alignmentBypass');
  }

  /**
   * Edges from a moving node to a fixed one whose handles face each other along one axis: the edge is straight when
   * the handles share the other coordinate. Dynamic handles meet the node at its center, which the anchors cover.
   */
  private handlePairs(moving: Set<NodeModel>, origin: Point): AlignmentHandlePair[] {
    const pairs: AlignmentHandlePair[] = [];

    for (const edge of this.entitiesService.edges()) {
      const source = edge.source();
      const target = edge.target();
      if (!source || !target || moving.has(source) === moving.has(target)) continue;

      const [movingHandle, fixedHandle] = moving.has(source)
        ? [edge.sourceHandle(), edge.targetHandle()]
        : [edge.targetHandle(), edge.sourceHandle()];
      if (!movingHandle || !fixedHandle) continue;

      const axis = straightAxis(movingHandle, fixedHandle);
      if (!axis) continue;

      const point = movingHandle.pointAbsolute();
      pairs.push({
        axis,
        offset: { x: point.x - origin.x, y: point.y - origin.y },
        fixed: fixedHandle.pointAbsolute(),
      });
    }

    return pairs;
  }
}

/** The axis the two handles must share a coordinate on for a straight edge, or `null` if they cannot. */
function straightAxis(a: HandleModel, b: HandleModel): 'x' | 'y' | null {
  if (!a.isMeasured() || !b.isMeasured()) return null;

  const horizontal = (handle: HandleModel) => handle.position() === 'left' || handle.position() === 'right';
  const vertical = (handle: HandleModel) => handle.position() === 'top' || handle.position() === 'bottom';

  if (horizontal(a) && horizontal(b)) return 'y';
  if (vertical(a) && vertical(b)) return 'x';
  return null;
}
