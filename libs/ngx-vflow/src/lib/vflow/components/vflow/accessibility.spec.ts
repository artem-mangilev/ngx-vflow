import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { AriaLabelConfig } from '../../interfaces/aria-label-config.interface';
import { DomAttributes } from '../../interfaces/dom-attributes.interface';
import { provideVflow } from '../../features/feature';
import { withAccessibility } from '../../features/with-accessibility';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideVflow(withAccessibility(() => inject(AccessibilityHostComponent).labels))],
  template: `<vflow [nodes]="nodes" [edges]="edges" style="width: 600px; height: 350px">
    <v-minimap />
    <ng-template vNode>
      <button type="button" vNoDrag (click)="clicks = clicks + 1">Review request</button>
      <span
        vHandle
        handleType="target"
        position="left"
        handleId="incoming"
        [canStart]="canStart()"
        [canAccept]="canAccept()"
        [domAttributes]="{ 'data-port': 'incoming' }"></span>
      <span vHandle handleType="source" position="right"></span>
    </ng-template>
  </vflow>`,
})
class AccessibilityHostComponent {
  labels = signal<Partial<AriaLabelConfig>>({});
  canStart = signal(false);
  canAccept = signal(true);
  clicks = 0;
  nodes = createNodes([
    { id: 'parent', point: { x: 0, y: 0 }, width: 250, height: 200 },
    { id: 'a', parentId: 'parent', point: { x: 20, y: 30 }, ariaLabel: 'Request & review' },
    { id: 'b', point: { x: 350, y: 30 }, ariaLabel: 'Approval' },
  ]);
  edges: Edge[] = createEdges([{ id: 'ab', source: 'a', target: 'b' }]);
}

/** A flow with a parent, its child, a third node, an edge from the child and a minimap, unless `configure` changes it. */
async function setup(configure: (host: AccessibilityHostComponent) => void = () => undefined) {
  TestBed.configureTestingModule({ imports: [AccessibilityHostComponent] });
  const fixture = TestBed.createComponent(AccessibilityHostComponent);
  configure(fixture.componentInstance);
  await render(fixture);
  const root: HTMLElement = fixture.nativeElement;
  return { fixture, host: fixture.componentInstance, root };
}

