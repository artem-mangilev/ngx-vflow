import { Signal, computed, inject, signal } from '@angular/core';
import { NodeHandle } from '../services/handle.service';
import { NodeModel } from './node.model';
import { Point } from '../interfaces/point.interface';
import { ViewportService } from '../services/viewport.service';
import { Position } from '../types/position.type';

export type HandleState = 'valid' | 'invalid' | 'idle';

export type HandleLayoutStyles = {
  top: string;
  left: string;
  right: string;
  bottom: string;
};

export type HandleGeometry = {
  layoutStyles: HandleLayoutStyles;
  localPoint: Point;
};

type HandleGeometryInput = {
  position: Position;
  nodeSize: { width: number; height: number };
  handleSize: { width: number; height: number };
  offset: Point;
  anchorPoint?: Point;
};

const DEFAULT_HANDLE_SIZE = 14;

export class HandleModel {
  private viewportService = inject(ViewportService);

  public state = signal<HandleState>('idle');
  public canStart: Signal<boolean> = this.rawHandle.canStart ?? signal(true);
  public canAccept: Signal<boolean> = this.rawHandle.canAccept ?? signal(true);

  /** Anchor element the `<handle>` was placed into. */
  public hostReference = this.rawHandle.hostReference!;

  /** Absolute position of the handle relative to the node, same as xyflow handles. */
  public layoutStyles = signal<HandleLayoutStyles>({
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
  });

  /** The rendered handle DOM element. Set by `HandleComponent` after view initialization. */
  public handleElement: HTMLElement | null = null;

  public template = this.rawHandle.template;

  /** Built-in default-node handles have fixed geometry and need no DOM measurement. */
  public readonly isStandard = this.parentNode.rawNode.type === 'default';

  /** Connection point relative to the node origin, in flow units. */
  private localPoint = signal<Point>({ x: 0, y: 0 });

  public pointAbsolute = computed<Point>(() => ({
    x: this.parentNode.globalPoint().x + this.localPoint().x,
    y: this.parentNode.globalPoint().y + this.localPoint().y,
  }));

  public templateContext = {
    $implicit: {
      state: this.state,
      node: this.parentNode.rawNode,
      canStart: this.canStart,
      canAccept: this.canAccept,
    },
  };

  constructor(
    public rawHandle: NodeHandle,
    public parentNode: NodeModel,
  ) {}

  /**
   * Read phase. Standard handles are derived from model dimensions; custom
   * handles read their anchor and rendered size without changing styles.
   */
  public measure(nodeRect?: DOMRect): HandleGeometry | null {
    if (this.isStandard) {
      return computeHandleGeometry({
        position: this.rawHandle.position,
        nodeSize: { width: this.parentNode.width(), height: this.parentNode.height() },
        handleSize: { width: DEFAULT_HANDLE_SIZE, height: DEFAULT_HANDLE_SIZE },
        offset: { x: this.rawHandle.userOffsetX, y: this.rawHandle.userOffsetY },
      });
    }

    const handleElement = this.handleElement;
    const resolvedNodeRect = nodeRect ?? this.parentNode.nodeElement()?.getBoundingClientRect();

    if (!handleElement || !resolvedNodeRect) {
      return null;
    }

    const zoom = this.viewportService.readableViewport().zoom || 1;
    const anchorRect = this.hostReference.getBoundingClientRect();
    const handleRect = handleElement.getBoundingClientRect();
    const alongY = (anchorRect.top + anchorRect.height / 2 - resolvedNodeRect.top) / zoom;
    const alongX = (anchorRect.left + anchorRect.width / 2 - resolvedNodeRect.left) / zoom;

    return computeHandleGeometry({
      position: this.rawHandle.position,
      nodeSize: { width: this.parentNode.width(), height: this.parentNode.height() },
      handleSize: { width: handleRect.width / zoom, height: handleRect.height / zoom },
      offset: { x: this.rawHandle.userOffsetX, y: this.rawHandle.userOffsetY },
      anchorPoint: { x: alongX, y: alongY },
    });
  }

  /** Write phase. Called only after every handle in the node has been measured. */
  public applyGeometry(geometry: HandleGeometry | null): void {
    if (!geometry) {
      return;
    }

    this.layoutStyles.set(geometry.layoutStyles);
    this.localPoint.set(geometry.localPoint);
  }

  /** Synchronous convenience for isolated model use. Node rendering uses the coalesced controller pass. */
  public sync(): void {
    this.applyGeometry(this.measure());
  }
}

function computeHandleGeometry({
  position,
  nodeSize,
  handleSize,
  offset,
  anchorPoint = { x: nodeSize.width / 2, y: nodeSize.height / 2 },
}: HandleGeometryInput): HandleGeometry {
  const alongX = anchorPoint.x - offset.x;
  const alongY = anchorPoint.y - offset.y;

  switch (position) {
    case 'left':
      return {
        layoutStyles: { top: `${anchorPoint.y}px`, left: '0', right: 'auto', bottom: 'auto' },
        localPoint: { x: -handleSize.width / 2 - offset.x, y: alongY },
      };
    case 'right':
      return {
        layoutStyles: { top: `${anchorPoint.y}px`, left: 'auto', right: '0', bottom: 'auto' },
        localPoint: { x: nodeSize.width + handleSize.width / 2 - offset.x, y: alongY },
      };
    case 'top':
      return {
        layoutStyles: { top: '0', left: `${anchorPoint.x}px`, right: 'auto', bottom: 'auto' },
        localPoint: { x: alongX, y: -handleSize.height / 2 - offset.y },
      };
    case 'bottom':
      return {
        layoutStyles: { top: 'auto', left: `${anchorPoint.x}px`, right: 'auto', bottom: '0' },
        localPoint: { x: alongX, y: nodeSize.height + handleSize.height / 2 - offset.y },
      };
  }
}
