import { Directive, TemplateRef, inject } from '@angular/core';
import {
  ConnectionContext,
  EdgeContext,
  GroupNodeContext,
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

@Directive({
  standalone: true,
  selector: 'ng-template[nodeHtml]',
})
export class NodeHtmlTemplateDirective {
  public templateRef = inject(TemplateRef);

  static ngTemplateContextGuard(dir: NodeHtmlTemplateDirective, ctx: unknown): ctx is NodeContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[nodeSvg]',
})
export class NodeSvgTemplateDirective {
  public templateRef = inject(TemplateRef);

  static ngTemplateContextGuard(dir: NodeSvgTemplateDirective, ctx: unknown): ctx is NodeContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[groupNode]',
})
export class GroupNodeTemplateDirective {
  public templateRef = inject(TemplateRef);

  static ngTemplateContextGuard(dir: GroupNodeTemplateDirective, ctx: unknown): ctx is GroupNodeContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[handle]',
})
export class HandleTemplateDirective {
  public templateRef = inject(TemplateRef);

  // TODO
  // static ngTemplateContextGuard(dir: HandleTemplateDirective, ctx: unknown): ctx is HandleContext {
  //   return true;
  // }
}
