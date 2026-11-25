import { Rect } from '../interfaces/rect';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Native SVG handles every custom path command, including relative curves and arcs. `null` where the DOM measures
 * no path: a server render, and a DOM without layout such as jsdom.
 */
export function getSvgPathBounds(document: Document, path: string): Rect | null {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  const element = document.createElementNS(SVG_NAMESPACE, 'path');
  if (typeof element.getBBox !== 'function') return null;

  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none';
  svg.setAttribute('aria-hidden', 'true');
  element.setAttribute('d', path);
  svg.append(element);
  document.body.append(svg);
  try {
    const { x, y, width, height } = element.getBBox();
    return { x, y, width, height };
  } finally {
    svg.remove();
  }
}
