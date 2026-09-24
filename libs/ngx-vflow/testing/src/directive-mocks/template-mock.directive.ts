import { Directive, TemplateRef, ViewContainerRef, inject, input } from '@angular/core';
import type {
  ConnectionTemplateDirective,
  EdgeLabelOrient,
  EdgeLabelPosition,
  EdgeLabelTemplateDirective,
  EdgeTemplateDirective,
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

  public edgeLabelOrient = input<EdgeLabelOrient, EdgeLabelOrient | null | undefined>('horizontal', {
    transform: (orient) => orient ?? 'horizontal',
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
