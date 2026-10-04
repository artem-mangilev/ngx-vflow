/* eslint-disable @typescript-eslint/no-unused-vars -- Angular template context guards use parameters only in type predicates. */
import {
  Directive,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  isDevMode,
  numberAttribute,
  untracked,
} from '@angular/core';
import { ConnectionContext, EdgeContext, NodeContext } from '../interfaces/template-context.interface';
import { EdgeLabelOrient, EdgeLabelPosition } from '../interfaces/edge-label.interface';
import { EdgeComponent } from '../components/edge/edge.component';

@Directive({
  standalone: true,
  selector: 'ng-template[vEdge]',
})
export class VflowEdgeTemplateDirective {
  public templateRef = inject<TemplateRef<EdgeContext>>(TemplateRef);

  static ngTemplateContextGuard(dir: VflowEdgeTemplateDirective, ctx: unknown): ctx is EdgeContext {
    return true;
  }
}

@Directive({
  standalone: true,
  selector: 'ng-template[vConnection]',
})
export class VflowConnectionTemplateDirective {
  public templateRef = inject(TemplateRef);

  static ngTemplateContextGuard(dir: VflowConnectionTemplateDirective, ctx: unknown): ctx is ConnectionContext {
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
 * <span *vEdgeLabel>Center</span>
 * <span *vEdgeLabel="'end'">End</span>
 * <ng-template vEdgeLabel="start"><b>Start</b> label</ng-template>
 * ```
 *
 * `orient: 'path'` turns the label along the path at its point, kept readable left to right:
 *
 * ```html
 * <span *vEdgeLabel="'center'; orient: 'path'">Along the curve</span>
 * <ng-template vEdgeLabel="end" vEdgeLabelOrient="path">…</ng-template>
 * ```
 *
 * Declare it next to the SVG presentation of the edge, never inside an `svg:*` element: Angular compiles the children
 * of a template inside SVG in the SVG namespace, and such content does not render in the HTML layer.
 */
@Directive({
  standalone: true,
  selector: 'ng-template[vEdgeLabel]',
})
export class VflowEdgeLabelTemplateDirective {
  private templateRef = inject<TemplateRef<void>>(TemplateRef);
  private edge = inject(EdgeComponent);

  /** Point of the path where the label renders. The directive without a value means `center`. */
  public vEdgeLabel = input<EdgeLabelPosition, EdgeLabelPosition | '' | null | undefined>('center', {
    transform: (position) => position || 'center',
  });

  /** `horizontal` keeps the label level; `path` turns it along the path, when the curve provides the angle. */
  public vEdgeLabelOrient = input<EdgeLabelOrient, EdgeLabelOrient | null | undefined>('horizontal', {
    transform: (orient) => orient ?? 'horizontal',
  });

  constructor() {
    effect((onCleanup) => {
      const position = this.vEdgeLabel();
      const orient = this.vEdgeLabelOrient();
      const model = this.edge.model();

      untracked(() => {
        const current = model.labelTemplates()[position];
        if (isDevMode() && current && current.template !== this.templateRef) {
          console.warn(
            `[ngx-vflow] Edge "${model.edge.id}" declares more than one label at "${position}"; the last one wins.`,
          );
        }
        model.labelTemplates.update((templates) => ({
          ...templates,
          [position]: { template: this.templateRef, orient },
        }));
      });

      onCleanup(() =>
        model.labelTemplates.update((templates) => {
          if (templates[position]?.template !== this.templateRef) {
            return templates;
          }
          const rest = { ...templates };
          delete rest[position];
          return rest;
        }),
      );
    });

    if (isDevMode()) {
      // The effect follows this value, not the path, so it warns once and not on every recomputed path.
      const edgeWithoutLabelPoints = computed(() => {
        const model = this.edge.model();
        const layout = model.path();
        return layout.path && !layout.labelPoints ? model.edge.id : undefined;
      });
      effect(() => {
        const id = edgeWithoutLabelPoints();
        if (id !== undefined) {
          console.warn(`[ngx-vflow] Edge "${id}" uses a curve without labelPoints, so its labels do not render.`);
        }
      });
    }
  }
}

/**
 * A marker shape of the application, by type. The flow renders one `<marker>` element per distinct marker of that
 * type, with the size and orientation the marker asks for and the stroke of the edge; the template is the shape
 * inside it. Draw in the viewBox `-10 -10 20 20` with the tip vertex at `x = -1`, so that the stroke ends at `0`,
 * and the body towards negative `x`; give `fill="none"` or `fill="context-stroke"` yourself, stroke properties
 * inherit from the marker element.
 *
 * ```html
 * <ng-template vMarker="diamond" inset="8">
 *   <svg:polygon fill="context-stroke" points="-1,0 -5,-4 -9,0 -5,4" />
 * </ng-template>
 * ```
 *
 * `inset` is where the path ends, in marker units before the connection point: one unit inside the back vertex
 * of the shape, the line ends under its stroke.
 */
@Directive({
  standalone: true,
  selector: 'ng-template[vMarker]',
})
export class VflowMarkerTemplateDirective {
  public templateRef = inject<TemplateRef<void>>(TemplateRef);

  /** Type of the markers that render this shape. */
  public vMarker = input.required<string>();

  /** Marker units between the path end and the tip of the shape. */
  public inset = input(0, { transform: numberAttribute });
}

/** Presentation of every node without a `component`. */
@Directive({
  standalone: true,
  selector: 'ng-template[vNode]',
})
export class VflowNodeTemplateDirective {
  public templateRef = inject<TemplateRef<NodeContext>>(TemplateRef);

  static ngTemplateContextGuard(dir: VflowNodeTemplateDirective, ctx: unknown): ctx is NodeContext {
    return true;
  }
}
