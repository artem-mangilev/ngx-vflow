import { Injectable, Signal, WritableSignal, signal } from '@angular/core';

export interface ViewportState {
  x: number
  y: number
  zoom: number
}

@Injectable()
export class ZoomService {
  /**
   * Internal signal that accepts value from user by lib api
   * When this signal changes, lib sets new view state and update readableViewport signal
   */
  public readonly writableViewport: WritableSignal<ViewportState> = signal({ zoom: 1, x: 0, y: 0 })

  /**
   * Public signal with viewport state. User can directly read from this signal. It's updated by:
   * - user events on flow
   * - writableViewport signal
   */
  public readonly readableViewport: WritableSignal<ViewportState> = signal({ zoom: 1, x: 0, y: 0 })
}
