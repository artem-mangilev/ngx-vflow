import { Injectable } from '@angular/core';
import { ElementCacheService } from './element-cache.service';

@Injectable()
export class HtmlElementCacheService extends ElementCacheService<
  HTMLElement,
  {
    offsetWidth: number;
    offsetHeight: number;
    offsetLeft: number;
    offsetTop: number;
  }
> {
  override refreshCache(): void {
    for (const { [0]: element } of this.cacheMap) {
      const offsetWidth = element.offsetWidth;
      const offsetHeight = element.offsetHeight;
      const offsetLeft = element.offsetLeft;
      const offsetTop = element.offsetTop;
      const cacheEntry = { offsetWidth, offsetHeight, offsetLeft, offsetTop };
      this.cacheMap.set(element, cacheEntry);
    }
  }
}
