import { computed, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';

const defaultPoint: Point = { x: 0, y: 0 };

export class SelectionBoxModel {
  public readonly active = signal(false);

  public readonly startPoint = signal<Point>(defaultPoint);

  public readonly endPoint = signal<Point>(defaultPoint);

  public readonly x = computed(() => Math.min(this.startPoint().x, this.endPoint().x));

  public readonly y = computed(() => Math.min(this.startPoint().y, this.endPoint().y));

  public readonly width = computed(() => Math.abs(this.endPoint().x - this.startPoint().x));

  public readonly height = computed(() => Math.abs(this.endPoint().y - this.startPoint().y));

  public setStart(point: Point): void {
    this.startPoint.set(point);
    this.endPoint.set(point);
    this.active.set(true);
  }

  public setEnd(point: Point): void {
    this.endPoint.set(point);
  }

  public reset(): void {
    this.active.set(false);
    this.startPoint.set(defaultPoint);
    this.endPoint.set(defaultPoint);
  }
}
