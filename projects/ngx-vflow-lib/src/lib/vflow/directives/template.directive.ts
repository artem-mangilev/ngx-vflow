import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({ selector: 'ng-template[edge]' })
export class EdgeTemplateDirective {
  public templateRef = inject(TemplateRef)
}

@Directive({ selector: 'ng-template[edgeLabelHtml]' })
export class EdgeLabelHtmlTemplateDirective {
  public templateRef = inject(TemplateRef)
}

@Directive({ selector: 'ng-template[nodeHtml]' })
export class NodeHtmlTemplateDirective {
  public templateRef = inject(TemplateRef)
}
