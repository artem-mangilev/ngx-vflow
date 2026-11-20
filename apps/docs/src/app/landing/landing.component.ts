import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  makeStateKey,
  signal,
  StateKey,
  TransferState,
  Type,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideDynamicIcon, LucideGroup, LucideIcon, LucideNetwork, LucidePalette, LucideRoute } from '@lucide/angular';
import { NgDocCodeComponent, NgDocCodeHighlighterDirective, NgDocHighlighterService } from '@ng-doc/app';
import { provideVflow, withSettings } from 'ngx-vflow';
import { timeout } from 'rxjs';
import { AllFeaturesDemoComponent } from '../categories/examples/feature-overview/demo/all-features-demo.component';
import { SHOWCASE_PROJECTS } from '../showcase/projects';
import { FirstFlowComponent } from './first-flow.component';
import { HeroFlowComponent } from './hero-flow.component';
import { ServiceNodeFlowComponent } from './service-node-flow.component';

interface Feature {
  title: string;
  text: string;
  link: string;
  linkText: string;
  /** What the live flow next to the text is, for assistive technology. */
  demoLabel: string;
  demo: Type<unknown>;
  /** The height of the demo as a utility: the frame has it before the flow is created, so the swap moves nothing. */
  demoHeight: string;
  /** Source shown under the flow, where the amount of code is the point. */
  code?: { caption: string; text: string };
  /** The flow takes the whole column, under the text: for a scene too large for a half of it. */
  wide?: boolean;
}

interface PackageTile {
  name: string;
  text: string;
  link: string;
  icon: LucideIcon;
}

interface Stat {
  value: string;
  label: string;
  link?: string;
}

const INSTALL_COMMAND = 'npm i ngx-vflow';
/** The numbers of the prerendered page, on their way from the build to the browser. */
const STARS = makeStateKey<string>('landing.stars');
const DOWNLOADS = makeStateKey<string>('landing.downloads');
/** A service that does not answer in this time has no number: the prerender of the page does not wait longer. */
const STATS_TIMEOUT = 5000;
/** Holds the line of a number that is still loading. */
const LOADING = '\u00a0';

/** The template of `FirstFlowComponent` without its CSS classes, the zoom buttons and the initial `fitView()`. */
const FIRST_FLOW_TEMPLATE = `<vflow [nodes]="nodes" [edges]="edges()" (connect)="connect($event)">
  <div *vNode="let ctx of nodes">
    <span vHandle handleType="target" position="left"></span>
    {{ ctx.data().label }}
    <span vHandle handleType="source" position="right"></span>
  </div>

  <svg:g *vEdge="let ctx" vEdgeInteractionArea>
    <svg:path [attr.d]="ctx.path()" />
  </svg:g>
</vflow>`;

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgComponentOutlet,
    NgTemplateOutlet,
    RouterLink,
    NgDocCodeComponent,
    NgDocCodeHighlighterDirective,
    LucideDynamicIcon,
    HeroFlowComponent,
  ],
  // The wheel over a flow scrolls the page; a flow below the hero is zoomed with its buttons.
  providers: [provideVflow(withSettings({ zoomOnScroll: false, zoomOnPinch: false }))],
})
export class LandingComponent {
  protected readonly installCommand = INSTALL_COMMAND;
  /**
   * Whether the code can be highlighted. The highlighter is loaded when the code block comes into view; until then the
   * code is shown plain in a block of the same size.
   */
  protected readonly highlighted = inject(NgDocHighlighterService).ready;
  protected readonly projects = SHOWCASE_PROJECTS;

