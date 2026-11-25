import { ChangeDetectionStrategy, Component, inject, viewChild, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import {
  AriaLabelConfig,
  KeyboardInstructionKeys,
  KeyboardInstructionState,
} from '../../interfaces/aria-label-config.interface';
import { KeyboardShortcuts } from '../../types/keyboard-shortcuts.type';
import { SelectionMode } from '../../types/selection-mode.type';
import { AutoPanSettings } from '../../interfaces/auto-pan-settings.interface';
import { NodeChange } from '../../types/node-change.type';
import { provideVflow } from '../../features/feature';
import { withAccessibility } from '../../features/with-accessibility';
import { withShortcuts } from '../../features/with-shortcuts';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideVflow(
      withAccessibility(() => inject(KeyboardHostComponent).ariaLabelConfig),
      withShortcuts(() => inject(KeyboardHostComponent).keyboardShortcuts),
    ),
  ],
  template: `<button>Before</button
    ><vflow
      [nodes]="nodes()"
      [edges]="edges"
      style="width: 600px; height: 350px"
      [parentsBelowEdges]="true"
      [snapGrid]="snapGrid()"
      [nodesFocusable]="nodesFocusable()"
      [selectionMode]="selectionMode()"
      [nodesSelectable]="nodesSelectable()"
      [edgesSelectable]="edgesSelectable()"
      [autoPanOnNodeFocus]="autoPanOnNodeFocus()"
      [autoPan]="autoPan()"
      [minZoom]="minZoom()">
      <div *vNode style="width: 100px; height: 50px">
        <span vHandle handleType="target" position="left"></span
        ><span vHandle handleType="source" position="right"></span>
      </div> </vflow
    ><button>After</button>`,
})
class KeyboardHostComponent {
  flow = viewChild.required(VflowComponent);
  keyboardShortcuts = signal<KeyboardShortcuts>({});
  snapGrid = signal<[number, number]>([1, 1]);
  nodesFocusable = signal(true);
  ariaLabelConfig = signal<Partial<AriaLabelConfig>>({});
  selectionMode = signal<SelectionMode>('default');
  nodesSelectable = signal(true);
  edgesSelectable = signal(true);
  autoPanOnNodeFocus = signal(true);
  autoPan = signal<boolean | AutoPanSettings>(true);
  minZoom = signal(0.5);
  nodes = signal(
    createNodes([
      {
        id: 'child',
        parentId: 'parent',
        point: { x: 10, y: 10 },
        width: 100,
        height: 50,
        ariaLabel: 'Child',
      },
      { id: 'parent', point: { x: 20, y: 20 }, width: 250, height: 200, ariaLabel: 'Parent' },
      { id: 'other', point: { x: 400, y: 50 }, ariaLabel: 'Other', focusable: false },
    ]),
  );
  edges = createEdges([{ id: 'edge', source: 'child', target: 'other', ariaLabel: 'Route' }]);
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="nodes" style="width: 600px; height: 200px">
      <ng-template vNode
        ><button>Action</button><input aria-label="Name" /> <textarea aria-label="Notes"></textarea
        ><select aria-label="Choice">
          <option>One</option>
        </select>
        <div contenteditable="true" tabindex="0">Edit</div>
      </ng-template>
    </vflow>
    <section vNoKeyboard>
      <vflow [nodes]="excluded" style="width: 600px; height: 100px">
        <div *vNode style="width: 100px; height: 50px"></div>
      </vflow>
    </section>`,
})
class KeyboardControlsHostComponent {
  nodes = createNodes([{ id: 'custom', point: { x: 0, y: 0 }, ariaLabel: 'Custom', selected: true }]);
  excluded = createNodes([{ id: 'excluded', point: { x: 0, y: 0 }, ariaLabel: 'Excluded', selected: true }]);
}

/** Renders a flow and waits for its first layout, which reveals the nodes. */
async function renderFlow<T>(component: new () => T, label: string) {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  const root: HTMLElement = fixture.nativeElement;
  await settle(fixture);
  await expect.poll(() => getComputedStyle(root.querySelector(`[aria-label="${label}"]`)!).visibility).toBe('visible');
  return { fixture, root };
}

/**
 * A flow of a child node inside a parent node, an unfocusable third node and an edge from the child to it. `child`,
 * `parent` and `edge` are the focusable wrappers.
 */
async function setup() {
  const { fixture, root } = await renderFlow(KeyboardHostComponent, 'Child');
  const host = fixture.componentInstance;
  return {
    fixture,
    host,
    root,
    flow: host.flow(),
    child: root.querySelector<HTMLElement>('[aria-label="Child"]')!,
    parent: root.querySelector<HTMLElement>('[aria-label="Parent"]')!,
    edge: root.querySelector<SVGElement>('[aria-label="Route"]')!,
    outside: root.querySelector('button')!,
    settle: () => settle(fixture),
  };
}

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await fixture.whenStable();
}

function key(element: Element, key: string, code = key === ' ' ? 'Space' : key, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, code, shiftKey, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

function holdModifier(code: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: code, code }));
}

function releaseModifier(code: string) {
  document.dispatchEvent(new KeyboardEvent('keyup', { key: code, code }));
}

function description(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
    .trim();
}

function tabOrder(root: HTMLElement) {
  return Array.from(root.querySelectorAll('[tabindex="0"]')).map((element) => element.getAttribute('aria-label'));
}

describe('keyboard graph navigation', () => {
  afterEach(() => {
    releaseModifier('AltLeft');
    vi.useRealTimers();
  });

  describe('tab order', () => {
    it('follows the input order of nodes and edges, whatever the parenthood', async () => {
      const { root } = await setup();
      expect(tabOrder(root)).toEqual(['Child', 'Parent', 'Route']);
    });

    it('stays in input order after a click raises a node', async () => {
      const { root, child, settle } = await setup();
      child.click();
      await settle();
      expect(tabOrder(root)).toEqual(['Child', 'Parent', 'Route']);
    });

    it('does not change the selection when a node gets focus', async () => {
      const { host, parent } = await setup();
      parent.focus();
      expect(host.nodes().map((n) => n.selected())).toEqual([false, false, false]);
    });

    it('takes nodes out of the tab order when nodes are not focusable', async () => {
      const { host, child, settle } = await setup();
      host.nodesFocusable.set(false);
      await settle();
      expect(child.tabIndex).toBe(-1);
    });

    it('never makes the region a tab stop', async () => {
      const { host, root, settle } = await setup();
      host.nodesFocusable.set(false);
      await settle();
      expect(root.querySelector('[role="region"]')!.hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('elevation of groups behind edges', () => {
    async function setupGroups() {
      const context = await setup();
      context.host.nodes.set(
        createNodes([
          { id: 'child', parentId: 'parent', point: { x: 10, y: 10 }, width: 100, height: 100, ariaLabel: 'Child' },
          { id: 'parent', point: { x: 20, y: 20 }, width: 250, height: 200, ariaLabel: 'Parent' },
          { id: 'other', point: { x: 100, y: 50 }, width: 250, height: 200, ariaLabel: 'Other' },
          // Non-focusable members keep child and other in the parents layer below the edges without joining traversal.
          { id: 'child-member', parentId: 'child', point: { x: 10, y: 10 }, width: 20, height: 20, focusable: false },
          { id: 'other-member', parentId: 'other', point: { x: 10, y: 10 }, width: 20, height: 20, focusable: false },
        ]),
      );
      await context.settle();
      const { root } = context;
      const elevation = (label: string) =>
        Number(root.querySelector<HTMLElement | SVGElement>(`[aria-label="${label}"]`)!.style.zIndex);
      return { ...context, elevation };
    }

    it('keeps a group below its child and below a later group', async () => {
      const { elevation } = await setupGroups();
      expect(elevation('Child')).toBeGreaterThan(elevation('Parent'));
      expect(elevation('Other')).toBeGreaterThan(elevation('Parent'));
    });

    it('raises a clicked group above another group, below its child and below the edges', async () => {
      const { root, elevation, settle } = await setupGroups();
      root.querySelector<HTMLElement>('[aria-label="Parent"]')!.click();
      await settle();
      expect(elevation('Parent')).toBeGreaterThan(elevation('Other'));
      expect(elevation('Child')).toBeGreaterThan(elevation('Parent'));
      expect(elevation('Child')).toBeLessThan(elevation('Route'));
    });

    it('keeps the tab order of groups in input order after a click raises one', async () => {
      const { root, settle } = await setupGroups();
      root.querySelector<HTMLElement>('[aria-label="Parent"]')!.click();
      await settle();
      expect(tabOrder(root)).toEqual(['Child', 'Parent', 'Other', 'Route']);
    });
  });

  describe('selection', () => {
    it('replaces the selection with the focused node on Enter', async () => {
      const { host, child } = await setup();
      host.nodes()[1].selected.set(true);
      child.focus();
      key(child, 'Enter');
      expect(host.nodes().map((n) => n.selected())).toEqual([true, false, false]);
    });

    it('adds the focused node to the selection on Space while the multi-selection key is held', async () => {
      const { host, parent } = await setup();
      host.keyboardShortcuts.set({ modifiers: { multiSelection: ['AltLeft'] } });
      host.nodes()[0].selected.set(true);
      holdModifier('AltLeft');
      parent.focus();
      key(parent, ' ');
      expect(host.nodes().map((n) => n.selected())).toEqual([true, true, false]);
    });

    it('removes a selected node from the selection on Space while the multi-selection key is held', async () => {
      const { host, parent } = await setup();
      host.keyboardShortcuts.set({ modifiers: { multiSelection: ['AltLeft'] } });
      host.nodes()[0].selected.set(true);
      host.nodes()[1].selected.set(true);
      holdModifier('AltLeft');
      parent.focus();
      key(parent, ' ');
      expect(host.nodes().map((n) => n.selected())).toEqual([true, false, false]);
    });

    it('selects the focused edge on Enter', async () => {
      const { host, edge } = await setup();
      edge.focus();
      key(edge, 'Enter');
      expect(host.edges[0].selected()).toBe(true);
    });

    it('clears the whole selection on Escape', async () => {
      const { host, edge } = await setup();
      host.nodes()[0].selected.set(true);
      host.edges[0].selected.set(true);
      edge.focus();
      key(edge, 'Escape');
      expect([...host.nodes(), ...host.edges].map((entity) => entity.selected())).toEqual([false, false, false, false]);
    });

    it('keeps focus on the entity where Escape cleared the selection', async () => {
      const { host, edge } = await setup();
      host.edges[0].selected.set(true);
      edge.focus();
      key(edge, 'Escape');
      expect(document.activeElement).toBe(edge);
    });

    it('does not select a node on Enter when nodes are not selectable', async () => {
      const { host, child, settle } = await setup();
      host.nodesSelectable.set(false);
      await settle();
      child.focus();
      key(child, 'Enter');
      expect(host.nodes()[0].selected()).toBe(false);
    });

    it('does not select an edge on Enter when edges are not selectable', async () => {
      const { host, edge, settle } = await setup();
      host.edgesSelectable.set(false);
      await settle();
      edge.focus();
      key(edge, 'Enter');
      expect(host.edges[0].selected()).toBe(false);
    });

    it('clears a selection the application made on Escape when nothing is selectable', async () => {
      const { host, edge, settle } = await setup();
      host.nodesSelectable.set(false);
      host.edgesSelectable.set(false);
      await settle();
      host.nodes()[0].selected.set(true);
      host.edges[0].selected.set(true);
      edge.focus();
      key(edge, 'Escape');
      expect([host.nodes()[0].selected(), host.edges[0].selected()]).toEqual([false, false]);
    });

    it('keeps the selection on Escape in manual selection mode', async () => {
      const { host, child, settle } = await setup();
      host.nodes()[0].selected.set(true);
      host.selectionMode.set('manual');
      await settle();
      child.focus();
      key(child, 'Escape');
      expect(host.nodes()[0].selected()).toBe(true);
    });
  });

  describe('movement', () => {
    async function setupSelected() {
      const context = await setup();
      context.host.nodes().forEach((n) => n.selected.set(true));
      await context.settle();
      context.parent.focus();
      return context;
    }

    it('moves every selected node by one step on an arrow, a child along with its parent', async () => {
      const { host, parent } = await setupSelected();
      expect(key(parent, 'ArrowRight').defaultPrevented).toBe(true);
      expect(host.nodes().map((n) => n.point())).toEqual([
        { x: 10, y: 10 },
        { x: 25, y: 20 },
        { x: 405, y: 50 },
      ]);
    });

    it('publishes the new positions in nodesChanges', async () => {
      const { flow, parent, settle } = await setupSelected();
      const changes: NodeChange[][] = [];
      flow.nodesChanges.subscribe((items) => changes.push(items));
      key(parent, 'ArrowRight');
      await settle();
      await expect
        .poll(() => changes.flat())
        .toContainEqual(expect.objectContaining({ type: 'position', id: 'parent', point: { x: 25, y: 20 } }));
    });

    it('moves four steps on an arrow with Shift', async () => {
      const { host, parent } = await setupSelected();
      key(parent, 'ArrowDown', 'ArrowDown', true);
      expect(host.nodes()[1].point()).toEqual({ x: 20, y: 40 });
    });

    it('moves by a grid cell on an arrow with a snap grid', async () => {
      const { host, parent, settle } = await setupSelected();
      host.nodes()[1].point.set({ x: 25, y: 20 });
      host.snapGrid.set([25, 10]);
      await settle();
      key(parent, 'ArrowRight');
      expect(host.nodes()[1].point()).toEqual({ x: 50, y: 20 });
    });

    it('moves four grid cells on an arrow with Shift and a snap grid', async () => {
      const { host, parent, settle } = await setupSelected();
      host.nodes()[1].point.set({ x: 25, y: 20 });
      host.snapGrid.set([25, 10]);
      await settle();
      key(parent, 'ArrowDown', 'ArrowDown', true);
      expect(host.nodes()[1].point()).toEqual({ x: 25, y: 60 });
    });

    it('keeps a child inside the extent of its parent', async () => {
      const { host, child } = await setup();
      host.nodes()[0].selected.set(true);
      host.nodes()[0].point.set({ x: 149, y: 149 });
      child.focus();
      key(child, 'ArrowRight');
      key(child, 'ArrowDown', 'ArrowDown', true);
      expect(host.nodes()[0].point()).toEqual({ x: 150, y: 150 });
    });

    it('moves no selected node when the focused node is not draggable', async () => {
      const { host, child } = await setup();
      host.nodes()[0].selected.set(true);
      host.nodes()[0].draggable.set(false);
      host.nodes()[1].selected.set(true);
      child.focus();
      key(child, 'ArrowRight');
      expect(host.nodes()[1].point()).toEqual({ x: 20, y: 20 });
    });
  });

  describe('focus after changes', () => {
    it('leaves focus on the page when the focused edge is removed', async () => {
      const { fixture, host, edge, settle } = await setup();
      edge.focus();
      host.edges = [];
      fixture.changeDetectorRef.markForCheck();
      await settle();
      expect(document.activeElement).toBe(document.body);
    });

    it('leaves focus on the page when the focused node is removed', async () => {
      const { host, child, settle } = await setup();
      child.focus();
      host.nodes.set(host.nodes().slice(1));
      await settle();
      expect(document.activeElement).toBe(document.body);
    });

    it('leaves focus on the page when the focused node stops being focusable', async () => {
      const { host, parent, settle } = await setup();
      parent.focus();
      host.nodesFocusable.set(false);
      await settle();
      expect(document.activeElement).toBe(document.body);
    });

    it('keeps focus outside the graph when nodes are removed', async () => {
      const { host, outside, settle } = await setup();
      outside.focus();
      host.nodes.set([]);
      await settle();
      expect(document.activeElement).toBe(outside);
    });
  });

  describe('pan on focus', () => {
    /** Zoom 2 with the parent, and so the child inside it, far offscreen. */
    async function setupOffscreen() {
      const context = await setup();
      context.host.nodes()[1].point.set({ x: 800, y: 400 });
      context.flow.setViewport({ x: 0, y: 0, zoom: 2 });
      await context.settle();
      return context;
    }

    it('centers a fully offscreen node at the unchanged zoom, from its position nested in its parent', async () => {
      const { flow, child, settle } = await setupOffscreen();
      child.focus();
      await settle();
      expect(flow.viewport()).toEqual({ x: -1420, y: -695, zoom: 2 });
    });

    it('does not pan while the focused node moves by keyboard', async () => {
      const { host, flow, child, settle } = await setupOffscreen();
      child.focus();
      await settle();
      host.nodes()[0].selected.set(true);
      key(child, 'ArrowRight', 'ArrowRight', true);
      await settle();
      expect(flow.viewport()).toEqual({ x: -1420, y: -695, zoom: 2 });
    });

    it('does not pan to a focused edge', async () => {
      const { flow, edge, settle } = await setupOffscreen();
      edge.focus();
      await settle();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 2 });
    });

    it('leaves a partially visible node in place', async () => {
      const { host, flow, child, settle } = await setup();
      host.nodes()[1].point.set({ x: 0, y: 0 });
      host.nodes()[0].point.set({ x: -50, y: 10 });
      await settle();
      child.focus();
      await settle();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('leaves a node larger than the view in place', async () => {
      const { host, flow, child, settle } = await setup();
      host.nodes()[1].point.set({ x: 0, y: 0 });
      host.nodes()[0].point.set({ x: -50, y: 10 });
      host.nodes()[0].width!.set(1000);
      await settle();
      child.focus();
      await settle();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('does not pan to an offscreen node with autoPanOnNodeFocus disabled', async () => {
      const { host, flow, child, settle } = await setup();
      host.autoPanOnNodeFocus.set(false);
      host.nodes()[1].point.set({ x: 0, y: 0 });
      host.nodes()[0].point.set({ x: 1000, y: 0 });
      await settle();
      child.focus();
      await settle();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('pans to an offscreen node with drag auto-pan disabled', async () => {
      const { host, flow, child, settle } = await setup();
      host.autoPan.set(false);
      host.nodes()[1].point.set({ x: 0, y: 0 });
      host.nodes()[0].point.set({ x: 1000, y: 0 });
      await settle();
      child.focus();
      await settle();
      // The center of the 100px wide child at x 1000 goes to the center of the 600px wide flow.
      expect(flow.viewport().x).toBe(-750);
    });
  });

  describe('embedded controls and opt-out', () => {
    it.each([
      ['a button', 'button'],
      ['an input', 'input'],
      ['a textarea', 'textarea'],
      ['a select', 'select'],
      ['a contenteditable element', '[contenteditable]'],
      ['a node inside vNoKeyboard', '[aria-label="Excluded"]'],
    ])('leaves the keys of %s to it', async (_name, selector) => {
      const { fixture, root } = await renderFlow(KeyboardControlsHostComponent, 'Custom');
      const control = root.querySelector<HTMLElement>(selector)!;
      control.focus();
      expect(document.activeElement).toBe(control);
      expect(['Enter', ' ', 'Escape', 'ArrowRight'].filter((name) => key(control, name).defaultPrevented)).toEqual([]);
      const { nodes, excluded } = fixture.componentInstance;
      expect([...nodes, ...excluded].map((node) => [node.selected(), node.point()])).toEqual([
        [true, { x: 0, y: 0 }],
        [true, { x: 0, y: 0 }],
      ]);
    });

    it('leaves the keys of a handle inside a node to it', async () => {
      const { flow, root, settle } = await setup();
      const handle = root.querySelector<HTMLElement>('[data-v-handle-type="source"]')!;
      expect(key(handle, 'ArrowDown').defaultPrevented).toBe(false);
      await settle();
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('instructions', () => {
    it('names the default keys', async () => {
      const { child } = await setup();
      expect(description(child)).toBe(
        'Parent: Parent. Press Enter or Space to select. Use arrow keys to move it while it is selected. Press Delete or Backspace to delete.',
      );
    });

    it('rewrites a sentence for a remapped key and spells out arrows that are no longer the four', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['x'], moveUp: ['w'] } });
      await settle();
      expect(description(child)).toBe(
        'Parent: Parent. Press X to select. Use W, ArrowDown, ArrowLeft or ArrowRight to move it while it is selected. Press Delete or Backspace to delete.',
      );
    });

    it('drops the sentence of a disabled command', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { delete: [] } });
      await settle();
      expect(description(child)).toBe(
        'Parent: Parent. Press Enter or Space to select. Use arrow keys to move it while it is selected.',
      );
    });

    it('uses a configured sentence instead of the generated ones', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['x'] } });
      host.ariaLabelConfig.set({ nodeInstructions: 'Нажмите свою клавишу.' });
      await settle();
      expect(description(child)).toBe('Parent: Parent. Нажмите свою клавишу.');
    });

    const localized = (_keys: KeyboardInstructionKeys, state: KeyboardInstructionState) =>
      [state.selectable ? 'Выберите узел.' : '', state.movable ? 'Переместите узел.' : ''].filter(Boolean).join(' ');

    it('passes the available actions to an instructions factory', async () => {
      const { host, child, settle } = await setup();
      host.ariaLabelConfig.set({ nodeInstructions: localized });
      await settle();
      expect(description(child)).toBe('Parent: Parent. Выберите узел. Переместите узел.');
    });

    it('reports selection as unavailable to an instructions factory in manual selection mode', async () => {
      const { host, child, settle } = await setup();
      host.ariaLabelConfig.set({ nodeInstructions: localized });
      host.selectionMode.set('manual');
      await settle();
      expect(description(child)).toBe('Parent: Parent. Переместите узел.');
    });

    it('leaves pan and zoom out of the default instructions', async () => {
      const { child } = await setup();
      expect(description(child)).not.toMatch(/pan|zoom/);
    });

    it('passes the pan and zoom keys to an instructions factory', async () => {
      const { host, child, settle } = await setup();
      host.ariaLabelConfig.set({
        nodeInstructions: ({ pan, zoomIn }) =>
          [`Use ${pan} to pan.`, zoomIn ? `Press ${zoomIn} to zoom in.` : ''].filter(Boolean).join(' '),
      });
      await settle();
      expect(description(child)).toBe('Parent: Parent. Use arrow keys to pan. Press +, = or NumpadAdd to zoom in.');
    });

    it('passes no key for a disabled zoom command to an instructions factory', async () => {
      const { host, child, settle } = await setup();
      host.ariaLabelConfig.set({
        nodeInstructions: ({ pan, zoomIn }) =>
          [`Use ${pan} to pan.`, zoomIn ? `Press ${zoomIn} to zoom in.` : ''].filter(Boolean).join(' '),
      });
      host.keyboardShortcuts.set({ commands: { zoomIn: [] } });
      await settle();
      expect(description(child)).toBe('Parent: Parent. Use arrow keys to pan.');
    });
  });

  describe('announcements', () => {
    /**
     * The announcer writes a message a moment after clearing the region, and zoom keys animate; once `configure` has
     * run, the clock is mocked to skip both.
     */
    async function setupAnnouncements(configure: (host: KeyboardHostComponent) => void = () => undefined) {
      const context = await setup();
      configure(context.host);
      await context.settle();
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
      });
      const live = context.root.querySelector('[aria-live="polite"]')!;
      // Zoom keys announce once their promise settles, so the timers run with microtasks in between.
      const spoken = async () => {
        await vi.runAllTimersAsync();
        return live.textContent;
      };
      return { ...context, live, spoken };
    }

    it('announces a selection with the total', async () => {
      const { child, spoken } = await setupAnnouncements();
      child.focus();
      key(child, 'Enter');
      expect(await spoken()).toBe('Child selected. 1 selected in total.');
    });

    it('announces an addition to the selection with the total', async () => {
      const { parent, spoken } = await setupAnnouncements((host) => {
        host.keyboardShortcuts.set({ modifiers: { multiSelection: ['AltLeft'] } });
        host.nodes()[0].selected.set(true);
      });
      holdModifier('AltLeft');
      parent.focus();
      key(parent, ' ');
      expect(await spoken()).toBe('Parent selected. 2 selected in total.');
    });

    it('announces a movement with the new position', async () => {
      const { parent, spoken } = await setupAnnouncements((host) => host.nodes()[1].selected.set(true));
      parent.focus();
      key(parent, 'ArrowRight');
      expect(await spoken()).toBe('Moved node right. Position: 25, 20.');
    });

    it('announces a cleared selection', async () => {
      const { parent, spoken } = await setupAnnouncements((host) => host.nodes()[1].selected.set(true));
      parent.focus();
      key(parent, 'Escape');
      expect(await spoken()).toBe('Selection cleared.');
    });

    it('announces nothing on Escape without a selection', async () => {
      const { live, parent, spoken } = await setupAnnouncements();
      live.textContent = 'stale';
      parent.focus();
      key(parent, 'Escape');
      expect(await spoken()).toBe('stale');
    });

    it('announces a selection through a configured factory', async () => {
      const { parent, spoken } = await setupAnnouncements((host) =>
        host.ariaLabelConfig.set({ selectionAnnouncement: ({ label, count }) => `${label}: выбрано ${count}` }),
      );
      parent.focus();
      key(parent, 'Enter');
      expect(await spoken()).toBe('Parent: выбрано 1');
    });

    it('announces a movement through a configured factory', async () => {
      const { parent, spoken } = await setupAnnouncements((host) => {
        host.ariaLabelConfig.set({ movedAnnouncement: ({ direction, x, y }) => `Сдвиг ${direction} в ${x}, ${y}` });
        host.nodes()[1].selected.set(true);
      });
      parent.focus();
      key(parent, 'ArrowDown', 'ArrowDown', true);
      expect(await spoken()).toBe('Сдвиг down в 20, 40');
    });

    it('announces the zoom after a zoom key', async () => {
      const { child, spoken } = await setupAnnouncements((host) => host.autoPanOnNodeFocus.set(false));
      child.focus();
      key(child, '=', 'Equal');
      expect(await spoken()).toBe('Zoom 120%.');
    });

    it('announces the zoom after fit view', async () => {
      const { flow, child, spoken } = await setupAnnouncements((host) => host.autoPanOnNodeFocus.set(false));
      child.focus();
      key(child, '0', 'Digit0');
      expect(await spoken()).toBe(`Zoom ${Math.round(flow.viewport().zoom * 100)}%.`);
    });
  });

  describe('gesture shortcuts', () => {
    it('leaves a key bound to pan activation to the gesture layer', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ modifiers: { panActivation: ['Space'] } });
      await settle();
      child.focus();
      const space = key(child, ' ');
      releaseModifier('Space');
      // The document-level gesture layer claimed the key for panning.
      expect(space.defaultPrevented).toBe(true);
      expect(host.nodes()[0].selected()).toBe(false);
    });

    it('still selects on Enter while Space is bound to pan activation', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ modifiers: { panActivation: ['Space'] } });
      await settle();
      child.focus();
      expect(key(child, 'Enter').defaultPrevented).toBe(true);
      expect(host.nodes()[0].selected()).toBe(true);
    });

    it('selects on Space again once pan activation no longer holds it', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ modifiers: { panActivation: ['Space'] } });
      await settle();
      host.keyboardShortcuts.set({ modifiers: { panActivation: [] } });
      await settle();
      child.focus();
      key(child, ' ');
      expect(host.nodes()[0].selected()).toBe(true);
    });

    it('keeps a key bound as a modifier out of the commands', async () => {
      const { host, flow, child, settle } = await setup();
      const requests: unknown[] = [];
      flow.deleteRequest.subscribe((request) => requests.push(request));
      host.keyboardShortcuts.set({ modifiers: { selection: ['q'] }, commands: { delete: ['q'] } });
      await settle();
      child.focus();
      expect(key(child, 'q', 'KeyQ').defaultPrevented).toBe(false);
      expect(requests).toEqual([]);
    });
  });

  describe('delete request', () => {
    async function setupRequests() {
      const context = await setup();
      const requests: { nodeIds: string[]; edgeIds: string[] }[] = [];
      context.flow.deleteRequest.subscribe((request) => requests.push(request));
      return { ...context, requests };
    }

    it('requests the focused node on Delete when nothing is selected', async () => {
      const { child, requests } = await setupRequests();
      child.focus();
      expect(key(child, 'Delete').defaultPrevented).toBe(true);
      expect(requests).toEqual([{ nodeIds: ['child'], edgeIds: [] }]);
    });

    it('requests only the focused node when the selection does not include it', async () => {
      const { host, child, requests } = await setupRequests();
      host.nodes()[2].selected.set(true);
      host.edges[0].selected.set(true);
      child.focus();
      key(child, 'Backspace');
      expect(requests).toEqual([{ nodeIds: ['child'], edgeIds: [] }]);
    });

    it('requests the whole selection when it includes the focused node', async () => {
      const { host, child, requests } = await setupRequests();
      host.nodes()[0].selected.set(true);
      host.nodes()[2].selected.set(true);
      host.edges[0].selected.set(true);
      child.focus();
      key(child, 'Backspace');
      expect(requests).toEqual([{ nodeIds: ['child', 'other'], edgeIds: ['edge'] }]);
    });

    it('requests the whole selection when it includes the focused edge', async () => {
      const { host, edge, requests } = await setupRequests();
      host.nodes()[0].selected.set(true);
      host.nodes()[2].selected.set(true);
      host.edges[0].selected.set(true);
      edge.focus();
      key(edge, 'Delete');
      expect(requests).toEqual([{ nodeIds: ['child', 'other'], edgeIds: ['edge'] }]);
    });

    it('ignores a repeated keydown', async () => {
      const { child, requests } = await setupRequests();
      child.focus();
      child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', code: 'Delete', repeat: true, bubbles: true }));
      expect(requests).toEqual([]);
    });

    it('leaves the graph and the selection to the application', async () => {
      const { host, child } = await setupRequests();
      host.nodes()[0].selected.set(true);
      child.focus();
      key(child, 'Delete');
      expect(host.nodes().map((n) => [n.id, n.selected()])).toEqual([
        ['child', true],
        ['parent', false],
        ['other', false],
      ]);
    });

    it('follows a configured key instead of Delete', async () => {
      const { host, edge, requests, settle } = await setupRequests();
      host.keyboardShortcuts.set({ commands: { delete: ['x'] } });
      await settle();
      edge.focus();
      expect(key(edge, 'Delete').defaultPrevented).toBe(false);
      key(edge, 'x', 'KeyX');
      expect(requests).toEqual([{ nodeIds: [], edgeIds: ['edge'] }]);
    });

    it('requests nothing when the command has no keys', async () => {
      const { host, edge, requests, settle } = await setupRequests();
      host.keyboardShortcuts.set({ commands: { delete: [] } });
      await settle();
      edge.focus();
      expect(key(edge, 'Delete').defaultPrevented).toBe(false);
      expect(requests).toEqual([]);
    });
  });

  describe('viewport keys', () => {
    async function setupViewport() {
      const context = await setup();
      context.host.autoPanOnNodeFocus.set(false);
      await context.settle();
      return context;
    }

    it('pans on an arrow from an edge, which never moves', async () => {
      const { flow, edge, settle } = await setupViewport();
      edge.focus();
      expect(key(edge, 'ArrowRight').defaultPrevented).toBe(true);
      await settle();
      // Right reveals the right side.
      expect(flow.viewport()).toEqual({ x: -15, y: 0, zoom: 1 });
    });

    it('pans four steps on an arrow with Shift', async () => {
      const { flow, edge, settle } = await setupViewport();
      edge.focus();
      key(edge, 'ArrowUp', 'ArrowUp', true);
      await settle();
      expect(flow.viewport()).toEqual({ x: 0, y: 60, zoom: 1 });
    });

    it('pans on an arrow from an unselected node and leaves the node in place', async () => {
      const { host, flow, child, settle } = await setupViewport();
      child.focus();
      key(child, 'ArrowLeft');
      await settle();
      expect(flow.viewport()).toEqual({ x: 15, y: 0, zoom: 1 });
      expect(host.nodes()[0].point()).toEqual({ x: 10, y: 10 });
    });

    it('moves a selected node on an arrow instead of panning', async () => {
      const { host, flow, child, settle } = await setupViewport();
      host.nodes()[0].selected.set(true);
      child.focus();
      key(child, 'ArrowLeft');
      await settle();
      expect(host.nodes()[0].point()).toEqual({ x: 5, y: 10 });
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('zooms in on =', async () => {
      const { flow, child, settle } = await setupViewport();
      child.focus();
      expect(key(child, '=', 'Equal').defaultPrevented).toBe(true);
      await settle();
      expect(flow.viewport().zoom).toBeCloseTo(1.2, 5);
    });

    it('leaves the browser zoom shortcut Ctrl+= to the browser', async () => {
      const { flow, child } = await setupViewport();
      child.focus();
      const browserZoom = new KeyboardEvent('keydown', {
        key: '=',
        code: 'Equal',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      child.dispatchEvent(browserZoom);
      expect(browserZoom.defaultPrevented).toBe(false);
      expect(flow.viewport().zoom).toBe(1);
    });

    it('zooms out on NumpadSubtract', async () => {
      const { flow, child, settle } = await setupViewport();
      child.focus();
      key(child, '-', 'NumpadSubtract');
      await settle();
      expect(flow.viewport().zoom).toBeCloseTo(1 / 1.2, 5);
    });

    it('stops zooming out at the minimum zoom', async () => {
      const { host, flow, child, settle } = await setupViewport();
      host.minZoom.set(0.9);
      await settle();
      child.focus();
      key(child, '-', 'Minus');
      await settle();
      expect(flow.viewport().zoom).toBeCloseTo(0.9, 5);
    });

    it('fits the view on 0', async () => {
      const { flow, child, settle } = await setupViewport();
      child.focus();
      key(child, '0', 'Digit0');
      await settle();
      expect(flow.viewport()).not.toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('leaves a disabled zoom key unclaimed', async () => {
      const { host, flow, edge, settle } = await setupViewport();
      host.keyboardShortcuts.set({ commands: { zoomIn: [], zoomOut: [], fitView: [] } });
      await settle();
      edge.focus();
      expect(key(edge, '=', 'Equal').defaultPrevented).toBe(false);
      expect(flow.viewport().zoom).toBe(1);
    });
  });

  describe('configured commands', () => {
    it('replaces the keys of an entry instead of extending them', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['s'] } });
      await settle();
      child.focus();
      expect(key(child, 'Enter').defaultPrevented).toBe(false);
      expect(host.nodes()[0].selected()).toBe(false);
    });

    it('runs an entry on its configured key', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['s'] } });
      await settle();
      child.focus();
      key(child, 's', 'KeyS');
      expect(host.nodes()[0].selected()).toBe(true);
    });

    it('keeps the defaults of the entries a configuration leaves out', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['s'] } });
      host.nodes()[0].selected.set(true);
      await settle();
      child.focus();
      key(child, 'Escape');
      expect(host.nodes()[0].selected()).toBe(false);
    });

    it('adds to the selection with a configured select key while the multi-selection key is held', async () => {
      const { host, parent, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['s'] }, modifiers: { multiSelection: ['AltLeft'] } });
      host.nodes()[0].selected.set(true);
      await settle();
      holdModifier('AltLeft');
      parent.focus();
      key(parent, 's', 'KeyS');
      expect(host.nodes().map((n) => n.selected())).toEqual([true, true, false]);
    });

    it.each(['Escape', 'Delete'])('neither runs nor claims %s once its entry has no keys', async (name) => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { clearSelection: [], delete: [] } });
      host.nodes()[0].selected.set(true);
      await settle();
      child.focus();
      expect(key(child, name).defaultPrevented).toBe(false);
      expect(host.nodes().map((n) => n.selected())).toEqual([true, false, false]);
    });

    it('drops the instructions of entries without keys', async () => {
      const { host, child, settle } = await setup();
      host.keyboardShortcuts.set({ commands: { select: ['s'], clearSelection: [], delete: [] } });
      await settle();
      expect(description(child)).not.toMatch(/Press Escape|Press Delete or Backspace/);
      expect(description(child)).toContain('Press S to select');
    });
  });

  describe('a key shared by two commands', () => {
    async function setupShared() {
      const context = await setup();
      context.host.autoPanOnNodeFocus.set(false);
      context.host.keyboardShortcuts.set({ commands: { moveRight: ['d'], panRight: ['d'] } });
      await context.settle();
      return context;
    }

    it('pans from an edge, which cannot move', async () => {
      const { flow, edge, settle } = await setupShared();
      edge.focus();
      expect(key(edge, 'd', 'KeyD').defaultPrevented).toBe(true);
      await settle();
      expect(flow.viewport()).toEqual({ x: -15, y: 0, zoom: 1 });
    });

    it('pans from an unselected node and leaves it in place', async () => {
      const { host, flow, parent, settle } = await setupShared();
      parent.focus();
      key(parent, 'd', 'KeyD');
      await settle();
      expect(flow.viewport()).toEqual({ x: -15, y: 0, zoom: 1 });
      expect(host.nodes()[1].point()).toEqual({ x: 20, y: 20 });
    });

    it('moves a selected movable node and leaves the view in place', async () => {
      const { host, flow, parent, settle } = await setupShared();
      host.nodes()[1].selected.set(true);
      await settle();
      parent.focus();
      key(parent, 'd', 'KeyD');
      await settle();
      expect(host.nodes()[1].point()).toEqual({ x: 25, y: 20 });
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('takes the arrow key from both replaced entries', async () => {
      const { host, flow, parent, settle } = await setupShared();
      host.nodes()[1].selected.set(true);
      await settle();
      parent.focus();
      expect(key(parent, 'ArrowRight').defaultPrevented).toBe(false);
      await settle();
      expect(host.nodes()[1].point()).toEqual({ x: 20, y: 20 });
      expect(flow.viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });
});
