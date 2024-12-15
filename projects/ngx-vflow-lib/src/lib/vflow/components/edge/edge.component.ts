import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { EdgeModel } from '../../models/edge.model';
import { hashCode } from '../../utils/hash';
import { EdgeContext } from '../../interfaces/template-context.interface';
import { SelectionService } from '../../services/selection.service';
import { FlowSettingsService } from '../../services/flow-settings.service';

@Component({
  selector: 'g[edge]',
  templateUrl: './edge.component.html',
  styleUrls: ['./edge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'selectable',
  },
})
export class EdgeComponent implements OnInit {
  protected injector = inject(Injector);
  private selectionService = inject(SelectionService);
  private flowSettingsService = inject(FlowSettingsService);

  public model = input.required<EdgeModel>();

  public edgeTemplate = input<TemplateRef<EdgeContext>>();

  public edgeLabelHtmlTemplate = input<TemplateRef<any>>();

  protected markerStartUrl = computed(() => {
    const marker = this.model().edge.markers?.start;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  protected markerEndUrl = computed(() => {
    const marker = this.model().edge.markers?.end;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : '';
  });

  protected edgeContext!: EdgeContext;

  public ngOnInit(): void {
    this.edgeContext = {
      $implicit: {
        // TODO: check if edge could change
        edge: this.model().edge,
        path: computed(() => this.model().path().path),
        markerStart: this.markerStartUrl,
        markerEnd: this.markerEndUrl,
        selected: this.model().selected.asReadonly(),
      },
    };
  }

  public onEdgeMouseDown() {
    if (this.flowSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.model());
    }
  }
}
