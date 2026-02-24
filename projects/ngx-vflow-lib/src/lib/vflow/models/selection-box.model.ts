import { computed, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';

const defaultPoint: Point = { x: 0, y: 0 };

export class SelectionBoxModel {
  public active = signal(false);

  public startPoint = signal<Point>(defaultPoint);

  public endPoint = signal<Point>(defaultPoint);

  public x = computed(() => Math.min(this.startPoint().x, this.endPoint().x));

  public y = computed(() => Math.min(this.startPoint().y, this.endPoint().y));

  public width = computed(() => Math.abs(this.endPoint().x - this.startPoint().x));

  public height = computed(() => Math.abs(this.endPoint().y - this.startPoint().y));

  public setStart(point: Point) {
    this.startPoint.set(point);
    this.endPoint.set(point);
    this.active.set(true);
  }

  public setEnd(point: Point) {
    this.endPoint.set(point);
  }

  public reset() {
    this.active.set(false);
    this.startPoint.set(defaultPoint);
    this.endPoint.set(defaultPoint);
  }
}
