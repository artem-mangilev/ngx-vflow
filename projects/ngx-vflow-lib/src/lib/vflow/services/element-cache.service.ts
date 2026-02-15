export abstract class ElementCacheService<TElement, TCacheEntry> {
  protected cacheMap = new Map<TElement, TCacheEntry | undefined>();

  private cacheIsDirty = true;
  private minMsBetweenDirty = 16; //1000 ms/second to get 60fps = ~16ms
  private lastDirty: Date | undefined = undefined;

  public addElementCache(element: TElement) {
    this.cacheMap.set(element, undefined);
    this.markCacheAsDirty();
  }

  public removeElementCache(element: TElement) {
    this.cacheMap.delete(element);
  }

  public getElementData(element: TElement): TCacheEntry {
    let cacheEntry = this.cacheMap.get(element);
    if (cacheEntry === undefined) {
      this.cacheMap.set(element, undefined);
      this.cacheIsDirty = true;
      //force a cache refresh
    }

    if (this.cacheIsDirty) {
      this.refreshCache();
      this.cacheIsDirty = false;
    }

    cacheEntry = this.cacheMap.get(element);
    if (cacheEntry === undefined) {
      throw new Error('Unexpected cache entry undefied. We should never get here');
    }

    return cacheEntry;
  }

  public markCacheAsDirty() {
    const now = new Date();
    if (this.lastDirty === undefined) {
      this.cacheIsDirty = true;
      this.lastDirty = now;
      return;
    }

    //force the cache ttl to at minimum 16ms before considering it dirty
    const msSinceLastDirty = now.getTime() - this.lastDirty?.getTime();
    if (msSinceLastDirty > this.minMsBetweenDirty) {
      this.cacheIsDirty = true;
      this.lastDirty = now;
    }
  }

  abstract refreshCache(): void;
}
