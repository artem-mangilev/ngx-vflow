import { Injectable } from '@angular/core';
import { assertIsUnreachable as isUnreachable } from '../utils/is-unreachable';

type CacheMappings = {
  htmlElement: {
    element: HTMLElement;
    cacheEntry: {
      offsetWidth: number;
      offsetHeight: number;
      offsetLeft: number;
      offsetTop: number;
    };
  };
  basicElement: {
    element: Element;
    cacheEntry: {
      clientWidth: number;
      clientHeight: number;
    };
  };
  svgGraphicElement: {
    element: SVGGraphicsElement;
    cacheEntry: {
      rect: DOMRect;
    };
  };
};
type CacheMaps = {
  [K in keyof CacheMappings]: Map<CacheMappings[K]['element'], CacheMappings[K]['cacheEntry'] | undefined>;
};

type CacheType = keyof CacheMappings;

type CacheRequest<TType extends CacheType> = { element: CacheMappings[TType]['element']; type: TType };
type CacheResult<TType extends CacheType> = CacheMappings[TType]['cacheEntry'];

@Injectable()
export class ElementCacheService {
  private cacheMaps: CacheMaps = {
    basicElement: new Map(),
    htmlElement: new Map(),
    svgGraphicElement: new Map(),
  };

  private cacheIsDirty = true;
  private minMsBetweenDirty = 16; //1000 ms/second to get 60fps = ~16ms
  private lastDirty: Date | undefined = undefined;

  public addElementCache<T extends CacheType>(request: CacheRequest<T>) {
    this.cacheMaps[request.type].set(request.element, undefined);
    this.markCacheAsDirty();
  }

  public removeElementCache<T extends CacheType>(request: CacheRequest<T>) {
    this.cacheMaps[request.type].delete(request.element);
  }

  public getElementData<T extends CacheType>(request: CacheRequest<T>): CacheResult<T> | undefined {
    const cacheEntry = this.cacheMaps[request.type].get(request.element);
    if (cacheEntry === undefined) {
      this.cacheMaps[request.type].set(request.element, undefined);
      this.cacheIsDirty = true;
      //force a cache refresh
    }
    if (this.cacheIsDirty) {
      this.refreshCaches();
      this.cacheIsDirty = false;
    }

    return this.cacheMaps[request.type].get(request.element);
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

  private refreshCaches() {
    //Using a switch statement with Object.keys to make sure ts validated that all newly created cacheType will be implemented
    const cacheKeys = Object.keys(this.cacheMaps) as CacheType[];
    cacheKeys.forEach((key) => {
      switch (key) {
        case 'basicElement':
          return this.refreshBasicElementCache();
        case 'htmlElement':
          return this.refreshHtmlElementCache();
        case 'svgGraphicElement':
          return this.refreshSvgGraphicElementCache();
        default:
          return isUnreachable(key);
      }
    });
  }

  private refreshHtmlElementCache() {
    for (const { [0]: element } of this.cacheMaps.htmlElement) {
      const offsetWidth = element.offsetWidth;
      const offsetHeight = element.offsetHeight;
      const offsetLeft = element.offsetLeft;
      const offsetTop = element.offsetTop;
      const cacheEntry = { offsetWidth, offsetHeight, offsetLeft, offsetTop };
      this.cacheMaps.htmlElement.set(element, cacheEntry);
    }
  }

  private refreshBasicElementCache() {
    for (const { [0]: element } of this.cacheMaps.basicElement) {
      const clientWidth = element.clientWidth;
      const clientHeight = element.clientHeight;
      const cacheEntry = { clientWidth, clientHeight };
      this.cacheMaps.basicElement.set(element, cacheEntry);
    }
  }

  private refreshSvgGraphicElementCache() {
    for (const { [0]: element } of this.cacheMaps.svgGraphicElement) {
      const DOMRect = element.getBBox();
      this.cacheMaps.svgGraphicElement.set(element, { rect: DOMRect });
    }
  }
}
