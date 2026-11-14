import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

export interface Person {
  name: string;
  role: string;
  initials: string;
  /** Avatar fill, chosen for 4.5:1 with the white initials. */
  color: string;
  reviews: number;
}
export interface Metric {
  title: string;
  value: string;
  delta: string;
  series: number[];
}
export interface Note {
  text: string;
}
export interface Team {
  title: string;
}

export type DropTarget = { team: string; state: 'ok' | 'full' };

/**
 * What a team shows about the whole map. The demo provides itself under this token: a component node is created
 * inside the flow, so it injects what its host component provides.
 */
export abstract class TeamBoard {
  /** The team under the dragged person, and whether it has room. */
  abstract readonly dropTarget: Signal<DropTarget | null>;
  /** Head count of every team, nested teams included. */
  abstract readonly members: Signal<Map<string, number>>;
}

/** A team is a group: selecting it shows its resize controls; core keeps the children inside while it shrinks. */
@Component({
  selector: 'app-team-node',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .team {
      --vui-space: 4px;
      font-size: 14px;
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
  `,
  template: `
    <div
      vuiGroup
      class="team"
      [class.nested]="!!ctx.node.parentId?.()"
      [attr.data-team]="ctx.node.id"
      [attr.data-drop-target]="dropTarget()"
      [vResizable]="ctx.selected()"
      [minWidth]="240"
      [minHeight]="120">
      <header vuiGroupHeader>
        <span vuiTitle>{{ ctx.data().title }}</span>
        <span vuiMeta data-testid="members">{{ headCount() }}</span>
      </header>
      <!-- The group has its own connections, which float to the side facing the other end. -->
      <span vHandle handleType="any" position="auto" [canStart]="false" [canAccept]="false"></span>
    </div>
  `,
})
export class TeamNodeComponent {
  protected readonly ctx = injectNode<Team>();
  private board = inject(TeamBoard);

  protected readonly dropTarget = computed(() => {
    const target = this.board.dropTarget();
    return target?.team === this.ctx.node.id ? target.state : null;
  });

  protected readonly headCount = computed(() => {
    const count = this.board.members().get(this.ctx.node.id) ?? 0;
    return count === 1 ? '1 person' : `${count} people`;
  });
}

/** The card is the handle: the name row drags the person, the rest starts or accepts a connection. */
@Component({
  selector: 'app-person-node',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .person {
      width: 170px;
      font-size: 14px;
    }
    .person header {
      cursor: grab;
    }
    .person .node-body {
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
  `,
  template: `
    @let person = ctx.data();
    <article vuiNode vHandle handleType="any" position="auto" class="person">
      <header vuiNodeHeader vDragHandle>
        <!-- The slot centers the 28px avatar on the first line of the name. -->
        <span class="node-icon">
          <svg class="avatar" viewBox="0 0 28 28" role="img" [attr.aria-label]="'Avatar of ' + person.name">
            <circle cx="14" cy="14" r="14" [attr.fill]="person.color" />
            <text x="14" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">
              {{ person.initials }}
            </text>
          </svg>
        </span>
        <span vuiTitle>{{ person.name }}</span>
      </header>
      <div class="node-body">
        <p vuiMeta>{{ person.role }}, {{ person.reviews }} reviews this month</p>
        <div class="meter" role="img" [attr.aria-label]="person.reviews + ' of 20 reviews'">
          <span [style.width.%]="person.reviews * 5"></span>
        </div>
      </div>
    </article>
  `,
})
export class PersonNodeComponent {
  protected readonly ctx = injectNode<Person>();
}

/** A metric takes part in the graph only through the dashed link to its team. */
@Component({
  selector: 'app-metric-node',
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .metric {
      width: 170px;
      font-size: 14px;
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
  `,
  template: `
    @let metric = ctx.data();
    <article vuiNode class="metric">
      <header vuiNodeHeader>
        <span vuiTitle>{{ metric.title }}</span>
      </header>
      <div class="node-body">
        <div class="value">{{ metric.value }}</div>
        <p vuiMeta>{{ metric.delta }}</p>
        <div class="spark" role="img" aria-label="Weekly trend, rising">
          @for (point of metric.series; track $index) {
            <span [style.height.%]="point"></span>
          }
        </div>
      </div>
      <span vHandle handleType="any" position="auto" [canStart]="false" [canAccept]="false"></span>
    </article>
  `,
})
export class MetricNodeComponent {
  protected readonly ctx = injectNode<Metric>();
}

/** A note has no handle: it is content on the canvas, not a participant of the graph. */
@Component({
  selector: 'app-note-node',
  imports: [Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .note {
      width: 180px;
      font-size: 14px;
      background: #fef9c3;
      color: #713f12;
      border-color: #fde047;
    }
    :host-context([data-vui-theme='dark']) .note {
      background: #3f3b1f;
      color: #fef08a;
      border-color: #a16207;
    }
  `,
  template: `
    <article vuiNode class="note">
      <div class="node-body">{{ ctx.data().text }}</div>
    </article>
  `,
})
export class NoteNodeComponent {
  protected readonly ctx = injectNode<Note>();
}
