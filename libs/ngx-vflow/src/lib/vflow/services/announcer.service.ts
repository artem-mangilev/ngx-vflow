import { DestroyRef, Injectable, inject } from '@angular/core';

/** Writes keyboard action feedback to the live region owned by the current flow. */
@Injectable()
export class AnnouncerService {
  private element: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  public register(element: HTMLElement) {
    this.element = element;
  }

  public announce(message: string) {
    const element = this.element;
    if (!element) return;
    this.clearTimer();
    // Screen readers ignore a mutation that repeats the current text, so an identical message is re-announced
    // only after the region has been emptied in a separate task.
    element.textContent = '';
    this.timer = setTimeout(() => {
      element.textContent = message;
      this.timer = null;
    }, 100);
  }

  private clearTimer() {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
}
