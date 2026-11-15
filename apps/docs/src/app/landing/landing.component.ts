import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, Type, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideVflow, withSettings } from 'ngx-vflow';
import { FirstFlowComponent } from '../categories/docs/getting-started/quickstart/demo/first-flow.component';
import { PipelineDemoComponent } from '../categories/examples/applications/pipeline/pipeline-demo.component';
import { RelationshipsDemoComponent } from '../categories/examples/applications/relationships-map/relationships-demo.component';
import { AllFeaturesDemoComponent } from '../categories/examples/feature-overview/demo/all-features-demo.component';
import { injectDocsTheme } from '../shared/docs-theme';
import { SHOWCASE_PROJECTS } from '../showcase/projects';

interface Feature {
  title: string;
  text: string;
  link: string;
  linkText: string;
  /** What the live flow next to the text is, for assistive technology. */
  demoLabel: string;
  demo: Type<unknown>;
  /** Whether the page draws the frame around the flow; a demo with its own shell needs none. */
  framed: boolean;
}

interface PackageRow {
  name: string;
  text: string;
  link: string;
}

const INSTALL_COMMAND = 'npm i ngx-vflow @angular/cdk';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The flows are created through an outlet, outside the style scope of this component.
  encapsulation: ViewEncapsulation.None,
  imports: [NgComponentOutlet, RouterLink],
  // A wheel over a flow of this page scrolls the page; pinch and the zoom keys still zoom.
  providers: [provideVflow(withSettings({ zoomOnScroll: false }))],
})
export class LandingComponent {
  protected readonly theme = injectDocsTheme();
  protected readonly hero = PipelineDemoComponent;
  protected readonly installCommand = INSTALL_COMMAND;
  protected readonly projects = SHOWCASE_PROJECTS;

  protected readonly features: Feature[] = [
    {
      title: 'The gestures work from the first render',
      text: 'Dragging nodes, panning, zooming, selecting, connecting handles and moving around with the keyboard need no setup. This flow is the whole quickstart: one component and its template.',
      link: '/docs/getting-started/quickstart',
      linkText: 'Follow the quickstart',
      demoLabel: 'Live flow from the quickstart: three nodes you can drag and connect',
      demo: FirstFlowComponent,
      framed: true,
    },
    {
      title: 'A node is your own template',
      text: 'The library ships no node card. A node renders through an Angular template or component, so it is plain HTML and CSS with your own content inside, and signals for its state. Here the nodes are people, teams, a metric and a note.',
      link: '/docs/nodes/custom-nodes',
      linkText: 'Read about custom nodes',
      demoLabel: 'Live flow: people in nested teams, a metric and a note; drag a person onto another team',
      demo: RelationshipsDemoComponent,
      framed: false,
    },
    {
      title: 'The parts of an editor are included',
      text: 'A minimap, background patterns, a node toolbar, a resizer, alignment guides, snapping to a grid, a selection box and keyboard shortcuts come with the core package. Each is opt-in.',
      link: '/examples/feature-overview',
      linkText: 'Open this example with its code',
      demoLabel: 'Live flow with a minimap, a resizable node, a node toolbar and alignment guides',
      demo: AllFeaturesDemoComponent,
      framed: true,
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
