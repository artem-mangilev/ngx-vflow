import { Directive, ElementRef, inject } from '@angular/core';
import { AnnouncerService } from '../services/announcer.service';

/** Marks the polite live region that receives keyboard action feedback of the enclosing flow. */
@Directive({
  selector: '[vflowLiveRegion]',
  host: { 'aria-live': 'polite', 'aria-atomic': 'true' },
})
export class LiveRegionDirective {
  constructor() {
    inject(AnnouncerService).register(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
  }
}
