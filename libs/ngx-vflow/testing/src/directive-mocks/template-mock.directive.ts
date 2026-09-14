import { Directive, TemplateRef, ViewContainerRef, inject, input } from '@angular/core';
import type {
  ConnectionTemplateDirective,
  EdgeLabelPosition,
  EdgeLabelTemplateDirective,
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

/** Renders the label in place, next to the edge presentation that declares it. */
@Directive({
  standalone: true,
  selector: 'ng-template[edgeLabel]',
})
export class EdgeLabelTemplateMockDirective implements AsInterface<EdgeLabelTemplateDirective> {
  public edgeLabel = input<EdgeLabelPosition, EdgeLabelPosition | '' | null | undefined>('center', {
    transform: (position) => position || 'center',
  });

  constructor() {
    inject(ViewContainerRef).createEmbeddedView(inject(TemplateRef));
  }
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
