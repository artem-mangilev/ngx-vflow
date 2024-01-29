import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: '[nodeHtml]' })
export class NodeHtmlTemplateDirective {
  public templateRef = inject(TemplateRef)
}
