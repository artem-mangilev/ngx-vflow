import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';
import { ViewportState } from '../interfaces/viewport.interface';

@Injectable()
export class FlowCoordinateMapperService {
  private readonly hostElement: WritableSignal<HTMLElement | null> = signal(null);
  private viewportStateAccessor: () => ViewportState = () => ({ x: 0, y: 0, zoom: 1 });

  public readonly viewportTransformCss = computed(() => {
    const viewport = this.viewportState();

    return `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
  });

  public registerHostElement(element: HTMLElement): void {
    this.hostElement.set(element);
  }

  public setViewportStateAccessor(accessor: () => ViewportState): void {
    this.viewportStateAccessor = accessor;
  }

  public documentPointToFlowPoint(documentPoint: Point): Point {
    const hostRect = this.hostElement()?.getBoundingClientRect();
    const viewport = this.viewportStateAccessor();

    if (!hostRect) {
      return { x: 0, y: 0 };
    }

    return {
      x: (documentPoint.x - hostRect.left - viewport.x) / viewport.zoom,
      y: (documentPoint.y - hostRect.top - viewport.y) / viewport.zoom,
    };
  }

  public flowPointToDocumentPoint(flowPoint: Point): Point {
    const hostRect = this.hostElement()?.getBoundingClientRect();
    const viewport = this.viewportStateAccessor();

    if (!hostRect) {
      return { x: 0, y: 0 };
    }

    return {
      x: hostRect.left + viewport.x + flowPoint.x * viewport.zoom,
      y: hostRect.top + viewport.y + flowPoint.y * viewport.zoom,
    };
  }

  protected viewportState() {
    return this.viewportStateAccessor();
  }
}
