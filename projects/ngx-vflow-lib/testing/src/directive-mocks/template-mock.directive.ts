import { Directive, TemplateRef, inject } from '@angular/core';
import type {
  ConnectionTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  GroupNodeTemplateDirective,
  HandleTemplateDirective,
  NodeHtmlTemplateDirective,
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
  selector: 'ng-template[nodeHtml]',
})
export class NodeHtmlTemplateMockDirective implements AsInterface<NodeHtmlTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[nodeSvg]',
})
export class NodeSvgTemplateMockDirective implements AsInterface<NodeSvgTemplateMockDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[groupNode]',
})
export class GroupNodeTemplateMockDirective implements AsInterface<GroupNodeTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[handle]',
})
export class HandleTemplateMockDirective implements AsInterface<HandleTemplateDirective> {
  public templateRef = inject(TemplateRef);
}
