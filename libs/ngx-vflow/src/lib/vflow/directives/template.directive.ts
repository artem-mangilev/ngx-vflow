/* eslint-disable @typescript-eslint/no-unused-vars -- Angular template context guards use parameters only in type predicates. */
import { Directive, TemplateRef, effect, inject, input, isDevMode, untracked } from '@angular/core';
import { ConnectionContext, EdgeContext, HandleContext, NodeContext } from '../interfaces/template-context.interface';
import { EdgeLabelPosition } from '../interfaces/edge-label.interface';
import { EdgeComponent } from '../components/edge/edge.component';

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

/**
 * Label of the edge whose presentation declares it. The flow renders the template in its HTML label layer at the
 * `start`, `center` or `end` point of the edge path, so the content closes over the edge context or component state.
 *
 * Use the structural form on one element, without a value for the center; use the long form for several elements:
 *
 * ```html
 * <span *edgeLabel>Center</span>
 * <span *edgeLabel="'end'">End</span>
 * <ng-template edgeLabel="start"><b>Start</b> label</ng-template>
 * ```
 *
 * Declare it next to the SVG presentation of the edge, never inside an `svg:*` element: Angular compiles the children
 * of a template inside SVG in the SVG namespace, and such content does not render in the HTML layer.
 */
@Directive({
  standalone: true,
  selector: 'ng-template[edgeLabel]',
})
export class EdgeLabelTemplateDirective {
  private templateRef = inject<TemplateRef<void>>(TemplateRef);
  private edge = inject(EdgeComponent);

  /** Point of the path where the label renders. The directive without a value means `center`. */
  public edgeLabel = input<EdgeLabelPosition, EdgeLabelPosition | '' | null | undefined>('center', {
    transform: (position) => position || 'center',
  });

  constructor() {
    effect((onCleanup) => {
      const position = this.edgeLabel();
      const model = this.edge.model();

      untracked(() => {
        const current = model.labelTemplates()[position];
        if (isDevMode() && current && current !== this.templateRef) {
          console.warn(
            `[ngx-vflow] Edge "${model.edge.id}" declares more than one label at "${position}"; the last one wins.`,
          );
        }
        model.labelTemplates.update((templates) => ({ ...templates, [position]: this.templateRef }));
      });

      onCleanup(() =>
        model.labelTemplates.update((templates) => {
          if (templates[position] !== this.templateRef) {
            return templates;
          }
          const rest = { ...templates };
          delete rest[position];
          return rest;
        }),
      );
    });

    if (isDevMode()) {
      let warned = false;
      effect(() => {
        if (warned) {
          return;
        }
        const model = this.edge.model();
        const layout = model.path();
        if (layout.path && !layout.labelPoints) {
          warned = true;
          console.warn(
            `[ngx-vflow] Edge "${model.edge.id}" uses a curve without labelPoints, so its labels do not render.`,
          );
        }
      });
    }
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
