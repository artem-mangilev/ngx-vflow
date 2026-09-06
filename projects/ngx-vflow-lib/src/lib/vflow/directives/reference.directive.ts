import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: 'div[rootSvgRef]',
})
export class RootSvgReferenceDirective {
  public readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}
