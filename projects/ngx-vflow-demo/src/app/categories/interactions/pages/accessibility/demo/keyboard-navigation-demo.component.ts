import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Vflow, createEdges, createNodes } from 'ngx-vflow';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="keyboard-demo" aria-label="Keyboard navigation example">
      <p>Use Tab to visit objects, Enter to select, and arrow keys to move selected nodes.</p>
      <label><input type="checkbox" [checked]="grid()" (change)="grid.set(!grid())" /> Snap to grid</label>
      <label
        ><input type="checkbox" [checked]="autoPan()" (change)="autoPan.set(!autoPan())" /> Pan on node focus</label
      >
      <label
        ><input type="checkbox" [checked]="manual()" (change)="manual.set(!manual())" /> Application owns
        selection</label
      >
      <p>Selected: {{ selected() || 'none' }}</p>
      <button type="button">Before graph</button>
      <vflow
        [nodes]="nodes()"
        [edges]="edges()"
        [view]="[600, 300]"
        [snapGrid]="grid() ? [20, 20] : [1, 1]"
        [autoPan]="false"
        [autoPanOnNodeFocus]="autoPan()"
        [selectionMode]="manual() ? 'manual' : 'default'"
        [optimization]="{ detachedGroupsLayer: true }"
        [ariaLabelConfig]="{ flowLabel: 'Keyboard graph' }">
        <ng-template nodeHtml>
          <div class="editor">
            <label>Node title <input aria-label="Node title" vflowNoDrag /></label>
            <button type="button" vflowNoDrag (click)="removeEditor()">Remove editor</button>
            <handle type="target" position="left" />
          </div>
        </ng-template>
        <ng-template let-context edge>
          <svg:g customTemplateEdge selectable>
            <svg:path aria-hidden="true" fill="none" stroke="#345" stroke-width="2" [attr.d]="context.path()" />
          </svg:g>
        </ng-template>
      </vflow>
      <button type="button">After graph</button>
    </section>
  `,
  styles: `
    section {
      background: white;
      color: #1b262c;
      padding: 12px;
      overflow: auto;
    }
    label {
      display: inline-flex;
      gap: 6px;
      margin: 6px;
      align-items: center;
    }
    button,
    input {
      font: inherit;
    }
    button {
      padding: 6px 10px;
    }
    .editor {
      position: relative;
      width: 220px;
      border: 1px solid #345;
      border-radius: 6px;
      padding: 8px;
    }
    .editor label {
      display: block;
      margin: 0 0 8px;
    }
    .editor input {
      display: block;
      width: 100%;
      min-width: 0;
    }
  `,
})
export class KeyboardNavigationDemoComponent {
  protected grid = signal(false);
  protected autoPan = signal(true);
  protected manual = signal(false);
  protected nodes = signal(
    createNodes([
      { id: 'draft', type: 'default', parentId: 'stage', point: { x: 20, y: 30 }, text: 'Draft' },
      {
        id: 'stage',
        type: 'default-group',
        point: { x: 20, y: 20 },
        width: 260,
        height: 180,
        ariaLabel: 'Stage',
        selectable: false,
        draggable: false,
      },
      {
        id: 'decoration',
        type: 'default',
        point: { x: 20, y: 240 },
        text: 'Decoration',
        focusable: false,
        selectable: false,
      },
      { id: 'editor', type: 'html-template', point: { x: 330, y: 40 }, ariaLabel: 'Editor' },
      { id: 'later', type: 'default', point: { x: 1000, y: 80 }, text: 'Later', width: 100, height: 50 },
    ]),
  );
  protected edges = signal(
    createEdges([
      { id: 'next', source: 'draft', target: 'later', ariaLabel: 'Next step' },
      { id: 'edit', source: 'draft', target: 'editor', ariaLabel: 'Edit route', type: 'template' },
    ]),
  );
  protected selected = computed(() =>
    [...this.nodes(), ...this.edges()]
      .filter((entity) => entity.selected())
      .map((entity) => entity.id)
      .join(', '),
  );

  protected removeEditor() {
    this.nodes.update((nodes) => nodes.filter((node) => node.id !== 'editor'));
    this.edges.update((edges) => edges.filter((edge) => edge.source !== 'editor' && edge.target !== 'editor'));
  }
}
