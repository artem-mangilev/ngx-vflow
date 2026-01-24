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

  private cacheIsDirtly = true;

  public addElementCache(element: HTMLElement) {
    this.elementOffsetCache.set(element, undefined);
    this.cacheIsDirtly = true;
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
    if (this.cacheIsDirtly) {
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

      this.cacheIsDirtly = false;
    }

    return requestedCache;
  }

  public cacheIsDirty() {
    this.cacheIsDirtly = true;
  }
}
