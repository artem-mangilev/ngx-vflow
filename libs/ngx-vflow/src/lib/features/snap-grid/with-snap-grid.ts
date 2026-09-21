import { vflowFeature, VflowFeature } from '../../vflow/features/feature';
import { provideGeometryTransform } from '../../vflow/features/provide-geometry-transform';
import { SnapGridSettings } from './snap-grid-settings';
import { SnapGridTransform } from './snap-grid.transform';

/**
 * Snaps node positions to a grid during pointer drags and keyboard moves. A value of `1` on an axis leaves that axis
 * free. Change the grid later through {@link SnapGridSettings}.
 *
 * ```ts
 * providers: provideVflow(withSnapGrid([20, 20]))
 * ```
 */
export function withSnapGrid(grid: [number, number] | number): VflowFeature<'snap-grid'> {
  return vflowFeature('snap-grid', [
    { provide: SnapGridSettings, useFactory: () => new SnapGridSettings(grid) },
    ...provideGeometryTransform(SnapGridTransform),
  ]);
}
