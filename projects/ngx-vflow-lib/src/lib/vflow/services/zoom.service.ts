import { Injectable, signal } from '@angular/core';

@Injectable()
export class ZoomService {
  public readonly zoom = signal(1)
}
