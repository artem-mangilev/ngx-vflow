import { Injectable } from '@angular/core';
import { ElementCacheService } from './element-cache.service';

@Injectable()
export class BasicElementCacheService extends ElementCacheService<
  Element,
  {
    clientWidth: number;
    clientHeight: number;
  }
> {
  override refreshCache(): void {
    for (const { [0]: element } of this.cacheMap) {
      const clientWidth = element.clientWidth;
      const clientHeight = element.clientHeight;
      const cacheEntry = { clientWidth, clientHeight };
      this.cacheMap.set(element, cacheEntry);
    }
  }
}
