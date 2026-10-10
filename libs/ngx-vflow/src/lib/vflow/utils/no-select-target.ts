/** Whether a click target sits inside an element marked with `[vNoSelect]`. */
export function isNoSelectTarget(target: EventTarget | null): boolean {
  return !!(target as Element | null)?.closest?.('[data-v-no-select]');
}
