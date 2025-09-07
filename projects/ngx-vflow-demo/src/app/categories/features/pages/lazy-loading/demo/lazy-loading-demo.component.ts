import { ChangeDetectionStrategy, Component, effect, signal, untracked, viewChild } from '@angular/core';
import { Edge, Node, Vflow, VflowComponent } from 'ngx-vflow';

@Component({
  template: `
    <button (click)="nextNode()">Go To Next Node</button>

    <vflow view="auto" [nodes]="nodes" [edges]="edges" [optimization]="{ lazyLoadTrigger: 'viewport' }" />
  `,
  styleUrls: ['./lazy-loading-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Vflow],
})
export class LazyLoadingDemoComponent {
  protected vflow = viewChild.required(VflowComponent);

  public nodes: Node[] = [
    {
      id: '1',
      point: { x: 10, y: 150 },
      type: () => import('./components/node-a.component').then((m) => m.NodeAComponent),
      width: 150,
      height: 100,
    },
    {
      id: '2',
      point: { x: 1000, y: 150 },
      type: () => import('./components/node-b.component').then((m) => m.NodeBComponent),
      width: 150,
      height: 100,
    },
    {
      id: '3',
      point: { x: 2000, y: 150 },
      type: () => import('./components/node-c.component').then((m) => m.NodeCComponent),
      width: 150,
      height: 100,
    },
  ];

  public edges: Edge[] = [
    {
      id: '1 -> 2',
      source: '1',
      target: '2',
    },
    {
      id: '2 -> 3',
      source: '2',
      target: '3',
    },
  ];

  private currentNode = signal(this.nodes[0]);

  constructor() {
    effect(() => {
      if (this.vflow().initialized()) {
        const currentNode = this.currentNode();
        untracked(() => this.vflow().fitView({ nodes: [currentNode.id], duration: 800 }));
      }
    });
  }

  nextNode() {
    this.currentNode.update((current) => {
      const nextIndex = (this.nodes.indexOf(current) + 1) % this.nodes.length;
      return this.nodes[nextIndex];
    });
  }
}
