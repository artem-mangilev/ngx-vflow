import { ChangeDetectionStrategy, Component, computed, forwardRef, signal, viewChild } from '@angular/core';
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
  StaticEdge,
  Vflow,
  VflowComponent,
} from 'ngx-vflow';
import { injectDocsTheme } from '../../../shared/docs-theme';
import {
  DropTarget,
  MetricNodeComponent,
  NoteNodeComponent,
  PersonNodeComponent,
  TeamBoard,
  TeamNodeComponent,
} from './relationship-nodes';

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
  // Node components inject the map from here: they are created inside the flow, under this component.
  providers: [{ provide: TeamBoard, useExisting: forwardRef(() => RelationshipsDemoComponent) }],
  styles: `
    vflow {
      height: 560px;
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
        [parentsBelowEdges]="true"
        (connect)="connect($event)"
        (deleteRequest)="remove($event)"
        (nodeDragStart)="dragStart($event)"
        (nodeDrag)="drag($event)"
        (nodeDragEnd)="dragEnd($event)"
        (initialized)="flow()?.fitView()">
        <ng-template let-ctx vEdge>
          <svg:g vEdgeInteractionArea>
            <svg:path
              vuiEdge
              [attr.d]="ctx.path()"
              [attr.marker-end]="ctx.markerEnd()"
              [attr.data-link]="!!ctx.data()?.link" />
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
export class RelationshipsDemoComponent implements TeamBoard {
  readonly flow = viewChild(VflowComponent);
  readonly theme = injectDocsTheme();
  /** Every kind of node is its own component; the demo tells them apart by `component`, not by data. */
  readonly nodes = createNodes([
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
      component: MetricNodeComponent,
      data: {
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
      component: NoteNodeComponent,
      data: { text: 'Q3 focus: fewer handoffs between the two teams.' },
    },
  ]);
  readonly edges = signal<Edge<Relation>[]>(
    createEdges([
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
  readonly dropTarget = signal<DropTarget | null>(null);

  /** Head count of every team, nested teams included: membership is `parentId`, so it follows every move. */
  readonly members = computed(() => {
    const counts = new Map<string, number>();
    for (const node of this.nodes) {
      if (node.component !== PersonNodeComponent) continue;
      for (let id = node.parentId(); id; id = this.node(id).parentId()) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return counts;
  });

  /** Where each dragged person came from, to return there when the drop has no room. */
  private origins = new Map<string, { parentId: string; point: Point }>();

  connect(connection: Connection) {
    const edge = createEdge(relation(crypto.randomUUID(), connection.source, connection.target, { label: 'reviews' }));
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
      .getNodesAtPoint(center)
      .map(({ node }) => node.id)
      .filter((nodeId) => this.node(nodeId).component === TeamNodeComponent)
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
    return this.node(id)?.component === PersonNodeComponent;
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
  return {
    id,
    point,
    width,
    height,
    parentId,
    ariaLabel: `${title} team`,
    component: TeamNodeComponent,
    data: { title },
  };
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
    component: PersonNodeComponent,
    data: { name, role, initials, color, reviews },
  };
}

/** Floating edges: every end meets its node on the side facing the other end. */
function relation(id: string, source: string, target: string, data: Relation): StaticEdge<Relation> {
  return {
    id,
    source,
    target,
    curve: 'bezier',
    markers: data.mutual || data.link ? {} : { end: {} },
    data,
  };
}