  protected readonly features: Feature[] = [
    {
      title: 'Simple initial setup',
      text: 'One package and one short template make a working editor. Dragging, panning, zooming, selection, connecting handles and keyboard navigation all come from the core library.',
      link: '/docs/getting-started/quickstart',
      linkText: 'Read the quickstart',
      demoLabel: 'Live flow from the quickstart: three nodes you can drag and connect',
      demo: FirstFlowComponent,
      demoHeight: 'h-80',
      code: {
        caption: 'The template of this flow, without its CSS classes and zoom buttons',
        text: FIRST_FLOW_TEMPLATE,
      },
    },
    {
      title: 'A node belongs to you',
      text: 'A node is an Angular template or component: your HTML, your CSS, your data.',
      link: '/docs/nodes/custom-nodes',
      linkText: 'Read about custom nodes',
      demoLabel: 'Live flow: one node that shows a service; add or remove a replica',
      demo: ServiceNodeFlowComponent,
      demoHeight: 'h-90',
    },
    {
      title: 'The parts of an editor are included',
      text: 'A minimap, background patterns, a node toolbar, a resizer, alignment guides, snapping to a grid, a selection box and keyboard shortcuts come with the core package. Each is opt-in.',
      link: '/examples/feature-overview',
      linkText: 'Open this example with its code',
      demoLabel: 'Live flow: a small order workflow with notes that point at the toolbar, a group and the edges',
      demo: AllFeaturesDemoComponent,
      demoHeight: 'h-130',
      wide: true,
    },
  ];

  protected readonly packages: PackageTile[] = [
    {
      name: '@vflow/ui',
      text: 'Node cards, ports, groups and edges with light and dark themes, copied into your workspace.',
      link: '/packages/ui/overview',
      icon: LucidePalette,
    },
    {
      name: '@vflow/layout',
      text: 'Automatic layout with dagre, ELK and d3 behind one function.',
      link: '/packages/layout',
      icon: LucideNetwork,
    },
    {
      name: '@vflow/routing',
      text: 'Edges that find their way around nodes.',
      link: '/packages/routing',
      icon: LucideRoute,
    },
    {
      name: '@vflow/auto-size',
      text: 'Parent nodes that grow around their children while you drag.',
      link: '/packages/auto-size',
      icon: LucideGroup,
    },
  ];

  /** Stars of the repository and downloads of the last month: `undefined` while loading, `null` when that failed. */
  private readonly stars = signal<string | null | undefined>(undefined);
  private readonly downloads = signal<string | null | undefined>(undefined);

  /** The band under the hero; a number that could not be loaded is not shown. */
  protected readonly stats = computed<Stat[]>(() => {
    const loaded = (value: string | null | undefined, label: string, link: string): Stat[] =>
      value === null ? [] : [{ value: value ?? LOADING, label, link }];

    return [
      ...loaded(this.stars(), 'GitHub stars', 'https://github.com/artem-mangilev/ngx-vflow'),
      ...loaded(this.downloads(), 'Downloads a month', 'https://www.npmjs.com/package/ngx-vflow'),
      { value: 'MIT', label: 'License' },
    ];
  });
  protected readonly copied = signal(false);

  constructor() {
    const http = inject(HttpClient);
    const state = inject(TransferState);
    const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
    // The build asks while it prerenders the page and hands the numbers to the browser with the page, so a reader
    // asks neither service. The browser asks only where the page was not prerendered, or the build got no answer.
    // The numbers are handed over by hand: Angular does not carry over a response that sets a cookie, as npm's does.
    const load = (
      url: string,
      pick: (body: Record<string, unknown>) => unknown,
      target: typeof this.stars,
      key: StateKey<string>,
    ) => {
      const prerendered = state.get(key, null);

      if (prerendered !== null) return target.set(prerendered);

      http
        .get<Record<string, unknown>>(url, { transferCache: false })
        .pipe(timeout(STATS_TIMEOUT), takeUntilDestroyed())
        .subscribe({
          next: (body) => {
            const value = pick(body);
            const text = typeof value === 'number' ? compact.format(value) : null;

            target.set(text);
            if (text !== null) state.set(key, text);
          },
          error: () => target.set(null),
        });
    };

    load(
      'https://api.github.com/repos/artem-mangilev/ngx-vflow',
      (body) => body['stargazers_count'],
      this.stars,
      STARS,
    );
    load(
      'https://api.npmjs.org/downloads/point/last-month/ngx-vflow',
      (body) => body['downloads'],
      this.downloads,
      DOWNLOADS,
    );
  }

  protected copyInstallCommand(): void {
    navigator.clipboard?.writeText(INSTALL_COMMAND).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
