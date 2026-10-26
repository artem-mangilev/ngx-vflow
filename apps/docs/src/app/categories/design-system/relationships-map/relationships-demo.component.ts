import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { Vui } from '@vflow/ui';
import {
  addEdges,
  Connection,
  ConnectionSettings,
  createEdge,
  createEdges,
  createNodes,
  DeleteRequest,
  Edge,
  NodeDragEvent,
  Point,
  removeElements,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';
import { injectDocsTheme } from '../../../shared/docs-theme';

interface Person {
  kind: 'person';
  name: string;
  role: string;
  initials: string;
  /** Avatar fill, chosen for 4.5:1 with the white initials. */
  color: string;
  reviews: number;
}
interface Metric {
  kind: 'metric';
  title: string;
  value: string;
  delta: string;
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

interface Relation {
  label?: string;
  /** A relation without a direction, drawn without an arrowhead. */
  mutual?: boolean;
  /** A link of content to a team rather than a relation between people. */
  link?: boolean;
}

/** Room a dropped person keeps from the team border, the team header and other members. */
const LAYOUT = { inset: 16, header: 52, gap: 16, step: 8 };

/**
 * Nested, resizable groups with their own connections; people move between teams by drag and drop and connect by
 * dragging from one card to another; floating edges meet every card on the side facing the other end.
 */
@Component({
  selector: 'app-ui-relationships-demo',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    vflow {
      height: 560px;
    }
    article {
      font-size: 14px;
    }
    .person {
      width: 170px;
    }
    /* The card is the handle: the name row drags the person, the rest starts or accepts a connection. */
    .person header {
      cursor: grab;
    }
    .person .vui-node-body {
      cursor: crosshair;
    }
    .person[data-v-handle-state='valid'] {
      outline: 2px solid var(--vui-accent);
      outline-offset: 2px;
    }
    .avatar {
      display: block;
      width: 28px;
      height: 28px;
      border-radius: 50%;
    }
    .meter {
      height: 6px;
      border-radius: 3px;
      background: var(--vui-surface-muted);
      overflow: hidden;
    }
    /* Neutral: the accent belongs to selection. */
    .meter span {
      display: block;
      height: 100%;
      background: var(--vui-muted);
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
      margin-top: 6px;
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
    /* Drop feedback is application CSS: the team under a dragged person, or a team without room. */
    .team[data-drop-target='ok'] {
      border-color: var(--vui-accent);
      background: color-mix(in oklab, var(--vui-surface-muted), var(--vui-accent) 10%);
    }
    .team[data-drop-target='full'] {
      border-color: var(--vui-danger);
    }
    .vui-edge[data-link='true'] {
      stroke-dasharray: 4 4;
    }
  `,
  template: `
    <section class="demo" aria-label="Relationships and metrics map demo" [attr.data-vui-theme]="theme()">
      <vflow
        view="auto"
        [nodes]="nodes"
        [edges]="edges()"
        [connection]="connection"
        (connect)="connect($event)"
        (deleteRequest)="remove($event)"
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
              [attr.data-drop-target]="dropTarget()?.team === ctx.node.id ? dropTarget()!.state : null"
              [selected]="ctx.selected() || ctx.preselected()"
              [vResizable]="ctx.selected()"
              [minWidth]="240"
              [minHeight]="120">
              <header vuiGroupHeader>
                <span vuiTitle>{{ ctx.data().title }}</span>
                <span vuiMeta data-testid="members">{{ headCount(members().get(ctx.node.id) ?? 0) }}</span>
              </header>
              <!-- The group has its own connections, which float to the side facing the other end. -->
              <span vHandle handleType="any" position="auto" [canStart]="false" [canAccept]="false"></span>
            </div>
          } @else {
            @switch (ctx.data().kind) {
              @case ('person') {
                <article
                  vuiNode
                  vHandle
                  handleType="any"
                  position="auto"
                  class="person"
                  [selected]="ctx.selected() || ctx.preselected()">
                  <header vuiNodeHeader vDragHandle>
                    <!-- The slot centers the 28px avatar on the first line of the name. -->
                    <span vuiIcon>
                      <svg
                        class="avatar"
                        viewBox="0 0 28 28"
                        role="img"
                        [attr.aria-label]="'Avatar of ' + ctx.data().name">
                        <circle cx="14" cy="14" r="14" [attr.fill]="ctx.data().color" />
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
                </article>
              }
              @case ('metric') {
                <article vuiNode class="metric" [selected]="ctx.selected() || ctx.preselected()">
                  <header vuiNodeHeader>
                    <span vuiTitle>{{ ctx.data().title }}</span>
                  </header>
                  <div vuiNodeBody>
                    <div class="value">{{ ctx.data().value }}</div>
                    <p vuiMeta>{{ ctx.data().delta }}</p>
                    <div class="spark" role="img" aria-label="Weekly trend, rising">
                      @for (point of ctx.data().series; track $index) {
                        <span [style.height.%]="point"></span>
                      }
                    </div>
                  </div>
                  <span vHandle handleType="any" position="auto" [canStart]="false" [canAccept]="false"></span>
                </article>
              }
              @default {
                <!-- A note has no handle: it is content on the canvas, not a participant of the graph. -->
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
              [attr.data-link]="!!ctx.data()?.link"
              [selected]="ctx.selected() || ctx.preselected()" />
          </svg:g>
          @if (ctx.data()?.label; as label) {
            <span *vEdgeLabel vuiEdgeLabel>{{ label }}</span>
          }
        </ng-template>
        <ng-template let-ctx vConnection>
          @if (ctx.path(); as path) {
            <svg:path vuiEdge stroke-dasharray="5 4" [attr.d]="path" />
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
    team('platform', { x: 0, y: 0 }, 606, 510, 'Platform'),
    // A team inside a team: its point is relative to Platform, and it stays inside it like any child.
    team('infra', { x: 16, y: 260 }, 574, 234, 'Infra', 'platform'),
    team('growth', { x: 726, y: 0 }, 400, 510, 'Growth'),
    person('ana', { x: 16, y: 52 }, 'platform', 'Ana Lima', 'Lead', 'AL', '#2563eb', 14),
    person('ben', { x: 16, y: 52 }, 'infra', 'Ben Osei', 'Engineer', 'BO', '#047857', 9),
    person('eli', { x: 388, y: 52 }, 'infra', 'Eli Park', 'SRE', 'EP', '#4d7c0f', 5),
    person('chi', { x: 16, y: 52 }, 'growth', 'Chi Nguyen', 'Engineer', 'CN', '#c2410c', 6),
    person('dea', { x: 214, y: 280 }, 'growth', 'Dea Rossi', 'Analyst', 'DR', '#7e22ce', 11),
    {
      id: 'deploys',
      point: { x: 0, y: 560 },
      ariaLabel: 'Deploys per week metric',
      data: {
        kind: 'metric',
        title: 'Deploys / week',
        value: '14',
        delta: '+27% in 6 weeks',
        series: [30, 45, 40, 60, 55, 80, 100],
      },
    },
    {
      id: 'note',
      point: { x: 576, y: 560 },
      ariaLabel: 'Note',
      data: { kind: 'note', text: 'Q3 focus: fewer handoffs between the two teams.' },
    },
  ]);
  readonly edges = signal<Edge<Relation>[]>(
    createEdges<Relation>([
      // A connection between the two groups themselves.
      relation('platform-growth', 'platform', 'growth', { label: '3 shared services' }),
      relation('platform-deploys', 'platform', 'deploys', { link: true }),
      relation('ana-ben', 'ana', 'ben', { label: 'reviews' }),
      relation('ben-eli', 'ben', 'eli', { label: 'pairs with', mutual: true }),
      relation('ana-chi', 'ana', 'chi', { label: 'mentors' }),
      relation('chi-dea', 'chi', 'dea', { label: 'reviews' }),
    ]),
  );

  /** People connect to people once, in either direction. */
  readonly connection: ConnectionSettings = {
    validator: ({ source, target }) =>
      source !== target &&
      this.isPerson(source) &&
      this.isPerson(target) &&
      !this.edges().some(
        (edge) =>
          (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source),
      ),
  };

  /** The team under the dragged person, and whether it has room; the drop lands there. */
  readonly dropTarget = signal<{ team: string; state: 'ok' | 'full' } | null>(null);

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

  /** Where each dragged person came from, to return there when the drop has no room. */
  private origins = new Map<string, { parentId: string; point: Point }>();

  headCount(count: number) {
    return count === 1 ? '1 person' : `${count} people`;
  }

  connect(connection: Connection) {
    const edge = createEdge<Relation>(
      relation(crypto.randomUUID(), connection.source, connection.target, { label: 'reviews' }),
    );
    this.edges.update((edges) => addEdges([edge], { nodes: this.nodes, edges }));
  }

  /** Delete removes the selected connections; people and teams stay. */
  remove({ edgeIds }: DeleteRequest) {
    this.edges.set(removeElements({ edgeIds }, { nodes: this.nodes, edges: this.edges() }).edges);
  }

  /** A person may leave its team while dragged; the drop decides the new team. */
  dragStart({ nodes }: NodeDragEvent) {
    for (const node of this.movedPeople(nodes)) {
      this.origins.set(node.id, { parentId: node.parentId()!, point: node.point() });
      node.extent.set(null);
    }
  }

  drag({ node }: NodeDragEvent) {
    if (!this.isPerson(node.id)) return this.dropTarget.set(null);
    const team = this.teamUnder(node.id) ?? this.node(node.id).parentId()!;
    this.dropTarget.set({ team, state: this.landing(node.id, team) ? 'ok' : 'full' });
  }

  /** Moves each dropped person to a free spot of the team under its center; without room, back where it was. */
  dragEnd({ nodes }: NodeDragEvent) {
    for (const node of this.movedPeople(nodes)) {
      const origin = this.origins.get(node.id)!;
      const team = this.teamUnder(node.id) ?? origin.parentId;
      const spot = this.landing(node.id, team);
      node.parentId.set(spot ? team : origin.parentId);
      node.point.set(spot ?? origin.point);
      node.extent.set('parent');
    }
    this.origins.clear();
    this.dropTarget.set(null);
  }

  /** The free spot of a team nearest to where the person is, clear of the header, the border and other members. */
  private landing(id: string, teamId: string): Point | null {
    const flow = this.flow()!;
    const box = flow.getNodeRect(teamId)!;
    const rect = flow.getNodeRect(id)!;
    const others = this.nodes
      .filter((node) => node.id !== id && node.parentId() === teamId)
      .map((node) => flow.getNodeRect(node.id))
      .filter((other) => !!other)
      .map((other) => ({ ...other, x: other.x - box.x, y: other.y - box.y }));
    const min = { x: LAYOUT.inset, y: LAYOUT.header };
    const max = { x: box.width - rect.width - LAYOUT.inset, y: box.height - rect.height - LAYOUT.inset };
    const wanted = { x: rect.x - box.x, y: rect.y - box.y };
    const free = (x: number, y: number) =>
      others.every(
        (other) =>
          x + rect.width + LAYOUT.gap <= other.x ||
          other.x + other.width + LAYOUT.gap <= x ||
          y + rect.height + LAYOUT.gap <= other.y ||
          other.y + other.height + LAYOUT.gap <= y,
      );
    // A grid over the team, plus the spots right next to each member, so a gap exactly one card wide is found too.
    const axis = (from: number, to: number, near: number[]) => {
      const values = new Set([from, to, ...near]);
      for (let value = from; value <= to; value += LAYOUT.step) values.add(value);
      return [...values].filter((value) => value >= from && value <= to);
    };
    const xs = axis(
      min.x,
      max.x,
      others.flatMap((o) => [o.x + o.width + LAYOUT.gap, o.x - rect.width - LAYOUT.gap]),
    );
    const ys = axis(
      min.y,
      max.y,
      others.flatMap((o) => [o.y + o.height + LAYOUT.gap, o.y - rect.height - LAYOUT.gap]),
    );
    let best: Point | null = null;
    let distance = Infinity;
    for (const y of ys) {
      for (const x of xs) {
        const d = Math.hypot(x - wanted.x, y - wanted.y);
        if (d < distance && free(x, y)) {
          best = { x, y };
          distance = d;
        }
      }
    }
    return best;
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
    return this.node(id)?.data().kind === 'person';
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
  color: string,
  reviews: number,
) {
  return {
    id,
    point,
    parentId,
    ariaLabel: name,
    data: { kind: 'person' as const, name, role, initials, color, reviews },
  };
}

/** Floating edges: every end meets its node on the side facing the other end. */
function relation(id: string, source: string, target: string, data: Relation) {
  return {
    id,
    source,
    target,
    curve: 'bezier' as const,
    markers: data.mutual || data.link ? {} : { end: {} },
    data,
  };
}
