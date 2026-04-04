/**
 * Whether d3-zoom on the root SVG should handle this pointer-down event for pan/zoom
 * when the target may be inside a node that acts as a viewport pan surface.
 */
export function allowRootZoomForNodeTarget(event: Event, isSelectionKeyboardMode: boolean): boolean {
  if (event.type !== 'mousedown' && event.type !== 'touchstart') {
    return true;
  }

  if (isSelectionKeyboardMode) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return true;
  }

  const node = target.closest('.vflow-node');
  if (!node) {
    return true;
  }

  if (node.classList.contains('vflow-node--undraggable')) {
    return true;
  }

  if (node.classList.contains('vflow-node--drag-handles-only')) {
    return target.closest('.vflow-drag-handle') === null;
  }

  return false;
}
