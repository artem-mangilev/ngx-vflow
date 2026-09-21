import { FeatureEntry, FeaturePrecedence } from '../features/feature-entry.interface';

const RANK: Record<FeaturePrecedence, number> = { highest: 0, high: 1, default: 2, low: 3, lowest: 4 };

/**
 * Orders entries once: precedence category first, then the position they were registered in. Two entries with one
 * id are a configuration error.
 */
export function resolveFeatureEntries<T extends FeatureEntry>(entries: readonly T[]): T[] {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    const ids = new Set<string>();
    for (const entry of entries) {
      if (ids.has(entry.id)) {
        throw new Error(`[ngx-vflow] Feature entry "${entry.id}" is registered twice.`);
      }
      ids.add(entry.id);
    }
  }

  return entries
    .map((entry, index) => ({ entry, index, rank: RANK[entry.precedence ?? 'default'] }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ entry }) => entry);
}
