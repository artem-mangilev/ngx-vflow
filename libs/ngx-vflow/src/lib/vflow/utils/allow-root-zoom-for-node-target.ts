import { isPanPress, pressTarget } from './press-target';

/**
 * Whether a press may start a viewport gesture of the pane when the target may be inside a node that acts as a
 * viewport pan surface. Events other than `pointerdown` are always allowed. See {@link pressTarget}.
 */
export function allowRootZoomForNodeTarget(event: Event, isSelectionKeyboardMode: boolean): boolean {
  if (event.type !== 'pointerdown') {
    return true;
  }

  if (isSelectionKeyboardMode) {
    return false;
  }

  return isPanPress(pressTarget(event.target));
}
