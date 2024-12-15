import {
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import * as d3 from 'd3-force';
import {
  DynamicNode,
  Edge,
  VflowComponent,
  VflowModule,
} from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  templateUrl: './force-layout-demo.component.html',
  styleUrls: ['./force-layout-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [VflowModule],
})
export class ForceLayoutDemoComponent {
  vflow = viewChild.required(VflowComponent);

  protected nodes: DynamicNode[] = [
    {
      id: '0',
      point: signal({ x: 0, y: 0 }),
      type: 'html-template',
      data: signal(randomHex()),
      draggable: signal(false),
    },
    {
      id: '1',
      point: signal({ x: 0, y: 0 }),
      type: 'html-template',
      data: signal(randomHex()),
      draggable: signal(false),
    },
    {
      id: '2',
      point: signal({ x: 0, y: 0 }),
      type: 'html-template',
      data: signal(randomHex()),
      draggable: signal(false),
    },
    {
      id: '3',
      point: signal({ x: 0, y: 0 }),
      type: 'html-template',
      data: signal(randomHex()),
      draggable: signal(false),
    },
    {
      id: '4',
      point: signal({ x: 0, y: 0 }),
      type: 'html-template',
      data: signal(randomHex()),
      draggable: signal(false),
    },
    {
      id: '5',
      point: signal({ x: 0, y: 0 }),
      type: 'html-template',
      data: signal(randomHex()),
      draggable: signal(false),
    },
  ];

  protected edges: Edge[] = [
    {
      source: '0',
      target: '1',
      id: '0 -> 1',
    },
    {
      source: '0',
      target: '2',
      id: '0 -> 2',
    },
    {
      source: '0',
      target: '3',
      id: '0 -> 3',
    },
    {
      source: '0',
      target: '4',
      id: '0 -> 4',
    },
    {
      source: '0',
      target: '5',
      id: '0 -> 5',
    },
  ];

  // d3-force internally reads/writes to x and y properties
  // so to link d3-force state with ngx-vflow state, we just
  // proxy these properties to point signal
  private simulationNodes = this.nodes.map((n) => {
    return {
      id: n.id,

      get x() {
        return n.point().x;
      },

      set x(x: number) {
        n.point.update((state) => ({ ...state, x }));
      },

      get y() {
        return n.point().y;
      },

      set y(y: number) {
        n.point.update((state) => ({ ...state, y }));
      },
    };
  });

  private linkForce = d3
    .forceLink(this.edges.map((e) => ({ source: e.source, target: e.target })))
    // @ts-ignore
    .id((d) => d.id)
    .distance(50);

  private simulation = d3
    .forceSimulation()
    .force('charge', d3.forceManyBody().strength(-100))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    // center of viewport
    .force('center', d3.forceCenter(200, 200))
    .nodes(this.simulationNodes)
    .force('link', this.linkForce);

  protected onDistanceChange(event: Event) {
    const distance = +(event.target as HTMLInputElement).value;

    this.linkForce.distance(distance);
    this.simulation.alpha(0.5).restart();

    setTimeout(() => {
      this.vflow().fitView({ duration: 500 });
    }, 250);
  }
}

function randomHex() {
  const hexValues = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];

  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * hexValues.length);
    hex += hexValues[index];
  }

  return hex;
}
