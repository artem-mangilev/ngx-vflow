import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: 'svg[rootSvgRef]'
})
export class RootSvgReferenceDirective {
  public readonly element = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement
}
