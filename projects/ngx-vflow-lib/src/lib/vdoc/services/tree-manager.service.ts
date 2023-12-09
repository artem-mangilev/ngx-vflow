import { Injectable } from '@angular/core';
import { VDocBlockComponent } from '../components/vdoc-block/vdoc-block.component';

@Injectable()
export class TreeManagerService {
  private entries: Map<Element, VDocBlockComponent> = new Map();

  register(svgElement: Element, component: VDocBlockComponent) {
    this.entries.set(svgElement, component);
  }

  get(svgElement: Element) {
    return this.entries.get(svgElement);
  }

  has(svgElement: Element | null): svgElement is Element {
    if (svgElement) {
      return this.entries.has(svgElement);
    }

    return false;
  }
}
