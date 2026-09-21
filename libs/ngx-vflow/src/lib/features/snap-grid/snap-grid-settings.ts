import { signal, WritableSignal } from '@angular/core';

/** The grid of the `withSnapGrid()` feature. Inject it to read or change the grid while the flow runs. */
export class SnapGridSettings {
  public readonly grid: WritableSignal<[number, number]>;

  constructor(grid: [number, number] | number) {
    this.grid = signal(normalizeGrid(grid));
  }
}

export function normalizeGrid(grid: [number, number] | number): [number, number] {
  return typeof grid === 'number' ? [grid, grid] : [grid[0], grid[1]];
}
