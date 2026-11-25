import { Rect } from '../interfaces/rect';

/** Flow units per grid cell; nodes are typically 50–300 units wide, so a viewport spans a handful of cells. */
const CELL_SIZE = 512;
/** An item covering more cells than this is kept in a flat list instead, so huge groups do not fill the grid. */
const MAX_CELLS_PER_ITEM = 64;
/** A query covering more cells than this scans the items instead of the cells. */
const MAX_CELLS_PER_QUERY = 4096;
/** Cell coordinates are packed into one number; this many cells per axis fit before the packing wraps. */
const CELL_AXIS = 2 ** 20;
const CELL_OFFSET = CELL_AXIS / 2;

interface Entry {
  rect: Rect;
  /** Packed cell keys of the item, or `null` when it is in the large list. */
  keys: number[] | null;
}

/**
 * A uniform grid over flow space. Insertions and removals cost the number of cells an item covers; a query costs
 * the cells the queried rect covers plus their items, independent of how many items the index holds. Rects touch
 * when their closed intervals overlap; a rect with a non-finite edge touches nothing.
 */
export class SpatialIndex<T> {
  private readonly cells = new Map<number, Set<T>>();
  private readonly large = new Set<T>();
  private readonly entries = new Map<T, Entry>();

  public get size(): number {
    return this.entries.size;
  }

  public rectOf(item: T): Rect | undefined {
    return this.entries.get(item)?.rect;
  }

  /** Places the item at the rect, replacing its previous placement. Returns whether the placement changed. */
  public set(item: T, rect: Rect): boolean {
    const previous = this.entries.get(item);
    if (previous && sameRect(previous.rect, rect)) return false;
    if (previous) this.remove(item, previous);
    const keys = cellKeys(rect);
    if (keys) {
      for (const key of keys) {
        let cell = this.cells.get(key);
        if (!cell) this.cells.set(key, (cell = new Set()));
        cell.add(item);
      }
    } else {
      this.large.add(item);
    }
    this.entries.set(item, { rect, keys });
    return true;
  }

  public delete(item: T): boolean {
    const entry = this.entries.get(item);
    if (!entry) return false;
    this.remove(item, entry);
    this.entries.delete(item);
    return true;
  }

  /** Items whose rects intersect the given rect, in no particular order. */
  public query(rect: Rect): T[] {
    const result: T[] = [];
    const x0 = Math.floor(rect.x / CELL_SIZE);
    const x1 = Math.floor((rect.x + rect.width) / CELL_SIZE);
    const y0 = Math.floor(rect.y / CELL_SIZE);
    const y1 = Math.floor((rect.y + rect.height) / CELL_SIZE);
    const count = (x1 - x0 + 1) * (y1 - y0 + 1);
    if (!(count >= 1) || count > MAX_CELLS_PER_QUERY) {
      // A non-finite or enormous rect: walking its cells would cost more than the items, or never end.
      for (const [item, entry] of this.entries) if (touches(entry.rect, rect)) result.push(item);
      return result;
    }
    const seen = new Set<T>();
    const visit = (item: T) => {
      if (seen.has(item)) return;
      seen.add(item);
      if (touches(this.entries.get(item)!.rect, rect)) result.push(item);
    };
    for (let cx = x0; cx <= x1; cx++) {
      for (let cy = y0; cy <= y1; cy++) {
        const cell = this.cells.get(packKey(cx, cy));
        if (cell) for (const item of cell) visit(item);
      }
    }
    for (const item of this.large) visit(item);
    return result;
  }

  private remove(item: T, entry: Entry) {
    if (entry.keys) {
      for (const key of entry.keys) {
        const cell = this.cells.get(key);
        if (!cell) continue;
        cell.delete(item);
        if (cell.size === 0) this.cells.delete(key);
      }
    } else {
      this.large.delete(item);
    }
  }
}

/** Unlike a negated "apart" test, every comparison must hold, so a NaN edge never touches. */
function touches(a: Rect, b: Rect): boolean {
  return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;
}

function sameRect(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function packKey(cx: number, cy: number): number {
  return (cx + CELL_OFFSET) * CELL_AXIS + (cy + CELL_OFFSET);
}

function cellKeys(rect: Rect): number[] | null {
  const x0 = Math.floor(rect.x / CELL_SIZE);
  const x1 = Math.floor((rect.x + rect.width) / CELL_SIZE);
  const y0 = Math.floor(rect.y / CELL_SIZE);
  const y1 = Math.floor((rect.y + rect.height) / CELL_SIZE);
  const count = (x1 - x0 + 1) * (y1 - y0 + 1);
  // A rect with a non-finite coordinate covers no cell and stays in the large list, where it never matches.
  if (!(count >= 1) || count > MAX_CELLS_PER_ITEM) return null;
  const keys: number[] = [];
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) keys.push(packKey(cx, cy));
  return keys;
}
