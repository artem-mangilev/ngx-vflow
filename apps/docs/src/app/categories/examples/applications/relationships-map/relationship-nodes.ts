import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';
import { DocsNodeIcon } from '@docs/shared';
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
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Drop feedback is the application's: the team under a dragged person, or a team without room. A nested team sits
  // a step darker than its parent. The utilities are important because they replace colors the group part sets.
  template: `
    <div
      vuiGroup
      class="text-[14px] transition-colors data-[drop-target=full]:border-vui-danger! data-[drop-target=ok]:border-vui-accent! data-[drop-target=ok]:bg-[color-mix(in_oklab,var(--vui-surface-muted),var(--vui-accent)_10%)]!"
      [class]="
        ctx.node.parentId?.() ? 'bg-[color-mix(in_oklab,var(--vui-surface-muted),var(--vui-foreground)_4%)]!' : ''
      "
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
  private readonly board = inject(TeamBoard);

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
  imports: [Vflow, Vui, DocsNodeIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let person = ctx.data();
    <article
      vuiNode
      vHandle
      handleType="any"
      position="auto"
      class="w-[170px] text-[14px] data-[v-handle-state=valid]:outline-2 data-[v-handle-state=valid]:outline-offset-2 data-[v-handle-state=valid]:outline-vui-accent"
      data-testid="person">
      <header vuiNodeHeader vDragHandle class="cursor-grab">
        <!-- The slot centers the 28px avatar on the first line of the name. -->
        <span docsNodeIcon>
          <svg
            class="block size-7 rounded-full"
            viewBox="0 0 28 28"
            role="img"
            data-testid="avatar"
            [attr.aria-label]="'Avatar of ' + person.name">
            <circle cx="14" cy="14" r="14" [attr.fill]="person.color" />
            <text x="14" y="18" text-anchor="middle" fill="white" font-size="11" font-weight="600">
              {{ person.initials }}
            </text>
          </svg>
        </span>
        <span vuiTitle>{{ person.name }}</span>
      </header>
      <div class="cursor-crosshair p-vui-3" data-testid="body">
        <p vuiMeta>{{ person.role }}, {{ person.reviews }} reviews this month</p>
        <!-- Neutral: the accent belongs to selection. -->
        <div
          class="h-1.5 overflow-hidden rounded-full bg-vui-surface-muted"
          role="img"
          [attr.aria-label]="person.reviews + ' of 20 reviews'">
          <span class="block h-full bg-vui-muted" [style.width.%]="person.reviews * 5"></span>
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
  imports: [Vflow, Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let metric = ctx.data();
    <article vuiNode class="w-[170px] text-[14px]">
      <header vuiNodeHeader>
        <span vuiTitle>{{ metric.title }}</span>
      </header>
      <div class="p-vui-3">
        <div class="text-xl font-semibold tabular-nums">{{ metric.value }}</div>
        <p vuiMeta>{{ metric.delta }}</p>
        <div class="mt-1.5 flex h-7 items-end gap-0.5" role="img" aria-label="Weekly trend, rising">
          @for (point of metric.series; track $index) {
            <span class="flex-1 rounded-[1px] bg-vui-muted" [style.height.%]="point"></span>
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
  imports: [Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The yellow of a sticky note is its content, so it replaces the colors of the card in both themes.
  template: `
    <article
      vuiNode
      class="w-45 border-yellow-300! bg-yellow-100! text-[14px] text-yellow-900! dark:border-yellow-700! dark:bg-[#3f3b1f]! dark:text-yellow-200!"
      data-testid="note">
      <div class="p-vui-3">{{ ctx.data().text }}</div>
    </article>
  `,
})
export class NoteNodeComponent {
  protected readonly ctx = injectNode<Note>();
}
