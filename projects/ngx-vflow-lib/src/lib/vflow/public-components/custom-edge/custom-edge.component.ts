import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  TemplateRef,
  viewChild,
  ViewContainerRef,
  OnInit,
} from '@angular/core';
import { EdgeContext } from '../../interfaces/template-context.interface';

@Component({
  selector: 'path[customEdge]',
  templateUrl: './custom-edge.component.html',
  styleUrl: './custom-edge.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.d]': 'context().path()',
    '[attr.marker-start]': 'context().markerStart()',
    '[attr.marker-end]': 'context().markerEnd()',
  },
})
export class CustomEdgeComponent implements OnInit {
  private viewContainer = inject(ViewContainerRef);

  public context = input.required<EdgeContext['$implicit']>({ alias: 'customEdge' });

  private interactiveEdgeRef = viewChild.required<TemplateRef<unknown>>('interactiveEdge');

  public ngOnInit(): void {
    this.viewContainer.createEmbeddedView(this.interactiveEdgeRef());
  }
}
