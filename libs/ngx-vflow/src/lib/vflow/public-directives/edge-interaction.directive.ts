import { DestroyRef, Directive, ElementRef, Injector, Renderer2, inject } from '@angular/core';
import { EdgeComponent } from '../components/edge/edge.component';
import { attachEdgeInteractionArea } from '../utils/edge-interaction-area';

/**
 * Moves the transparent interaction stroke of the edge into the presentation: it becomes the first child of this
 * group of an `ng-template[vEdge]` presentation, so clicks, hover and other pointer events on the stroke reach the
 * group and CSS `:hover` applies to it. Without it the flow draws the stroke in the edge host, where a click still
 * selects the edge but the presentation cannot style its hover. An edge component opts in with
 * `hostDirectives: [VflowEdgeInteractionDirective]`, which puts the stroke into its host; the selector does not apply there.
 */
@Directive({
  selector: 'g[vEdgeInteraction]',
  standalone: true,
})
export class VflowEdgeInteractionDirective {
  constructor() {
    const model = inject(EdgeComponent).model();
    const detach = attachEdgeInteractionArea(
      inject<ElementRef<Element>>(ElementRef).nativeElement,
      model,
      inject(Renderer2),
      inject(Injector),
    );
    model.interactionAreasCount.update((count) => count + 1);
    inject(DestroyRef).onDestroy(() => {
      model.interactionAreasCount.update((count) => count - 1);
      detach();
    });
  }
}
