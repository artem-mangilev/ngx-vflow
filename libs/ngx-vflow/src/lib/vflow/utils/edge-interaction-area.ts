import { Injector, Renderer2, RendererStyleFlags2, effect } from '@angular/core';
import type { EdgeModel } from '../models/edge.model';

// Inline, because the encapsulated styles of the edge component do not reach elements inside a presentation.
const HIT_AREA_STYLES: Record<string, string> = {
  fill: 'none',
  stroke: 'transparent',
  'pointer-events': 'stroke',
  cursor: 'pointer',
};

/**
 * Inserts the transparent interaction stroke of an edge as the first child of `host`. Pointer events on the stroke
 * then bubble through `host`, and `:hover` applies to it, while presentation elements after the stroke stay on top.
 *
 * Returns a function that removes the stroke.
 */
export function attachEdgeInteractionArea(
  host: Element,
  model: EdgeModel,
  renderer: Renderer2,
  injector: Injector,
): () => void {
  const path = renderer.createElement('path', 'svg') as SVGPathElement;
  renderer.setAttribute(path, 'aria-hidden', 'true');
  renderer.addClass(path, 'interactive-edge');
  for (const [name, value] of Object.entries(HIT_AREA_STYLES)) {
    renderer.setStyle(path, name, value, RendererStyleFlags2.DashCase);
  }
  renderer.insertBefore(host, path, host.firstChild);

  const ref = effect(
    () => {
      const width = model.interactionWidth();
      renderer.setAttribute(path, 'd', model.path().path);
      renderer.setStyle(path, 'stroke-width', `${width}px`, RendererStyleFlags2.DashCase);
      if (width > 0) {
        renderer.removeStyle(path, 'display', RendererStyleFlags2.DashCase);
      } else {
        renderer.setStyle(path, 'display', 'none', RendererStyleFlags2.DashCase);
      }
    },
    { injector },
  );

  return () => {
    ref.destroy();
    renderer.removeChild(host, path);
  };
}
