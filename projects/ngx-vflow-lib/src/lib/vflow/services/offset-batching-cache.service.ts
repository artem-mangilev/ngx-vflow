import { Injectable } from '@angular/core';

interface OffsetCacheEntry {
  offsetWidth: number;
  offsetHeight: number;
  offsetLeft: number;
  offsetTop: number;
}

@Injectable()
export class OffsetBatchingCacheService {
  private elementOffsetCache = new Map<HTMLElement, OffsetCacheEntry | undefined>();

  private cacheIsDirty = true;
  private minMsBetweenDirty = 16; //1000 ms/second to get 60fps = ~16ms
  private lastDirty: Date | undefined = undefined;

  public addElementCache(element: HTMLElement) {
    this.elementOffsetCache.set(element, undefined);
    this.markCacheAsDirty();
  }

  public removeElementCache(element: HTMLElement) {
    this.elementOffsetCache.delete(element);
  }

  public getElementOffsets(requestedElement: HTMLElement): OffsetCacheEntry | undefined {
    let requestedCache: OffsetCacheEntry | undefined = undefined;
    const cachedOffset = this.elementOffsetCache.get(requestedElement);
    if (cachedOffset === undefined) {
      this.addElementCache(requestedElement);
    } else {
      requestedCache = cachedOffset;
    }

    //When something request to get the offset of a given element, compute the cache of all the elements of interest until we get the next dirty request.
    if (this.cacheIsDirty) {
      for (const { [0]: element } of this.elementOffsetCache) {
        const offsetWidth = element.offsetWidth;
        const offsetHeight = element.offsetHeight;
        const offsetLeft = element.offsetLeft;
        const offsetTop = element.offsetTop;
        const cacheEntry = { offsetWidth, offsetHeight, offsetLeft, offsetTop };
        this.elementOffsetCache.set(element, cacheEntry);
        if (element === requestedElement) {
          requestedCache = cacheEntry;
        }
      }

      this.cacheIsDirty = false;
    }

    return requestedCache;
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
}
