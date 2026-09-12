import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { createEdges, createNodes, Vflow, VflowComponent } from 'ngx-vflow';

interface Person {
  kind: 'person';
  name: string;
  role: string;
  initials: string;
  hue: number;
  reviews: number;
}
interface Metric {
  kind: 'metric';
  title: string;
  value: string;
  series: number[];
}
interface Note {
  kind: 'note';
  text: string;
}
interface Team {
  kind: 'team';
  title: string;
  members: number;
}
type MapData = Person | Metric | Note | Team;

/** Containers with their own connections, a note without ports, custom metrics and images, and a view mode. */
@Component({
  selector: 'app-ui-relationships-demo',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../demo.css'],
  styles: `
    vflow {
      height: 520px;
    }
    .person {
      width: 190px;
    }
    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
    }
    .meter {
      height: 6px;
      border-radius: 3px;
      background: var(--vui-surface-muted);
      overflow: hidden;
    }
    .meter span {
      display: block;
      height: 100%;
      background: var(--vui-accent);
    }
    .metric {
      width: 170px;
    }
    .value {
      font-size: 22px;
      font-weight: 600;
    }
    .spark {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 28px;
    }
    .spark span {
      flex: 1;
      background: var(--vui-muted);
      border-radius: 1px;
    }
    .note {
      width: 180px;
      background: #fef9c3;
      color: #713f12;
      border-color: #fde047;
    }
    [data-vui-theme='dark'] .note {
      background: #3f3b1f;
      color: #fef08a;
      border-color: #a16207;
    }
    .team {
      --vui-space: 4px;
    }
  `,
  template: `
    <section class="demo" aria-label="Relationships and metrics map demo" [vflowTheme]="dark() ? 'dark' : 'light'">
      <div class="controls">
        <button vflowButton type="button" (click)="flow()?.fitView()">Fit map</button>
        <label><input type="checkbox" [checked]="dark()" (change)="dark.set(!dark())" /> Dark theme</label>
        <label><input type="checkbox" [checked]="viewMode()" (change)="toggleViewMode()" /> View mode</label>
        <p>
          {{
            viewMode()
              ? 'Selection and keyboard navigation stay; moving and connecting are off.'
              : 'Drag people and teams; connect people to record a review.'
          }}
        </p>
      </div>
      <vflow view="auto" [nodes]="nodes" [edges]="edges">
        <ng-template let-ctx groupNode>
          <div
            vflowContainer
            class="team"
            selectable
            [vflowSelected]="ctx.selected() || ctx.preselected()"
            [style.width.px]="ctx.width()"
            [style.height.px]="ctx.height()">
            <span vflowTitle
              >{{ ctx.data().title }} <span vflowMeta>· {{ ctx.data().members }} people</span></span
            >
            <!-- The container has its own connections; it is not a parent of the other team. -->
            <handle type="source" position="right" [template]="port" [canStart]="!viewMode()" [canAccept]="false" />
            <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="!viewMode()" />
          </div>
        </ng-template>
        <ng-template let-ctx nodeHtml>
          @switch (ctx.data().kind) {
            @case ('person') {
              <article vflowNode class="person" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <header vflowNodeHeader>
                  <svg
                    vflowIcon
                    class="avatar"
                    viewBox="0 0 28 28"
                    role="img"
                    [attr.aria-label]="'Avatar of ' + ctx.data().name">
                    <circle cx="14" cy="14" r="14" [attr.fill]="'hsl(' + ctx.data().hue + ' 55% 45%)'" />
                    <text x="14" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">
                      {{ ctx.data().initials }}
                    </text>
                  </svg>
                  <span vflowTitle>{{ ctx.data().name }}</span>
                </header>
                <div vflowNodeBody>
                  <p vflowMeta>{{ ctx.data().role }} · {{ ctx.data().reviews }} reviews this month</p>
                  <div class="meter" role="img" [attr.aria-label]="ctx.data().reviews + ' of 20 reviews'">
                    <span [style.width.%]="ctx.data().reviews * 5"></span>
                  </div>
                </div>
                <handle type="target" position="left" [template]="port" [canStart]="false" [canAccept]="!viewMode()" />
                <handle type="source" position="right" [template]="port" [canStart]="!viewMode()" [canAccept]="false" />
              </article>
            }
            @case ('metric') {
              <article vflowNode class="metric" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <header vflowNodeHeader>
                  <span vflowTitle>{{ ctx.data().title }}</span>
                </header>
                <div vflowNodeBody>
                  <div class="value">{{ ctx.data().value }}</div>
                  <div class="spark" role="img" aria-label="Weekly trend, rising">
                    @for (point of ctx.data().series; track $index) {
                      <span [style.height.%]="point"></span>
                    }
                  </div>
                </div>
              </article>
            }
            @default {
              <!-- A note has no ports: it is content on the canvas, not a participant of the graph. -->
              <article vflowNode class="note" selectable [vflowSelected]="ctx.selected() || ctx.preselected()">
                <div vflowNodeBody>{{ ctx.data().text }}</div>
              </article>
            }
          }
        </ng-template>
        <ng-template let-ctx edge>
          <svg:g customTemplateEdge selectable>
            <svg:path
              vflowEdge
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [vflowSelected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
        </ng-template>
        <ng-template let-ctx edgeLabelHtml>
          <span vflowEdgeLabel>{{ ctx.label.data }}</span>
        </ng-template>
      </vflow>
      <ng-template #port let-ctx handle
        ><span vflowPort vflowPortConnected [vflowPortState]="ctx.state()"></span
      ></ng-template>
    </section>
  `,
})
export class RelationshipsDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly dark = signal(false);
  readonly viewMode = signal(false);
  readonly nodes = createNodes<MapData>([
    {
      id: 'platform',
      type: 'template-group',
      point: { x: 20, y: 20 },
      width: 440,
      height: 300,
      ariaLabel: 'Platform team',
      data: { kind: 'team', title: 'Platform', members: 2 },
    },
    {
      id: 'growth',
      type: 'template-group',
      point: { x: 560, y: 20 },
      width: 440,
      height: 300,
      ariaLabel: 'Growth team',
      data: { kind: 'team', title: 'Growth', members: 2 },
    },
    person('ana', { x: 20, y: 50 }, 'platform', 'Ana Lima', 'Lead', 'AL', 210, 14),
    person('ben', { x: 230, y: 160 }, 'platform', 'Ben Osei', 'Engineer', 'BO', 150, 9),
    person('chi', { x: 20, y: 50 }, 'growth', 'Chi Nguyen', 'Engineer', 'CN', 20, 6),
    person('dea', { x: 230, y: 160 }, 'growth', 'Dea Rossi', 'Analyst', 'DR', 280, 11),
    {
      id: 'deploys',
      type: 'html-template',
      point: { x: 20, y: 360 },
      ariaLabel: 'Deploys per week metric',
      data: { kind: 'metric', title: 'Deploys / week', value: '14', series: [30, 45, 40, 60, 55, 80, 100] },
    },
    {
      id: 'note',
      type: 'html-template',
      point: { x: 560, y: 360 },
      ariaLabel: 'Note',
      data: { kind: 'note', text: 'Q3 focus: fewer handoffs between the two teams.' },
    },
  ]);
  readonly edges = createEdges([
    // A connection between the two containers themselves.
    {
      id: 'platform-growth',
      source: 'platform',
      target: 'growth',
      curve: 'smooth-step',
      markers: { end: {} },
      edgeLabels: { center: { type: 'html-template', data: '3 shared services' } },
    },
    review('ana-ben', 'ana', 'ben', 'reviews'),
    review('ben-chi', 'ben', 'chi', 'pairs with'),
    review('chi-dea', 'chi', 'dea', 'reviews'),
  ]);

  constructor() {
    effect(() => {
      const flow = this.flow();
      if (flow?.initialized()) untracked(() => flow.fitView());
    });
  }

  toggleViewMode() {
    this.viewMode.update((value) => !value);
    this.nodes.forEach((node) => node.draggable.set(!this.viewMode()));
  }
}

function person(
  id: string,
  point: { x: number; y: number },
  parentId: string,
  name: string,
  role: string,
  initials: string,
  hue: number,
  reviews: number,
) {
  return {
    id,
    type: 'html-template' as const,
    point,
    parentId,
    ariaLabel: name,
    data: { kind: 'person' as const, name, role, initials, hue, reviews },
  };
}

function review(id: string, source: string, target: string, text: string) {
  return {
    id,
    source,
    target,
    curve: 'bezier' as const,
    markers: { end: {} },
    edgeLabels: { center: { type: 'html-template' as const, data: text } },
  };
}
