/* eslint-disable @typescript-eslint/no-unused-vars -- Angular template context guards use parameters only in type predicates. */
import { Directive, TemplateRef, inject } from '@angular/core';
import {
  ConnectionContext,
  EdgeContext,
  HandleContext,
  HtmlEdgeLabelContext,
  NodeContext,
} from '../interfaces/template-context.interface';

@Directive({
  standalone: true,
  selector: 'ng-template[edge]',
})
export class EdgeTemplateDirective {
  public templateRef = inject<TemplateRef<EdgeContext>>(TemplateRef);

  static ngTemplateContextGuard(dir: EdgeTemplateDirective, ctx: unknown): ctx is EdgeContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[connection]',
})
export class ConnectionTemplateDirective {
  public templateRef = inject(TemplateRef);

  static ngTemplateContextGuard(dir: ConnectionTemplateDirective, ctx: unknown): ctx is ConnectionContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[edgeLabelHtml]',
})
export class EdgeLabelHtmlTemplateDirective {
  public templateRef = inject(TemplateRef);

  static ngTemplateContextGuard(dir: EdgeLabelHtmlTemplateDirective, ctx: unknown): ctx is HtmlEdgeLabelContext {
    return true;
  }
}

/** Presentation of every node without a `component`. */
@Directive({
  standalone: true,
  selector: 'ng-template[node]',
})
export class NodeTemplateDirective {
  public templateRef = inject<TemplateRef<NodeContext>>(TemplateRef);

  static ngTemplateContextGuard(dir: NodeTemplateDirective, ctx: unknown): ctx is NodeContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[handle]',
})
export class HandleTemplateDirective {
  public templateRef = inject<TemplateRef<HandleContext>>(TemplateRef);

  static ngTemplateContextGuard(dir: HandleTemplateDirective, ctx: unknown): ctx is HandleContext {
    return true;
  }
}
