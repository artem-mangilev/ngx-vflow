export function isTouchEvent(event: Event): event is TouchEvent {
  return window.TouchEvent && event instanceof TouchEvent;
}

/** Client-space position, shared by mouse and touch drag activation. */
export function eventClientPoint(event: MouseEvent | TouchEvent) {
  const pointer = isTouchEvent(event) ? (event.touches[0] ?? event.changedTouches[0]) : event;
  return { x: pointer.clientX, y: pointer.clientY };
}
