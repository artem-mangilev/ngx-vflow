import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';

@Directive({
  selector: '[viewportVisibility]',
})
export class ViewportVisibilityDirective {
  public viewportVisibility = input.required<NodeModel | EdgeModel>();
  private element = inject<ElementRef<HTMLElement | SVGElement>>(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      // A template/host binding here subscribes the enclosing graph list to culling.
      this.element.style.display = this.viewportVisibility().culled() ? 'none' : '';
    });
  }
}
