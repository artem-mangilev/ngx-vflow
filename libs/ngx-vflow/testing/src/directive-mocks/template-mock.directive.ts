import { Directive, TemplateRef, ViewContainerRef, inject, input, numberAttribute } from '@angular/core';
import type {
  VflowConnectionTemplateDirective,
  EdgeLabelOrient,
  EdgeLabelPosition,
  VflowEdgeLabelTemplateDirective,
  VflowEdgeTemplateDirective,
  VflowMarkerTemplateDirective,
  VflowNodeTemplateDirective,
} from 'ngx-vflow';
import { AsInterface } from '../types';

@Directive({
  standalone: true,
  selector: 'ng-template[vEdge]',
})
export class VflowEdgeTemplateMockDirective implements AsInterface<VflowEdgeTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

@Directive({
  standalone: true,
  selector: 'ng-template[vConnection]',
})
export class VflowConnectionTemplateMockDirective implements AsInterface<VflowConnectionTemplateDirective> {
  public templateRef = inject(TemplateRef);
}

/** Renders the label in place, next to the edge presentation that declares it. */
@Directive({
  standalone: true,
  selector: 'ng-template[vEdgeLabel]',
})
export class VflowEdgeLabelTemplateMockDirective implements AsInterface<VflowEdgeLabelTemplateDirective> {
  public vEdgeLabel = input<EdgeLabelPosition, EdgeLabelPosition | '' | null | undefined>('center', {
    transform: (position) => position || 'center',
  });

  public vEdgeLabelOrient = input<EdgeLabelOrient, EdgeLabelOrient | null | undefined>('horizontal', {
    transform: (orient) => orient ?? 'horizontal',
  });

  constructor() {
    inject(ViewContainerRef).createEmbeddedView(inject(TemplateRef));
  }
}

/** A marker shape renders nowhere: the mock draws no SVG. */
@Directive({
  standalone: true,
  selector: 'ng-template[vMarker]',
})
export class VflowMarkerTemplateMockDirective implements AsInterface<VflowMarkerTemplateDirective> {
  public templateRef = inject(TemplateRef);

  public vMarker = input.required<string>();

  public inset = input(0, { transform: numberAttribute });
}

@Directive({
  standalone: true,
  selector: 'ng-template[vNode]',
})
export class VflowNodeTemplateMockDirective implements AsInterface<VflowNodeTemplateDirective> {
  public templateRef = inject(TemplateRef);
}
