import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: 'svg[rootSvgRef]',
})
export class RootSvgReferenceDirective {
  public readonly element = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;
}
