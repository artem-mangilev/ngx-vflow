import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection, viewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { filter, firstValueFrom, timeout } from 'rxjs';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button>Before</button
    ><vflow [nodes]="nodes()" [edges]="edges" [view]="[600, 350]" [optimization]="{ detachedGroupsLayer: true }">
      <ng-template node>
        <div style="width: 100px; height: 50px">
          <span vflowHandle handleType="target" position="left"></span
          ><span vflowHandle handleType="source" position="right"></span>
        </div>
      </ng-template> </vflow
    ><button>After</button>`,
})
class KeyboardHostComponent {
  flow = viewChild.required(VflowComponent);
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
  template: `<vflow [nodes]="nodes" [view]="[600, 200]">
      <ng-template node
        ><button>Action</button><input aria-label="Name" /> <textarea aria-label="Notes"></textarea
        ><select aria-label="Choice">
          <option>One</option>
        </select>
        <div contenteditable="true" tabindex="0">Edit</div>
      </ng-template>
    </vflow>
    <section vflowNoKeyboard>
      <vflow [nodes]="excluded" [view]="[600, 100]">
        <ng-template node><div style="width: 100px; height: 50px"></div></ng-template>
      </vflow>
    </section>`,
})
class KeyboardControlsHostComponent {
  nodes = createNodes([{ id: 'custom', point: { x: 0, y: 0 }, ariaLabel: 'Custom', selected: true }]);
  excluded = createNodes([{ id: 'excluded', point: { x: 0, y: 0 }, ariaLabel: 'Excluded', selected: true }]);
}

describe('public keyboard graph navigation', () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [KeyboardHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(KeyboardHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    await new Promise<void>((resolve) => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        resolve();
      });
      observer.observe(root.querySelector('[role="region"]')!);
    });
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance, root };
  }

  it('keeps focusable wrappers in input order despite parenthood and pointer elevation', async () => {
    const { fixture, host, root } = await setup();
    const order = () => Array.from(root.querySelectorAll('[tabindex="0"]')).map((e) => e.getAttribute('aria-label'));
    expect(order()).toEqual(['Child', 'Parent', 'Route']);
    root.querySelector<HTMLElement>('[aria-label="Child"]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(order()).toEqual(['Child', 'Parent', 'Route']);
    const selected = host.nodes().map((n) => n.selected());
    root.querySelector<HTMLElement>('[aria-label="Parent"]')!.focus();
    expect(host.nodes().map((n) => n.selected())).toEqual(selected);
  });

  it('preserves relative group elevation behind edges without changing traversal order', async () => {
    const { fixture, host, root } = await setup();
    host.nodes.set(
      createNodes([
        {
          id: 'child',
          parentId: 'parent',
          point: { x: 10, y: 10 },
          width: 100,
          height: 100,
          ariaLabel: 'Child',
        },
        { id: 'parent', point: { x: 20, y: 20 }, width: 250, height: 200, ariaLabel: 'Parent' },
        { id: 'other', point: { x: 100, y: 50 }, width: 250, height: 200, ariaLabel: 'Other' },
        // Non-focusable members keep child and other in the detached groups layer without joining traversal.
        { id: 'child-member', parentId: 'child', point: { x: 10, y: 10 }, width: 20, height: 20, focusable: false },
        { id: 'other-member', parentId: 'other', point: { x: 10, y: 10 }, width: 20, height: 20, focusable: false },
      ]),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const parent = root.querySelector<HTMLElement>('[aria-label="Parent"]')!;
    const other = root.querySelector<HTMLElement>('[aria-label="Other"]')!;
    const edge = root.querySelector<SVGElement>('[aria-label="Route"]')!;
    const elevation = (element: HTMLElement | SVGElement) => Number(element.style.zIndex);
    expect(elevation(child)).toBeGreaterThan(elevation(parent));
    expect(elevation(other)).toBeGreaterThan(elevation(parent));
    parent.querySelector<HTMLElement>('.selectable')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(elevation(parent)).toBeGreaterThan(elevation(other));
    expect(elevation(child)).toBeGreaterThan(elevation(parent));
    expect(elevation(child)).toBeLessThan(elevation(edge));
    expect(Array.from(root.querySelectorAll('[tabindex="0"]')).map((e) => e.getAttribute('aria-label'))).toEqual([
      'Child',
      'Parent',
      'Other',
      'Route',
    ]);
  });

  it('replaces, toggles and clears selection through focused wrappers', async () => {
    const { fixture, host, root } = await setup();
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const parent = root.querySelector<HTMLElement>('[aria-label="Parent"]')!;
    const edge = root.querySelector<SVGElement>('[aria-label="Route"]')!;
    host.flow().keyboardShortcuts = { modifiers: { multiSelection: ['Alt'] } };
    host.nodes()[1].selected.set(true);
    child.focus();
    key(child, 'Enter');
    expect(host.nodes().map((n) => n.selected())).toEqual([true, false, false]);
    key(child, 'Alt', 'AltLeft');
    parent.focus();
    key(parent, ' ');
    expect(host.nodes().map((n) => n.selected())).toEqual([true, true, false]);
    key(parent, ' ');
    expect(host.nodes()[1].selected()).toBeFalse();
    edge.focus();
    key(edge, 'Enter');
    expect(host.edges[0].selected()).toBeTrue();
    key(edge, 'Escape');
    expect([...host.nodes(), ...host.edges].every((n) => !n.selected())).toBeTrue();
    expect(document.activeElement).toBe(edge);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt', code: 'AltLeft' }));
    fixture.detectChanges();
  });

  it('moves selected movable nodes once and publishes application-owned position changes', async () => {
    const { fixture, host, root } = await setup();
    host.nodes().forEach((n) => n.selected.set(true));
    fixture.detectChanges();
    await fixture.whenStable();
    const parent = root.querySelector<HTMLElement>('[aria-label="Parent"]')!;
    const changes = firstValueFrom(
      host.flow().nodesChange$.pipe(
        filter((items) => items.some((item) => item.type === 'position' && item.id === 'parent')),
        timeout(2000),
      ),
    );
    parent.focus();
    expect(key(parent, 'ArrowRight').defaultPrevented).toBeTrue();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.nodes().map((n) => n.point())).toEqual([
      { x: 10, y: 10 },
      { x: 25, y: 20 },
      { x: 405, y: 50 },
    ]);
    expect(await changes).toContain(
      jasmine.objectContaining({ type: 'position', id: 'parent', point: { x: 25, y: 20 } }),
    );
    key(parent, 'ArrowDown', 'ArrowDown', true);
    expect(host.nodes()[1].point()).toEqual({ x: 25, y: 40 });
    host.flow().snapGrid = [25, 10];
    key(parent, 'ArrowRight');
    expect(host.nodes()[1].point()).toEqual({ x: 50, y: 40 });
    key(parent, 'ArrowDown', 'ArrowDown', true);
    expect(host.nodes()[1].point()).toEqual({ x: 50, y: 80 });
  });

  it('recovers focus after removal or policy changes without stealing focus from outside', async () => {
    const { fixture, host, root } = await setup();
    root.querySelector<HTMLElement>('[aria-label="Child"]')!.focus();
    host.nodes.set(host.nodes().slice(1));
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Parent');
    host.flow().nodesFocusable = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(root.querySelector('[role="region"]'));
    const outside = root.querySelector('button')!;
    outside.focus();
    host.nodes.set([]);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(outside);
  });

  it('centers only fully offscreen keyboard-focused nodes at unchanged zoom using nested coordinates', async () => {
    const { fixture, host, root } = await setup();
    host.nodes()[0].width!.set(100);
    host.nodes()[0].height!.set(50);
    host.nodes()[1].point.set({ x: 800, y: 400 });
    host.flow().viewportTo({ x: 0, y: 0, zoom: 2 });
    fixture.detectChanges();
    await fixture.whenStable();
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    child.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: -1420, y: -695, zoom: 2 });
    host.nodes()[0].selected.set(true);
    key(child, 'ArrowRight', 'ArrowRight', true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: -1420, y: -695, zoom: 2 });
    root.querySelector<SVGElement>('[aria-label="Route"]')!.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: -1420, y: -695, zoom: 2 });
  });

  it('preserves embedded controls and explicit keyboard opt-out', async () => {
    TestBed.configureTestingModule({
      imports: [KeyboardControlsHostComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(KeyboardControlsHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    for (
      let frame = 0;
      frame < 10 && getComputedStyle(root.querySelector('[aria-label="Custom"]')!).visibility !== 'visible';
      frame++
    ) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      fixture.detectChanges();
    }
    for (const control of Array.from(
      root.querySelectorAll<HTMLElement>('button, input, textarea, select, [contenteditable], [aria-label="Excluded"]'),
    )) {
      control.focus();
      expect(document.activeElement).toBe(control);
      for (const command of ['Enter', ' ', 'Escape', 'ArrowRight'])
        expect(key(control, command).defaultPrevented).toBeFalse();
    }
    for (const node of [...fixture.componentInstance.nodes, ...fixture.componentInstance.excluded]) {
      expect(node.selected()).toBeTrue();
      expect(node.point()).toEqual({ x: 0, y: 0 });
    }
  });

  it('localizes keyboard instructions and removes unavailable actions in manual mode', async () => {
    const { fixture, host, root } = await setup();
    const labels = {
      flowLabel: 'Граф',
      keyboardNavigation: 'Переходите клавишей Tab.',
      keyboardSelect: 'Выберите узел.',
      keyboardDeselect: 'Снимите выделение.',
      keyboardMove: 'Переместите узел.',
    };
    host.flow().ariaLabelConfig = labels;
    fixture.detectChanges();
    await fixture.whenStable();
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const description = () =>
      child
        .getAttribute('aria-describedby')!
        .split(/\s+/)
        .map((id) => document.getElementById(id)!.textContent)
        .join(' ');
    expect(description()).toContain('Переходите клавишей Tab.');
    expect(description()).toContain('Выберите узел.');
    expect(description()).toContain('Переместите узел.');
    host.flow().selectionMode = 'manual';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(description()).not.toContain('Выберите узел.');
    expect(description()).not.toContain('Снимите выделение.');
    expect(description()).toContain('Переместите узел.');
  });

  it('honors eligibility, manual selection and existing parent movement extents', async () => {
    const { fixture, host, root } = await setup();
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const edge = root.querySelector<SVGElement>('[aria-label="Route"]')!;
    host.flow().nodesSelectable = false;
    host.flow().edgesSelectable = false;
    child.focus();
    key(child, 'Enter');
    edge.focus();
    key(edge, 'Enter');
    expect([...host.nodes(), ...host.edges].some((entity) => entity.selected())).toBeFalse();
    host.nodes()[0].selected.set(true);
    host.edges[0].selected.set(true);
    key(edge, 'Escape');
    expect([...host.nodes(), ...host.edges].some((entity) => entity.selected())).toBeFalse();
    host.nodes()[0].selected.set(true);
    host.flow().selectionMode = 'manual';
    child.focus();
    key(child, 'Escape');
    expect(host.nodes()[0].selected()).toBeTrue();
    host.nodes()[0].width!.set(100);
    host.nodes()[0].height!.set(50);
    host.nodes()[0].point.set({ x: 149, y: 149 });
    key(child, 'ArrowRight');
    key(child, 'ArrowDown', 'ArrowDown', true);
    expect(host.nodes()[0].point()).toEqual({ x: 150, y: 150 });
    host.nodes()[0].draggable.set(false);
    host.nodes()[1].selected.set(true);
    const parentPoint = host.nodes()[1].point();
    key(child, 'ArrowRight');
    expect(host.nodes()[1].point()).toEqual(parentPoint);
    host.flow().nodesFocusable = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(child.tabIndex).toBe(-1);
  });

  it('leaves partially visible and oversized nodes in place and supports reactive focus-pan opt-out', async () => {
    const { fixture, host, root } = await setup();
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const before = root.querySelector('button')!;
    host.nodes()[1].point.set({ x: 0, y: 0 });
    host.nodes()[0].point.set({ x: -50, y: 10 });
    host.nodes()[0].width!.set(100);
    fixture.detectChanges();
    await fixture.whenStable();
    child.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    before.focus();
    host.nodes()[0].width!.set(1000);
    fixture.detectChanges();
    await fixture.whenStable();
    child.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    before.focus();
    host.flow().autoPanOnNodeFocus = false;
    host.nodes()[0].point.set({ x: 1000, y: 0 });
    fixture.detectChanges();
    await fixture.whenStable();
    child.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    before.focus();
    host.flow().autoPanOnNodeFocus = true;
    host.flow().autoPan = false;
    child.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport().x).toBe(-1200);
  });

  it('announces keyboard selection, clearing and movement in the flow live region and localizes them', async () => {
    const { fixture, host, root } = await setup();
    const live = root.querySelector('[aria-live="polite"]')!;
    const spoken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return live.textContent;
    };
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const parent = root.querySelector<HTMLElement>('[aria-label="Parent"]')!;
    expect(live.getAttribute('aria-atomic')).toBe('true');
    child.focus();
    key(child, 'Enter');
    expect(await spoken()).toBe('Child selected. 1 selected in total.');
    host.flow().keyboardShortcuts = { modifiers: { multiSelection: ['code:AltLeft'] } };
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltLeft' }));
    parent.focus();
    key(parent, ' ');
    expect(await spoken()).toBe('Parent selected. 2 selected in total.');
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'AltLeft' }));
    key(parent, 'ArrowRight');
    expect(await spoken()).toBe('Moved node right. Position: 25, 20.');
    host.nodes()[0].selected.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    key(parent, 'Escape');
    expect(await spoken()).toBe('Selection cleared.');
    live.textContent = 'stale';
    key(parent, 'Escape');
    expect(await spoken()).toBe('stale');
    host.flow().ariaLabelConfig = {
      selectionAnnouncement: ({ label, count }) => `${label}: выбрано ${count}`,
      movedAnnouncement: ({ direction, x, y }) => `Сдвиг ${direction} в ${x}, ${y}`,
    };
    fixture.detectChanges();
    await fixture.whenStable();
    key(parent, 'Enter');
    expect(await spoken()).toBe('Parent: выбрано 1');
    key(parent, 'ArrowDown', 'ArrowDown', true);
    expect(await spoken()).toBe('Сдвиг down в 25, 40');
  });

  it('leaves keys bound to gesture shortcuts to the gesture layer', async () => {
    const { fixture, host, root } = await setup();
    host.flow().keyboardShortcuts = { modifiers: { panActivation: ['Space'] } };
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    child.focus();
    const space = key(child, ' ');
    expect(host.nodes()[0].selected()).toBeFalse();
    // The document-level gesture layer received the key and claimed it for panning.
    expect(space.defaultPrevented).toBeTrue();
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect(key(child, 'Enter').defaultPrevented).toBeTrue();
    expect(host.nodes()[0].selected()).toBeTrue();
    host.flow().keyboardShortcuts = { modifiers: { panActivation: [] } };
    key(child, 'Escape');
    key(child, ' ');
    expect(host.nodes()[0].selected()).toBeTrue();
    fixture.detectChanges();
  });

  it('requests deletion at the point of focus once per press and follows the configured keys', async () => {
    const { fixture, host, root } = await setup();
    const requests: { nodeIds: string[]; edgeIds: string[] }[] = [];
    const subscription = host.flow().deleteRequest.subscribe((request) => requests.push(request));
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const edge = root.querySelector<SVGElement>('[aria-label="Route"]')!;
    const description = () =>
      child
        .getAttribute('aria-describedby')!
        .split(/\s+/)
        .map((id) => document.getElementById(id)!.textContent)
        .join(' ');
    expect(description()).toContain('Press Delete or Backspace to request deletion of this item');
    child.focus();
    // Nothing selected: only the focused entity.
    expect(key(child, 'Delete').defaultPrevented).toBeTrue();
    expect(requests).toEqual([{ nodeIds: ['child'], edgeIds: [] }]);
    // A selection elsewhere does not follow a focused entity outside of it.
    host.nodes()[2].selected.set(true);
    host.edges[0].selected.set(true);
    key(child, 'Backspace');
    expect(requests[1]).toEqual({ nodeIds: ['child'], edgeIds: [] });
    // A focused entity inside the selection carries the whole selection.
    host.nodes()[0].selected.set(true);
    key(child, 'Backspace');
    expect(requests[2]).toEqual({ nodeIds: ['child', 'other'], edgeIds: ['edge'] });
    child.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', code: 'Delete', repeat: true, bubbles: true }));
    expect(requests.length).toBe(3);
    expect(host.nodes().map((n) => n.selected())).toEqual([true, false, true]);
    expect(host.nodes().length).toBe(3);
    edge.focus();
    key(edge, 'Delete');
    expect(requests[3]).toEqual({ nodeIds: ['child', 'other'], edgeIds: ['edge'] });
    host.flow().keyboardShortcuts = { commands: { delete: ['x'] } };
    fixture.detectChanges();
    await fixture.whenStable();
    expect(key(edge, 'Delete').defaultPrevented).toBeFalse();
    key(edge, 'x', 'KeyX');
    expect(requests.length).toBe(5);
    host.flow().keyboardShortcuts = { commands: { delete: [] } };
    fixture.detectChanges();
    await fixture.whenStable();
    key(edge, 'x', 'KeyX');
    expect(requests.length).toBe(5);
    expect(description()).not.toContain('Press Delete or Backspace');
    subscription.unsubscribe();
  });

  it('pans and zooms the viewport from wrappers that do not consume the keys and from the container', async () => {
    const { fixture, host, root } = await setup();
    const live = root.querySelector('[aria-live="polite"]')!;
    const spoken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return live.textContent;
    };
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const edge = root.querySelector<SVGElement>('[aria-label="Route"]')!;
    const container = root.querySelector<HTMLElement>('[role="region"]')!;
    host.flow().autoPanOnNodeFocus = false;
    await settle();
    expect(host.flow().viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    // An edge never moves, so arrows scroll the view: right reveals the right side.
    edge.focus();
    expect(key(edge, 'ArrowRight').defaultPrevented).toBeTrue();
    await settle();
    expect(host.flow().viewport()).toEqual({ x: -15, y: 0, zoom: 1 });
    key(edge, 'ArrowUp', 'ArrowUp', true);
    await settle();
    expect(host.flow().viewport()).toEqual({ x: -15, y: 60, zoom: 1 });
    // An unselected node does not move either, so its arrows pan; a selected movable one moves instead.
    child.focus();
    key(child, 'ArrowLeft');
    await settle();
    expect(host.flow().viewport()).toEqual({ x: 0, y: 60, zoom: 1 });
    expect(host.nodes()[0].point()).toEqual({ x: 10, y: 10 });
    host.nodes()[0].selected.set(true);
    key(child, 'ArrowLeft');
    await settle();
    expect(host.nodes()[0].point()).toEqual({ x: 5, y: 10 });
    expect(host.flow().viewport()).toEqual({ x: 0, y: 60, zoom: 1 });
    // Zoom keys with announcements; browser zoom shortcuts stay untouched.
    expect(key(child, '=', 'Equal').defaultPrevented).toBeTrue();
    await settle();
    expect(host.flow().viewport().zoom).toBeCloseTo(1.2, 5);
    expect(await spoken()).toBe('Zoom 120%.');
    const browserZoom = new KeyboardEvent('keydown', {
      key: '=',
      code: 'Equal',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(browserZoom);
    expect(browserZoom.defaultPrevented).toBeFalse();
    key(child, '-', 'NumpadSubtract');
    await settle();
    expect(host.flow().viewport().zoom).toBeCloseTo(1, 5);
    host.flow().minZoom = 0.9;
    key(child, '-', 'Minus');
    await settle();
    expect(host.flow().viewport().zoom).toBeCloseTo(0.9, 5);
    expect(await spoken()).toBe('Zoom 90%.');
    // Fit view announces the resulting zoom; the container itself accepts the same commands.
    container.focus();
    key(container, '0', 'Digit0');
    await settle();
    const fitted = host.flow().viewport();
    expect(fitted.zoom).not.toBeCloseTo(0.9, 5);
    expect(await spoken()).toBe(`Zoom ${Math.round(fitted.zoom * 100)}%.`);
    key(container, 'ArrowDown');
    await settle();
    expect(host.flow().viewport()).toEqual({ ...fitted, y: fitted.y - 15 });
    // Keys from embedded content are left alone; disabled commands drop their instruction.
    const handle = root.querySelector<HTMLElement>('[data-vflow-handle-type="source"]')!;
    expect(key(handle, 'ArrowDown').defaultPrevented).toBeFalse();
    await settle();
    expect(host.flow().viewport()).toEqual({ ...fitted, y: fitted.y - 15 });
    const description = () =>
      child
        .getAttribute('aria-describedby')!
        .split(/\s+/)
        .map((id) => document.getElementById(id)!.textContent)
        .join(' ');
    expect(description()).toContain('Use arrow keys to pan the view');
    expect(description()).toContain('Press Plus or Minus to zoom and 0 to fit the graph.');
    host.flow().keyboardShortcuts = { commands: { zoomIn: [], zoomOut: [], fitView: [] } };
    await settle();
    expect(key(container, '=', 'Equal').defaultPrevented).toBeFalse();
    expect(description()).not.toContain('Press Plus or Minus');
  });

  it('merges sections and entries independently and disables an entry with an empty list', async () => {
    const { fixture, host, root } = await setup();
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const child = root.querySelector<HTMLElement>('[aria-label="Child"]')!;
    const parent = root.querySelector<HTMLElement>('[aria-label="Parent"]')!;
    const description = () =>
      child
        .getAttribute('aria-describedby')!
        .split(/\s+/)
        .map((id) => document.getElementById(id)!.textContent)
        .join(' ');
    host.flow().keyboardShortcuts = { commands: { select: ['s'] }, modifiers: { multiSelection: ['code:AltLeft'] } };
    await settle();
    child.focus();
    // An entry is replaced, not extended.
    expect(key(child, 'Enter').defaultPrevented).toBeFalse();
    expect(host.nodes()[0].selected()).toBeFalse();
    key(child, 's', 'KeyS');
    expect(host.nodes()[0].selected()).toBeTrue();
    // Entries left out of the update keep their defaults.
    key(child, 'Escape');
    expect(host.nodes()[0].selected()).toBeFalse();
    // A later update touches two command entries; the modifier set before it survives.
    host.flow().keyboardShortcuts = { commands: { clearSelection: [], delete: [] } };
    await settle();
    key(child, 's', 'KeyS');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltLeft' }));
    parent.focus();
    key(parent, 's', 'KeyS');
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'AltLeft' }));
    expect(host.nodes().map((n) => n.selected())).toEqual([true, true, false]);
    // A disabled entry neither runs nor claims its key, and drops out of the instructions.
    expect(key(parent, 'Escape').defaultPrevented).toBeFalse();
    expect(key(parent, 'Delete').defaultPrevented).toBeFalse();
    expect(host.nodes().map((n) => n.selected())).toEqual([true, true, false]);
    expect(description()).not.toContain('Press Escape');
    expect(description()).not.toContain('Press Delete or Backspace');
    expect(description()).toContain('to select');
    fixture.detectChanges();
  });

  it('does not restore stale graph focus after focus has left the graph', async () => {
    const { fixture, host, root } = await setup();
    root.querySelector<HTMLElement>('[aria-label="Child"]')!.focus();
    const outside = root.querySelector('button')!;
    outside.focus();
    outside.remove();
    host.nodes.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(document.body);
  });
});

function key(element: Element, key: string, code = key === ' ' ? 'Space' : key, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key, code, shiftKey, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}
