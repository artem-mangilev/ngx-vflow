import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  standalone: true,
  selector: 'ng-template[edge]',
})
export class EdgeTemplateMockDirective {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[connection]',
})
export class ConnectionTemplateMockDirective {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[edgeLabelHtml]',
})
export class EdgeLabelHtmlTemplateMockDirective {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[nodeHtml]',
})
export class NodeHtmlTemplateMockDirective {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[groupNode]',
})
export class GroupNodeTemplateMockDirective {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[handle]',
})
export class HandleTemplateMockDirective {
  public templateRef = inject(TemplateRef);
}
