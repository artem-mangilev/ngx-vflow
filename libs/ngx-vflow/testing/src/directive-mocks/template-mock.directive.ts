import { Directive, TemplateRef, inject } from '@angular/core';
import type {
  ConnectionTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  HandleContext,
  HandleTemplateDirective,
  NodeTemplateDirective,
} from 'ngx-vflow';
import { AsInterface } from '../types';

@Directive({
  standalone: true,
  selector: 'ng-template[edge]',
})
export class EdgeTemplateMockDirective implements AsInterface<EdgeTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[connection]',
})
export class ConnectionTemplateMockDirective implements AsInterface<ConnectionTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[edgeLabelHtml]',
})
export class EdgeLabelHtmlTemplateMockDirective implements AsInterface<EdgeLabelHtmlTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[node]',
})
export class NodeTemplateMockDirective implements AsInterface<NodeTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[handle]',
})
export class HandleTemplateMockDirective implements AsInterface<HandleTemplateDirective> {
  public templateRef = inject<TemplateRef<HandleContext>>(TemplateRef);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Angular consumes this type predicate to check templates.
  static ngTemplateContextGuard(dir: HandleTemplateMockDirective, ctx: unknown): ctx is HandleContext {
    return true;
  }
}
