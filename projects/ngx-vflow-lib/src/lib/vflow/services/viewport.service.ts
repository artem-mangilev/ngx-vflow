import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';

export interface ViewportState extends Point {
  zoom: number
}

@Injectable()
export class ViewportService {
  /**
   * The default value used by d3, just copy it here
   *
   * @returns default viewport value
   */
  private static getDefaultViewport(): ViewportState { return { zoom: 1, x: 0, y: 0 } }

  /**
   * Internal signal that accepts value from user by lib api
   * When this signal changes, lib sets new view state and update readableViewport signal
   */
  public readonly writableViewport: WritableSignal<Partial<ViewportState>> = signal(ViewportService.getDefaultViewport())

  /**
   * Public signal with viewport state. User can directly read from this signal. It's updated by:
   * - user events on flow
   * - writableViewport signal
   */
  public readonly readableViewport: WritableSignal<ViewportState> = signal(ViewportService.getDefaultViewport())

  // TODO: add writableViewportWithConstraints (to apply min zoom/max zoom values)
}
