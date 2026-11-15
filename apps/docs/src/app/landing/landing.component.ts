import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, Type } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgDocCodeComponent, NgDocCodeHighlighterDirective } from '@ng-doc/app';
import { FirstFlowComponent } from '../categories/docs/getting-started/quickstart/demo/first-flow.component';
import { AllFeaturesDemoComponent } from '../categories/examples/feature-overview/demo/all-features-demo.component';
import { SHOWCASE_PROJECTS } from '../showcase/projects';
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
  /** Source shown under the flow, where the amount of code is the point. */
  code?: { caption: string; text: string };
  /** The flow takes the whole column, under the text: for a scene too large for a half of it. */
  wide?: boolean;
}

interface PackageRow {
  name: string;
  text: string;
  link: string;
}

const INSTALL_COMMAND = 'npm i ngx-vflow';

/** The template of `FirstFlowComponent` without its CSS classes and the initial `fitView()`. */
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
  imports: [NgComponentOutlet, RouterLink, NgDocCodeComponent, NgDocCodeHighlighterDirective, HeroFlowComponent],
})
export class LandingComponent {
  protected readonly installCommand = INSTALL_COMMAND;
  protected readonly projects = SHOWCASE_PROJECTS;

  protected readonly features: Feature[] = [
    {
      title: 'Comes with reasonable defaults for your editor',
      text: 'Dragging nodes, panning, zooming, selection, connecting handles and keyboard navigation are set up before you write a line. A working editor is one component with a short template, and you configure only what yours does differently.',
      link: '/docs/getting-started/quickstart',
      linkText: 'Read the quickstart',
      demoLabel: 'Live flow from the quickstart: three nodes you can drag and connect',
      demo: FirstFlowComponent,
      code: { caption: 'The template of this flow, without its CSS classes', text: FIRST_FLOW_TEMPLATE },
    },
    {
      title: 'A node is your own template',
      text: 'The library ships no node card. A node renders through an Angular template or component, so it is plain HTML and CSS with your own content inside, and signals for its state. This one is a service with a status, a chart and a control.',
      link: '/docs/nodes/custom-nodes',
      linkText: 'Read about custom nodes',
      demoLabel: 'Live flow: one node that shows a service; add or remove a replica',
      demo: ServiceNodeFlowComponent,
    },
    {
      title: 'The parts of an editor are included',
      text: 'A minimap, background patterns, a node toolbar, a resizer, alignment guides, snapping to a grid, a selection box and keyboard shortcuts come with the core package. Each is opt-in.',
      link: '/examples/feature-overview',
      linkText: 'Open this example with its code',
      demoLabel: 'Live flow with a minimap, a resizable node, a node toolbar and alignment guides',
      demo: AllFeaturesDemoComponent,
      wide: true,
    },
  ];

  protected readonly packages: PackageRow[] = [
    {
      name: '@vflow/ui',
      text: 'Node cards, ports, groups and edges with light and dark themes, copied into your workspace.',
      link: '/packages/ui/overview',
    },
    {
      name: '@vflow/layout',
      text: 'Automatic layout with dagre, ELK and d3 behind one function.',
      link: '/packages/layout',
    },
    {
      name: '@vflow/routing',
      text: 'Edges that find their way around nodes.',
      link: '/packages/routing',
    },
    {
      name: '@vflow/auto-size',
      text: 'Parent nodes that grow around their children while you drag.',
      link: '/packages/auto-size',
    },
  ];

  /** Stars of the repository and downloads of the last month; a number that could not be loaded is not shown. */
  protected readonly stars = signal<string | null>(null);
  protected readonly downloads = signal<string | null>(null);
  protected readonly copied = signal(false);

  constructor() {
    const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
    const load = (url: string, pick: (body: Record<string, unknown>) => unknown, target: typeof this.stars) =>
      fetch(url)
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((body) => {
          const value = pick(body);

          if (typeof value === 'number') target.set(compact.format(value));
        })
        .catch(() => undefined);

    load('https://api.github.com/repos/artem-mangilev/ngx-vflow', (body) => body['stargazers_count'], this.stars);
    load('https://api.npmjs.org/downloads/point/last-month/ngx-vflow', (body) => body['downloads'], this.downloads);
  }

  protected copyInstallCommand(): void {
    navigator.clipboard?.writeText(INSTALL_COMMAND).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
