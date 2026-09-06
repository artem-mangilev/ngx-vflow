import { Rect } from '../interfaces/rect';

/** Native SVG handles every custom path command, including relative curves and arcs. */
export function getSvgPathBounds(document: Document, path: string): Rect {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const element = document.createElementNS(svg.namespaceURI, 'path') as SVGPathElement;
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
