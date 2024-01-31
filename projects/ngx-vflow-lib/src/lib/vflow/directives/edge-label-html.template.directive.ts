import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: '[edgeLabelHtml]' })
export class EdgeLabelHtmlTemplateDirective {
  public templateRef = inject(TemplateRef)
}
