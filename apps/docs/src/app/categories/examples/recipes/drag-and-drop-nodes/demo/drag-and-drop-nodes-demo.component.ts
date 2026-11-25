import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { DndDropEvent, DndModule } from 'ngx-drag-drop';
import {
  Connection,
  Node,
  Vflow,
  VflowComponent,
  addEdges,
  addNodes,
  createEdges,
  createNodes,
  reparentNodes,
} from 'ngx-vflow';

interface PaletteNodeData {
  text: string;
  /** Containers are marked in application data; the flow itself has no group node type. */
  type?: 'group';
  /** The group under a node that has no parent: the toolbar of the node offers to attach it there. */
  groupUnder?: string;
}

type PaletteNode = Node<PaletteNodeData>;

const isGroup = (node: PaletteNode) => node.data?.().type === 'group';

@Component({
  template: `
    <aside
      class="flex w-36 flex-none flex-col gap-vui-2 border-0 border-r border-solid border-vui-border bg-vui-surface p-vui-3">
      <p class="m-0 text-xs text-vui-muted">Drag onto the canvas</p>
      @for (kind of palette; track kind) {
        <div vuiNode class="cursor-grab px-vui-3 py-vui-2 text-[13px]" [dndDraggable]="kind">{{ kind }}</div>
      }
    </aside>

    <div class="min-w-0 flex-1">
      <vflow
        dndDropzone
        [nodes]="nodes()"
        [edges]="edges()"
        (initialized)="flow().fitView({ maxZoom: 1 })"
        (dndDrop)="createNode($event)"
        (connect)="connect($event)"
        (nodesChanges.position)="findGroupsUnderNodes()">
        <ng-template let-ctx vNode [vNodeOf]="nodes()">
          <docs-node [ctx]="ctx" />

          @if (ctx.node.parentId?.()) {
            <v-node-toolbar>
              <div vuiToolbar>
                <button docsButton="plain" small type="button" (click)="detach(ctx.node)">Detach</button>
              </div>
            </v-node-toolbar>
          } @else if (ctx.data().groupUnder; as groupId) {
            <v-node-toolbar>
              <div vuiToolbar>
                <button docsButton="plain" small type="button" (click)="attach(ctx.node, groupId)">Attach</button>
              </div>
            </v-node-toolbar>
          }
        </ng-template>

        <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
      </vflow>
    </div>
  `,
  host: { class: 'flex size-full text-vui-foreground' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocsKit, DocsPresentations, Vflow, Vui, DndModule],
})
export class DragAndDropNodesDemoComponent {
  protected readonly flow = viewChild.required<VflowComponent<PaletteNode>>(VflowComponent);

  protected readonly palette = ['Service', 'Database', 'Queue'];

  protected readonly nodes = signal<PaletteNode[]>(
    createNodes<PaletteNodeData>([
      { id: 'cluster', point: { x: 0, y: 0 }, width: 300, height: 220, data: { text: 'Cluster', type: 'group' } },
      { id: 'api', point: { x: 40, y: 100 }, parentId: 'cluster', data: { text: 'API' } },
      { id: 'cache', point: { x: 380, y: 100 }, data: { text: 'Cache' } },
    ]),
  );

  protected readonly edges = signal(createEdges([{ id: 'api-cache', source: 'api', target: 'cache' }]));

  /** A drop on a group creates the node as its child, at the same place on screen. */
  protected createNode({ event, data }: DndDropEvent): void {
    const flowPoint = this.flow().clientToFlowPosition({ x: event.x, y: event.y });
    const group = this.flow()
      .getNodesAtPoint(flowPoint)
      .find(({ node }) => isGroup(node));

    this.nodes.update((nodes) =>
      addNodes(
        createNodes<PaletteNodeData>([
          {
            id: crypto.randomUUID(),
            point: group?.nodeSpacePoint ?? flowPoint,
            parentId: group?.node.id ?? null,
            data: { text: data },
          },
        ]),
        nodes,
      ),
    );
  }

  protected connect(connection: Connection): void {
    this.edges.update((edges) =>
      addEdges(createEdges([{ id: crypto.randomUUID(), ...connection }]), { nodes: this.nodes(), edges }),
    );
  }

  /** `reparentNodes` keeps the node where it is on screen: it converts the point into the space of the new parent. */
  protected attach(node: PaletteNode, groupId: string): void {
    this.nodes.update((nodes) => reparentNodes([{ id: node.id, parentId: groupId }], nodes));
  }

  protected detach(node: PaletteNode): void {
    const groupUnder = node.parentId?.() ?? undefined;

    this.nodes.update((nodes) => reparentNodes([{ id: node.id, parentId: null }], nodes));
    // The node stays over the group it left, so the toolbar offers to attach it again at once.
    node.data?.update((data) => ({ ...data, groupUnder }));
  }

  /** After a move, every node without a parent remembers the group it overlaps, if any. */
  protected findGroupsUnderNodes(): void {
    for (const node of this.nodes()) {
      if (isGroup(node) || node.parentId?.()) continue;

      const groupUnder = this.flow().getIntersectingNodes(node.id).find(isGroup)?.id;
      if (node.data?.().groupUnder !== groupUnder) node.data?.update((data) => ({ ...data, groupUnder }));
    }
  }
}
