import {
  ChangeDetectionStrategy,
  Component,
  provideExperimentalZonelessChangeDetection,
  viewChild,
  signal,
} from '@angular/core';
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
    ><vflow
      [nodes]="nodes()"
      [edges]="edges"
      [view]="[600, 350]"
      [optimization]="{ detachedGroupsLayer: true }" /><button>After</button>`,
})
class KeyboardHostComponent {
  flow = viewChild.required(VflowComponent);
  nodes = signal(
    createNodes([
      { id: 'child', type: 'default', parentId: 'parent', point: { x: 10, y: 10 }, text: 'Child' },
      { id: 'parent', type: 'default-group', point: { x: 20, y: 20 }, width: 250, height: 200, ariaLabel: 'Parent' },
      { id: 'other', type: 'default', point: { x: 400, y: 50 }, text: 'Other', focusable: false },
    ]),
  );
  edges = createEdges([{ id: 'edge', source: 'child', target: 'other', ariaLabel: 'Route' }]);
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="nodes" [view]="[600, 200]">
      <ng-template nodeHtml
        ><button>Action</button><input aria-label="Name" /> <textarea aria-label="Notes"></textarea
        ><select aria-label="Choice">
          <option>One</option>
        </select>
        <div contenteditable="true" tabindex="0">Edit</div>
      </ng-template>
    </vflow>
    <section vflowNoKeyboard><vflow [nodes]="excluded" [view]="[600, 100]" /></section>`,
})
class KeyboardControlsHostComponent {
  nodes = createNodes([
    { id: 'custom', type: 'html-template', point: { x: 0, y: 0 }, ariaLabel: 'Custom', selected: true },
  ]);
  excluded = createNodes([
    { id: 'excluded', type: 'default', point: { x: 0, y: 0 }, text: 'Excluded', selected: true },
  ]);
}

describe('public keyboard graph navigation', () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [KeyboardHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
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
    root.querySelector<HTMLElement>('[aria-label="Child"] default-node')!.click();
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
          type: 'default-group',
          parentId: 'parent',
          point: { x: 10, y: 10 },
          width: 100,
          height: 100,
          ariaLabel: 'Child',
        },
        { id: 'parent', type: 'default-group', point: { x: 20, y: 20 }, width: 250, height: 200, ariaLabel: 'Parent' },
        { id: 'other', type: 'default-group', point: { x: 100, y: 50 }, width: 250, height: 200, ariaLabel: 'Other' },
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
    host.flow().keyboardShortcuts = { multiSelection: ['AltLeft'] };
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
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'AltLeft' }));
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
    host.nodes()[0].width.set(100);
    host.nodes()[0].height.set(50);
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
      providers: [provideExperimentalZonelessChangeDetection()],
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
    host.nodes()[0].width.set(100);
    host.nodes()[0].height.set(50);
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
    host.nodes()[0].width.set(100);
    fixture.detectChanges();
    await fixture.whenStable();
    child.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.flow().viewport()).toEqual({ x: 0, y: 0, zoom: 1 });
    before.focus();
    host.nodes()[0].width.set(1000);
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
