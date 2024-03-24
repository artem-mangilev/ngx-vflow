import { Directive, TemplateRef, inject } from '@angular/core';
import { EdgeContext } from '../interfaces/template-context.interface';

@Directive({ selector: 'ng-template[edge]' })
export class EdgeTemplateDirective {
  public templateRef = inject<TemplateRef<EdgeContext>>(TemplateRef)
}

@Directive({ selector: 'ng-template[connection]' })
export class ConnectionTemplateDirective {
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

@Directive({ selector: 'ng-template[handle]' })
export class HandleTemplateDirective {
  public templateRef = inject(TemplateRef)
}
