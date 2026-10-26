import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { Vui } from '@vflow/ui';
import { createEdges, createNodes, NodeDragEvent, Vflow, VflowComponent } from 'ngx-vflow';
import { injectDocsTheme } from '../../../shared/docs-theme';

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
}
type MapData = Person | Metric | Note | Team;

/**
 * Nested, resizable groups with their own connections; people move between teams by drag and drop, a note without
 * ports, custom metrics and images.
 */
@Component({
  selector: 'app-ui-relationships-demo',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    vflow {
      height: 560px;
    }
    .person {
      width: 190px;
    }
    .avatar {
      display: block;
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
      transition:
        border-color 120ms,
        background-color 120ms;
    }
    /* A nested team sits a step darker than its parent. */
    .team.nested {
      background: color-mix(in oklab, var(--vui-surface-muted), var(--vui-foreground) 4%);
    }
    /* Drop feedback is application CSS: the team under a dragged person. */
    .team[data-drop-target='true'] {
      border-color: var(--vui-accent);
      background: color-mix(in oklab, var(--vui-surface-muted), var(--vui-accent) 10%);
    }
  `,
  template: `
    <section class="demo" aria-label="Relationships and metrics map demo" [attr.data-vui-theme]="theme()">
      <vflow
        view="auto"
        [nodes]="nodes"
        [edges]="edges"
        (nodeDragStart)="dragStart($event)"
        (nodeDrag)="drag($event)"
        (nodeDragEnd)="dragEnd($event)"
        (initialized)="flow()?.fitView()">
        <ng-template let-ctx vNode>
          @if (ctx.data().kind === 'team') {
            <!-- Selecting a team shows its resize controls; core keeps the children inside while it shrinks. -->
            <div
              vuiGroup
              class="team"
              [class.nested]="!!ctx.node.parentId?.()"
              [attr.data-team]="ctx.node.id"
              [attr.data-drop-target]="dropTarget() === ctx.node.id"
              [selected]="ctx.selected() || ctx.preselected()"
              [vResizable]="ctx.selected()"
              [minWidth]="240"
              [minHeight]="120">
              <header vuiGroupHeader>
                <span vuiTitle>{{ ctx.data().title }}</span>
                <span vuiMeta data-testid="members">{{ headCount(members().get(ctx.node.id) ?? 0) }}</span>
              </header>
              @if (!ctx.node.parentId?.()) {
                <!-- The group has its own connections; it is not a parent of the other team. -->
                <span vuiPort handleType="source" position="right" vuiPortConnected [canAccept]="false"></span>
                <span vuiPort handleType="target" position="left" vuiPortConnected [canStart]="false"></span>
              }
            </div>
          } @else {
            @switch (ctx.data().kind) {
              @case ('person') {
                <article vuiNode class="person" [selected]="ctx.selected() || ctx.preselected()">
                  <header vuiNodeHeader>
                    <!-- The slot centers the 28px avatar on the first line of the name. -->
                    <span vuiIcon>
                      <svg
                        class="avatar"
                        viewBox="0 0 28 28"
                        role="img"
                        [attr.aria-label]="'Avatar of ' + ctx.data().name">
                        <circle cx="14" cy="14" r="14" [attr.fill]="'hsl(' + ctx.data().hue + ' 55% 45%)'" />
                        <text x="14" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">
                          {{ ctx.data().initials }}
                        </text>
                      </svg>
                    </span>
                    <span vuiTitle>{{ ctx.data().name }}</span>
                  </header>
                  <div vuiNodeBody>
                    <p vuiMeta>{{ ctx.data().role }}, {{ ctx.data().reviews }} reviews this month</p>
                    <div class="meter" role="img" [attr.aria-label]="ctx.data().reviews + ' of 20 reviews'">
                      <span [style.width.%]="ctx.data().reviews * 5"></span>
                    </div>
                  </div>
                  <span vuiPort handleType="target" position="left" vuiPortConnected [canStart]="false"></span>
                  <span vuiPort handleType="source" position="right" vuiPortConnected [canAccept]="false"></span>
                </article>
              }
              @case ('metric') {
                <article vuiNode class="metric" [selected]="ctx.selected() || ctx.preselected()">
                  <header vuiNodeHeader>
                    <span vuiTitle>{{ ctx.data().title }}</span>
                  </header>
                  <div vuiNodeBody>
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
                <article vuiNode class="note" [selected]="ctx.selected() || ctx.preselected()">
                  <div vuiNodeBody>{{ ctx.data().text }}</div>
                </article>
              }
            }
          }
        </ng-template>
        <ng-template let-ctx vEdge>
          <svg:g vEdgeInteraction>
            <svg:path
              vuiEdge
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [selected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
          @if (ctx.data()?.label; as label) {
            <span *vEdgeLabel vuiEdgeLabel>{{ label }}</span>
          }
        </ng-template>
      </vflow>
    </section>
  `,
})
export class RelationshipsDemoComponent {
  readonly flow = viewChild(VflowComponent);
  readonly theme = injectDocsTheme();
  readonly nodes = createNodes<MapData>([
    team('platform', { x: 0, y: 0 }, 520, 450, 'Platform'),
    // A team inside a team: its point is relative to Platform, and it stays inside it like any child.
    team('infra', { x: 24, y: 220 }, 472, 210, 'Infra', 'platform'),
    team('growth', { x: 660, y: 0 }, 420, 450, 'Growth'),
    person('ana', { x: 24, y: 56 }, 'platform', 'Ana Lima', 'Lead', 'AL', 210, 14),
    person('ben', { x: 16, y: 52 }, 'infra', 'Ben Osei', 'Engineer', 'BO', 150, 9),
    person('eli', { x: 276, y: 52 }, 'infra', 'Eli Park', 'SRE', 'EP', 100, 5),
    person('chi', { x: 24, y: 56 }, 'growth', 'Chi Nguyen', 'Engineer', 'CN', 20, 6),
    person('dea', { x: 206, y: 280 }, 'growth', 'Dea Rossi', 'Analyst', 'DR', 280, 11),
    {
      id: 'deploys',
      point: { x: 0, y: 500 },
      ariaLabel: 'Deploys per week metric',
      data: { kind: 'metric', title: 'Deploys / week', value: '14', series: [30, 45, 40, 60, 55, 80, 100] },
    },
    {
      id: 'note',
      point: { x: 660, y: 500 },
      ariaLabel: 'Note',
      data: { kind: 'note', text: 'Q3 focus: fewer handoffs between the two teams.' },
    },
  ]);
  readonly edges = createEdges([
    // A connection between the two groups themselves.
    {
      id: 'platform-growth',
      source: 'platform',
      target: 'growth',
      curve: 'smooth-step',
      markers: { end: {} },
      data: { label: '3 shared services' },
    },
    review('ana-ben', 'ana', 'ben', 'reviews'),
    review('ben-eli', 'ben', 'eli', 'pairs with'),
    review('ana-chi', 'ana', 'chi', 'mentors'),
    review('chi-dea', 'chi', 'dea', 'reviews'),
  ]);

  /** The team under the dragged person; it is where the person lands on release. */
  readonly dropTarget = signal<string | null>(null);

  /** Head count of every team, nested teams included: membership is `parentId`, so it follows every move. */
  readonly members = computed(() => {
    const counts = new Map<string, number>();
    for (const node of this.nodes) {
      if (node.data().kind !== 'person') continue;
      for (let id = node.parentId(); id; id = this.node(id).parentId()) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return counts;
  });

  headCount(count: number) {
    return count === 1 ? '1 person' : `${count} people`;
  }

  /** A person may leave its team while dragged; the drop decides the new team. */
  dragStart({ nodes }: NodeDragEvent) {
    this.movedPeople(nodes).forEach((node) => node.extent.set(null));
  }

  drag({ node }: NodeDragEvent) {
    this.dropTarget.set(this.isPerson(node.id) ? (this.teamUnder(node.id) ?? this.node(node.id).parentId()) : null);
  }

  /** Moves each dropped person into the innermost team under its center, or back into its own team. */
  dragEnd({ nodes }: NodeDragEvent) {
    const flow = this.flow()!;
    for (const node of this.movedPeople(nodes)) {
      const teamId = this.teamUnder(node.id) ?? node.parentId()!;
      const rect = flow.getNodeRect(node.id)!;
      const box = flow.getNodeRect(teamId)!;
      node.parentId.set(teamId);
      node.point.set({
        x: clamp(rect.x - box.x, 0, box.width - rect.width),
        y: clamp(rect.y - box.y, 0, box.height - rect.height),
      });
      node.extent.set('parent');
    }
    this.dropTarget.set(null);
  }

  private teamUnder(id: string) {
    const flow = this.flow()!;
    const rect = flow.getNodeRect(id)!;
    const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    // Selection elevates a node, so the topmost team is not always the innermost one: compare depths instead.
    return flow
      .getNodesAtPoint<MapData>(center)
      .map(({ node }) => node.id)
      .filter((nodeId) => this.node(nodeId).data().kind === 'team')
      .sort((a, b) => this.depth(b) - this.depth(a))[0];
  }

  private depth(id: string): number {
    const parentId = this.node(id).parentId();
    return parentId ? this.depth(parentId) + 1 : 0;
  }

  private node(id: string) {
    return this.nodes.find((node) => node.id === id)!;
  }

  private isPerson(id: string) {
    return this.node(id).data().kind === 'person';
  }

  private movedPeople(nodes: { id: string }[]) {
    return nodes.filter((node) => this.isPerson(node.id)).map((node) => this.node(node.id));
  }
}

function team(
  id: string,
  point: { x: number; y: number },
  width: number,
  height: number,
  title: string,
  parentId?: string,
) {
  return { id, point, width, height, parentId, ariaLabel: `${title} team`, data: { kind: 'team' as const, title } };
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
    data: { label: text },
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