async function render(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('graph accessibility', () => {
  describe('names and roles', () => {
    it('names the graph region', async () => {
      const { root } = await setup();
      expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Graph');
    });

    it('names a node group by its aria label and describes its role as node', async () => {
      const { root } = await setup();
      const node = root.querySelector('[role="group"][aria-label="Request & review"]')!;
      expect(node.getAttribute('aria-roledescription')).toBe('node');
    });

    it('names a node without an aria label by its id and describes a parent as group', async () => {
      const { root } = await setup();
      const parent = root.querySelector('[role="group"][aria-label="Node parent"]')!;
      expect(parent.getAttribute('aria-roledescription')).toBe('group');
    });

    it('names an edge group by its ends and describes its role as edge', async () => {
      const { root } = await setup();
      const edge = root.querySelector('[role="group"][aria-label="Connection from Request & review to Approval"]')!;
      expect(edge.getAttribute('aria-roledescription')).toBe('edge');
    });

    it('names the minimap as an image outside the tab order', async () => {
      const { root } = await setup();
      const minimap = root.querySelector('[role="img"][aria-label="Graph minimap"]')!;
      expect(minimap.hasAttribute('tabindex')).toBe(false);
    });

    it('makes every node and edge a tab stop', async () => {
      const { root } = await setup();
      expect(Array.from(root.querySelectorAll('[tabindex="0"]')).map((e) => e.getAttribute('aria-label'))).toEqual([
        'Node parent',
        'Request & review',
        'Approval',
        'Connection from Request & review to Approval',
      ]);
    });

    it('describes a child by its parent', async () => {
      const { root } = await setup();
      expect(description(root.querySelector('[aria-label="Request & review"]')!)).toContain('Parent: Node parent.');
    });
  });

  describe('label factories', () => {
    function sparse(host: AccessibilityHostComponent) {
      host.nodes = createNodes([
        { id: 'empty', point: { x: 0, y: 0 }, ariaLabel: '  ' },
        { id: 'custom', point: { x: 250, y: 0 } },
      ]);
      host.edges = createEdges([
        {
          id: 'route',
          source: 'empty',
          target: 'custom',
          ariaLabel: 'Route',
          ariaDescription: 'Review route.',
          domAttributes: { 'data-route': 'sparse' },
        },
      ]);
      host.labels.set({ nodeLabel: (id) => `Узел ${id}`, flowLabel: 'Граф' });
    }

    it('names nodes with a blank or a missing aria label through the node label factory', async () => {
      const { root } = await setup(sparse);
      expect(root.querySelector('[aria-label="Узел empty"]')).not.toBeNull();
      expect(root.querySelector('[aria-label="Узел custom"]')).not.toBeNull();
    });

    it('describes an edge by its own description and its ends', async () => {
      const { root } = await setup(sparse);
      const edge = root.querySelector('[data-route="sparse"]')!;
      expect(edge.getAttribute('role')).toBe('group');
      expect(description(edge)).toContain('Review route. Connection from Узел empty to Узел custom');
    });

    it('updates the aria label of an edge when its signal changes', async () => {
      const { fixture, host, root } = await setup(sparse);
      host.edges[0].ariaLabel!.set('Updated route');
      await render(fixture);
      expect(root.querySelector('[data-route="sparse"]')!.getAttribute('aria-label')).toBe('Updated route');
    });

    it('resets the translations a new configuration leaves out to the defaults', async () => {
      const { fixture, host, root } = await setup(sparse);
      host.labels.set({ nodeLabel: undefined });
      await render(fixture);
      expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Graph');
      expect(root.querySelector('[aria-label="Node empty"]')).not.toBeNull();
      expect(description(root.querySelector('[data-route="sparse"]')!)).toContain(
        'Connection from Node empty to Node custom',
      );
    });
  });

  describe('descriptions', () => {
    function described(host: AccessibilityHostComponent) {
      host.nodes = createNodes([
        { id: 'parent', point: { x: 0, y: 0 }, ariaLabel: 'Processing' },
        {
          id: 'a',
          point: { x: 10, y: 10 },
          parentId: 'parent',
          ariaLabel: 'Application',
          ariaDescription: 'Requires review.',
          selected: true,
          selectable: false,
          draggable: false,
        },
        { id: 'b', point: { x: 350, y: 30 }, ariaLabel: 'Approval' },
      ]);
      host.edges = createEdges([
        { id: 'ab', source: 'a', target: 'b', ariaLabel: 'Approve', ariaDescription: 'Review route.' },
      ]);
    }

    it('combines the own description, the parent, the selection and denied actions of a node', async () => {
      const { root } = await setup(described);
      expect(description(root.querySelector('[aria-label="Application"]')!)).toContain(
        'Requires review. Parent: Processing. Selected. Selection unavailable. Movement unavailable.',
      );
    });

    it('puts no aria-selected or aria-disabled on a selected node that cannot be selected or moved', async () => {
      const { root } = await setup(described);
      const node = root.querySelector('[aria-label="Application"]')!;
      expect(['aria-selected', 'aria-disabled'].filter((name) => node.hasAttribute(name))).toEqual([]);
    });

    it('combines the own description, the ends and the select instruction of an edge', async () => {
      const { root } = await setup(described);
      expect(description(root.querySelector('[aria-label="Approve"]')!)).toContain(
        'Review route. Connection from Application to Approval. Press Enter or Space to select.',
      );
    });

    it('updates the label and the description of a node when their signals change', async () => {
      const { fixture, host, root } = await setup(described);
      const node = root.querySelector('[aria-label="Application"]')!;
      host.nodes[1].ariaLabel!.set('Заявка');
      host.nodes[1].ariaDescription!.set('Требует проверки.');
      await render(fixture);
      expect(node.getAttribute('aria-label')).toBe('Заявка');
      expect(description(node)).toContain('Требует проверки.');
    });

    it('names the ends of an edge by their current labels', async () => {
      const { fixture, host, root } = await setup(described);
      host.nodes[1].ariaLabel!.set('Заявка');
      await render(fixture);
      expect(description(root.querySelector('[aria-label="Approve"]')!)).toContain(
        'Connection from Заявка to Approval',
      );
    });

    it('applies new translations to the region and the descriptions', async () => {
      const { fixture, host, root } = await setup(described);
      host.labels.set({ flowLabel: 'Граф', selected: 'Выбран.', parentDescription: (name) => `Родитель: ${name}.` });
      await render(fixture);
      expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Граф');
      expect(description(root.querySelector('[aria-label="Application"]')!)).toContain(
        'Requires review. Родитель: Processing. Выбран.',
      );
    });
  });

  describe('DOM attributes', () => {
    it('rejects library-owned roles in DomAttributes at compile time', () => {
      // @ts-expect-error Library-owned roles are not public DOM metadata.
      const forbidden: DomAttributes = { role: 'button' };
      expectTypeOf(forbidden).toEqualTypeOf<DomAttributes>();
    });

    const attributes = {
      role: 'button',
      'data-test': 'safe-node',
      title: 'Details',
      lang: 'en',
      dir: 'ltr',
      id: 'hijacked',
      tabindex: 8,
      'aria-label': 'Wrong',
      'aria-hidden': true,
      style: 'display:none',
      onclick: 'alert(1)',
      'data-"bad': 'bad',
      'data-object': {},
    };

    function safe(host: AccessibilityHostComponent) {
      host.nodes = createNodes([
        { id: 'safe', point: { x: 0, y: 0 }, ariaLabel: 'Safe', domAttributes: attributes as unknown as DomAttributes },
      ]);
    }

    it.each([
      ['data-test', 'safe-node'],
      ['title', 'Details'],
      ['lang', 'en'],
      ['dir', 'ltr'],
    ])('applies the safe attribute %s', async (name, value) => {
      const { root } = await setup(safe);
      expect(root.querySelector('[aria-label="Safe"]')!.getAttribute(name)).toBe(value);
    });

    it.each(['id', 'aria-hidden', 'onclick', 'data-object'])('drops the unsafe attribute %s', async (name) => {
      const { root } = await setup(safe);
      expect(root.querySelector('[aria-label="Safe"]')!.hasAttribute(name)).toBe(false);
    });

    it.each([
      ['role', 'group'],
      ['aria-label', 'Safe'],
      ['tabindex', '0'],
    ])('keeps the %s of the wrapper', async (name, value) => {
      const { root } = await setup(safe);
      expect(root.querySelector('[data-test="safe-node"]')!.getAttribute(name)).toBe(value);
    });

    it('keeps the style of the wrapper', async () => {
      const { root } = await setup(safe);
      expect(root.querySelector('[aria-label="Safe"]')!.getAttribute('style')).not.toContain('display: none');
    });

    it('replaces the attributes when the signal changes', async () => {
      const { fixture, host, root } = await setup(safe);
      host.nodes[0].domAttributes!.set({ 'data-test': 'updated', 'data-count': 2 });
      await render(fixture);
      const node = root.querySelector('[aria-label="Safe"]')!;
      expect(node.getAttribute('data-test')).toBe('updated');
      expect(node.getAttribute('data-count')).toBe('2');
      expect(['title', 'lang'].filter((name) => node.hasAttribute(name))).toEqual([]);
    });
  });

  describe('handles and embedded controls', () => {
    function reviewer(host: AccessibilityHostComponent) {
      host.nodes = createNodes([{ id: 'custom', point: { x: 0, y: 0 }, ariaLabel: 'Reviewer', selectable: false }]);
    }

    it('applies the DOM attributes of a handle', async () => {
      const { root } = await setup(reviewer);
      expect(root.querySelector('[data-port="incoming"]')!.getAttribute('data-v-handle-type')).toBe('target');
    });

    it.each([
      { canStart: false, canAccept: true },
      { canStart: true, canAccept: false },
    ])(
      'keeps handles out of the accessibility tree with canStart $canStart and canAccept $canAccept',
      async ({ canStart, canAccept }) => {
        const { root } = await setup((host) => {
          reviewer(host);
          host.canStart.set(canStart);
          host.canAccept.set(canAccept);
        });
        const names = ['role', 'aria-label', 'aria-describedby', 'aria-hidden', 'aria-disabled', 'tabindex'];
        const handles = Array.from(root.querySelectorAll('[data-v-handle-type]'));
        expect(handles.length).toBe(2);
        expect(handles.flatMap((handle) => names.filter((name) => handle.hasAttribute(name)))).toEqual([]);
      },
    );

    it('keeps a button inside a node clickable', async () => {
      const { host, root } = await setup(reviewer);
      root.querySelector('button')!.click();
      expect(host.clicks).toBe(1);
    });
  });

  describe('flow description and live region', () => {
    it('describes the region with the configured flow description', async () => {
      const { root } = await setup((host) => host.labels.set({ flowDescription: 'Review diagram.' }));
      expect(description(root.querySelector('[role="region"]')!)).toBe('Review diagram.');
    });

    it('does not describe the minimap', async () => {
      const { root } = await setup((host) => host.labels.set({ flowDescription: 'Review diagram.' }));
      expect(root.querySelector('[role="img"]')!.hasAttribute('aria-describedby')).toBe(false);
    });

    it('owns one polite atomic live region per flow', async () => {
      const { root } = await setup();
      const regions = Array.from(root.querySelectorAll('[aria-live]'));
      expect(regions.map((region) => [region.getAttribute('aria-live'), region.getAttribute('aria-atomic')])).toEqual([
        ['polite', 'true'],
      ]);
    });

    it('does not announce a selection made by the application', async () => {
      const { fixture, host, root } = await setup();
      const node = root.querySelector('[aria-label="Request & review"]')!;
      host.nodes[1].selected.set(true);
      await render(fixture);
      expect(description(node)).toContain('Selected.');
      expect(root.querySelector('[aria-live]')!.textContent?.trim()).toBe('');
    });
  });

  describe('two flows on a page', () => {
    async function setupTwo() {
      TestBed.configureTestingModule({ imports: [AccessibilityHostComponent] });
      const first = TestBed.createComponent(AccessibilityHostComponent);
      const second = TestBed.createComponent(AccessibilityHostComponent);
      first.componentInstance.labels.set({ nodeRole: 'узел', parentRole: 'группа' });
      await render(first);
      await render(second);
      const child = (fixture: ComponentFixture<unknown>): Element =>
        fixture.nativeElement.querySelector('[aria-label="Request & review"]');
      return { first, second, child };
    }

    it('applies role translations to their own flow only', async () => {
      const { first, second } = await setupTwo();
      const roles = (fixture: ComponentFixture<unknown>) =>
        ['Node parent', 'Request & review'].map((label) =>
          fixture.nativeElement.querySelector(`[aria-label="${label}"]`).getAttribute('aria-roledescription'),
        );
      expect(roles(first)).toEqual(['группа', 'узел']);
      expect(roles(second)).toEqual(['group', 'node']);
    });

    it('gives the descriptions of each flow their own ids', async () => {
      const { first, second, child } = await setupTwo();
      expect(child(first).getAttribute('aria-describedby')).not.toBe(child(second).getAttribute('aria-describedby'));
    });

    it('removes the descriptions of a destroyed flow and keeps those of the other', async () => {
      const { first, second, child } = await setupTwo();
      const firstId = child(first).getAttribute('aria-describedby')!;
      const secondId = child(second).getAttribute('aria-describedby')!;
      first.destroy();
      expect(document.getElementById(firstId)).toBeNull();
      expect(document.getElementById(secondId)?.textContent).toContain('Parent: Node parent.');
    });
  });
});

function description(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
    .trim();
}
