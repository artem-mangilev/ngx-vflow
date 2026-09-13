import { DestroyRef, Directive, ElementRef, Injector, Renderer2, inject } from '@angular/core';
import { EdgeComponent } from '../components/edge/edge.component';
import { attachEdgeInteractionArea } from '../utils/edge-interaction-area';

/**
 * Draws the transparent interaction stroke of the edge as the first child of this group of an `ng-template[edge]`
 * presentation. Clicks, hover and other pointer events on the stroke reach the group, CSS `:hover` applies to it and a
 * click selects the edge. Without it the edge has no hit area. An edge component opts in with
 * `hostDirectives: [EdgeInteractionDirective]`, which puts the stroke into its host; the selector does not apply there.
 */
@Directive({
  selector: 'g[edgeInteraction]',
  standalone: true,
})
export class EdgeInteractionDirective {
  constructor() {
    const detach = attachEdgeInteractionArea(
      inject<ElementRef<Element>>(ElementRef).nativeElement,
      inject(EdgeComponent).model(),
      inject(Renderer2),
      inject(Injector),
    );
    inject(DestroyRef).onDestroy(detach);
  }
}
