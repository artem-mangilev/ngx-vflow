import { Injectable, signal } from '@angular/core';

@Injectable()
export class ZoomService {
  /**
   * Private signals for internal usage
   */
  public readonly zoom = signal(1)
  public readonly pan = signal({ x: 0, y: 0 })

  /**
   * Public signal with zoom & pan state
   */
  public readonly zoomPan = signal({ zoom: 1, x: 0, y: 0 })
}
