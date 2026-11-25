/** Whether a click target sits inside an element marked with `[vNoSelect]`. */
export function isNoSelectTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-v-no-select]') !== null;
}
