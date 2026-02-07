import { Injectable } from '@angular/core';
import { ElementCacheService } from './element-cache.service';

@Injectable()
export class SvgGraphicElementCacheService extends ElementCacheService<SVGGraphicsElement, DOMRect> {
  override refreshCache(): void {
    for (const { [0]: element } of this.cacheMap) {
      const DOMRect = element.getBBox();
      this.cacheMap.set(element, DOMRect);
    }
  }
}
