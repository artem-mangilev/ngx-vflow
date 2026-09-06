import { ChangeDetectionStrategy, Component, provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createNodes } from '../../interfaces/node.interface';
import { Edge, createEdges } from '../../interfaces/edge.interface';
import { Vflow } from '../../vflow';
import { AriaLabelConfig } from '../../interfaces/aria-label-config.interface';
import { DomAttributes } from '../../interfaces/dom-attributes.interface';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="nodes" [edges]="edges" [view]="[600, 350]" [ariaLabelConfig]="labels()">
    <mini-map />
    <ng-template nodeHtml>
      <button type="button" noDrag (click)="clicks = clicks + 1">Review request</button>
      <handle
        type="target"
        position="left"
        id="incoming"
        [canStart]="canStart()"
        [canAccept]="canAccept()"
        ariaLabel="Accept request"
        ariaDescription="Inbound route."
        [domAttributes]="{ 'data-port': 'incoming' }" />
    </ng-template>
  </vflow>`,
})
class AccessibilityHostComponent {
  labels = signal<Partial<AriaLabelConfig>>({});
  canStart = signal(false);
  canAccept = signal(true);
  clicks = 0;
  nodes = createNodes([
    { id: 'parent', type: 'default-group', point: { x: 0, y: 0 }, width: 250, height: 200 },
    { id: 'a', type: 'default', parentId: 'parent', point: { x: 20, y: 30 }, text: '<b>Request</b> &amp; review' },
    { id: 'b', type: 'default', point: { x: 350, y: 30 }, text: 'Approval' },
  ]);
  edges: Edge[] = createEdges([{ id: 'ab', source: 'a', target: 'b' }]);
}

describe('public graph accessibility', () => {
  it('falls back for empty and custom content with sparse factories and resets omitted translations', async () => {
    TestBed.configureTestingModule({
      imports: [AccessibilityHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AccessibilityHostComponent);
    const host = fixture.componentInstance;
    host.nodes = createNodes([
      { id: 'empty', type: 'default', point: { x: 0, y: 0 }, text: ' <br> ', ariaLabel: '  ' },
      { id: 'custom', type: 'html-template', point: { x: 250, y: 0 } },
    ]);
    host.edges = createEdges(
      [
        {
          id: 'route',
          source: 'empty',
          target: 'custom',
          ariaLabel: 'Route',
          ariaDescription: 'Review route.',
          domAttributes: { 'data-route': 'sparse' },
        },
      ],
      { useDefaults: false },
    );
    host.labels.set({ nodeLabel: (id) => `Узел ${id}`, flowLabel: 'Граф' });
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[aria-label="Узел empty"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Узел custom"]')).not.toBeNull();
    const edge = root.querySelector('[data-route="sparse"]')!;
    expect(edge.getAttribute('role')).toBe('group');
    expect(description(edge)).toContain('Review route. Connection from Узел empty to Узел custom');
    host.edges[0].ariaLabel!.set('Updated route');
    host.labels.set({ nodeLabel: undefined });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Graph');
    expect(root.querySelector('[aria-label="Node empty"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Node custom"]')).not.toBeNull();
    expect(edge.getAttribute('aria-label')).toBe('Updated route');
    expect(description(edge)).toContain('Connection from Node empty to Node custom');
  });

  it('names the graph, entities, relationships, handles and minimap with entity Tab stops', async () => {
    TestBed.configureTestingModule({
      imports: [AccessibilityHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AccessibilityHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Graph');
    expect(root.querySelector('[role="group"][aria-label="Request & review"]')).not.toBeNull();
    expect(root.querySelector('[role="group"][aria-label="Group parent"]')).not.toBeNull();
    expect(
      root.querySelector('[role="group"][aria-label="Connection from Request & review to Approval"]'),
    ).not.toBeNull();
    expect(
      root.querySelector('[role="group"][aria-label="Source connection point of Request & review"]'),
    ).not.toBeNull();
    expect(root.querySelector('[role="img"][aria-label="Graph minimap"]')).not.toBeNull();
    expect(root.querySelectorAll('[tabindex="0"]').length).toBe(4);
    expect(root.querySelector('[role="img"]')?.hasAttribute('tabindex')).toBeFalse();
    const child = root.querySelector('[aria-label="Request & review"]')!;
    expect(description(child)).toContain('Parent: Group parent.');
  });

  it('reactively combines custom descriptions, relationships and actual selection despite denied eligibility', async () => {
    TestBed.configureTestingModule({
      imports: [AccessibilityHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AccessibilityHostComponent);
    const host = fixture.componentInstance;
    host.nodes = createNodes([
      { id: 'parent', type: 'default', point: { x: 0, y: 0 }, text: 'Processing' },
      {
        id: 'a',
        type: 'default',
        point: { x: 10, y: 10 },
        parentId: 'parent',
        ariaLabel: 'Application',
        ariaDescription: 'Requires review.',
        selected: true,
        selectable: false,
        draggable: false,
      },
      { id: 'b', type: 'default', point: { x: 350, y: 30 }, text: 'Approval' },
    ]);
    host.edges = createEdges(
      [{ id: 'ab', source: 'a', target: 'b', ariaLabel: 'Approve', ariaDescription: 'Review route.' }],
      { useDefaults: false },
    );
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const child = root.querySelector('[aria-label="Application"]')!;
    expect(description(child)).toContain(
      'Requires review. Parent: Processing. Selected. Selection unavailable. Movement unavailable.',
    );
    expect(child.hasAttribute('aria-selected')).toBeFalse();
    expect(child.hasAttribute('aria-disabled')).toBeFalse();
    expect(description(root.querySelector('[aria-label="Approve"]')!)).toContain(
      'Connection from Application to Approval',
    );
    host.nodes[1].ariaLabel!.set('Заявка');
    host.nodes[1].ariaDescription!.set('Требует проверки.');
    host.labels.set({ flowLabel: 'Граф', selected: 'Выбран.', parentDescription: (name) => `Родитель: ${name}.` });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(child.getAttribute('aria-label')).toBe('Заявка');
    expect(description(child)).toContain('Требует проверки. Родитель: Processing. Выбран.');
    expect(host.nodes[1].selected()).toBeTrue();
    expect(root.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Граф');
    expect(description(root.querySelector('[aria-label="Approve"]')!)).toContain('Connection from Заявка to Approval');
  });

  it('applies and removes safe metadata while protecting wrapper semantics at the public boundary', async () => {
    // @ts-expect-error Library-owned roles are not public DOM metadata.
    const forbidden: DomAttributes = { role: 'button' };
    const attributes = {
      ...forbidden,
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
    TestBed.configureTestingModule({
      imports: [AccessibilityHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AccessibilityHostComponent);
    fixture.componentInstance.nodes = createNodes([
      {
        id: 'safe',
        type: 'default',
        point: { x: 0, y: 0 },
        text: 'Safe',
        domAttributes: attributes as unknown as DomAttributes,
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const node: Element = fixture.nativeElement.querySelector('[data-test="safe-node"]');
    expect(node.getAttribute('role')).toBe('group');
    expect(node.getAttribute('aria-label')).toBe('Safe');
    expect(node.getAttribute('title')).toBe('Details');
    expect(node.getAttribute('lang')).toBe('en');
    expect(node.getAttribute('dir')).toBe('ltr');
    for (const attribute of ['id', 'aria-hidden', 'onclick', 'data-object']) {
      expect(node.hasAttribute(attribute)).withContext(attribute).toBeFalse();
    }
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('style')).not.toContain('display: none');
    fixture.componentInstance.nodes[0].domAttributes!.set({ 'data-test': 'updated', 'data-count': 2 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(node.getAttribute('data-test')).toBe('updated');
    expect(node.getAttribute('data-count')).toBe('2');
    expect(node.hasAttribute('title')).toBeFalse();
    expect(node.hasAttribute('lang')).toBeFalse();
  });

  it('describes independent handle eligibility while preserving custom controls', async () => {
    TestBed.configureTestingModule({
      imports: [AccessibilityHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(AccessibilityHostComponent);
    const host = fixture.componentInstance;
    host.nodes = createNodes([
      { id: 'custom', type: 'html-template', point: { x: 0, y: 0 }, ariaLabel: 'Reviewer', selectable: false },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const handle = root.querySelector('[role="group"][aria-label="Accept request"]')!;
    expect(handle.getAttribute('data-port')).toBe('incoming');
    expect(description(handle)).toBe('Inbound route. Starting connections unavailable.');
    expect(handle.hasAttribute('aria-disabled')).toBeFalse();
    expect(handle.hasAttribute('tabindex')).toBeFalse();
    host.canStart.set(true);
    host.canAccept.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(description(handle)).toBe('Inbound route. Accepting connections unavailable.');
    root.querySelector('button')!.click();
    expect(host.clicks).toBe(1);
  });

  it('keeps descriptions and quiet live regions independent across flows and cleans them up', async () => {
    TestBed.configureTestingModule({
      imports: [AccessibilityHostComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
    const first = TestBed.createComponent(AccessibilityHostComponent);
    const second = TestBed.createComponent(AccessibilityHostComponent);
    first.componentInstance.labels.set({ flowDescription: 'Review diagram.', minimapDescription: 'Overview.' });
    first.detectChanges();
    second.detectChanges();
    await first.whenStable();
    await second.whenStable();
    const root: HTMLElement = first.nativeElement;
    expect(description(root.querySelector('[role="region"]')!)).toBe('Review diagram.');
    expect(description(root.querySelector('[role="img"]')!)).toBe('Overview.');
    const firstChild = root.querySelector('[aria-label="Request & review"]')!;
    const secondChild: Element = second.nativeElement.querySelector('[aria-label="Request & review"]');
    const firstId = firstChild.getAttribute('aria-describedby')!;
    const secondId = secondChild.getAttribute('aria-describedby')!;
    expect(firstId).not.toBe(secondId);
    const live = root.querySelector('[aria-live="polite"]')!;
    expect(live.getAttribute('aria-atomic')).toBe('true');
    expect(root.querySelectorAll('[aria-live]').length).toBe(1);
    first.componentInstance.nodes[1].selected.set(true);
    first.detectChanges();
    await first.whenStable();
    expect(live.textContent?.trim()).toBe('');
    expect(description(firstChild)).toContain('Selected.');
    const updatedFirstId = firstChild.getAttribute('aria-describedby')!;
    expect(document.getElementById(updatedFirstId)).not.toBeNull();
    first.destroy();
    expect(document.getElementById(updatedFirstId)).toBeNull();
    expect(document.getElementById(secondId)?.textContent).toContain('Parent: Group parent.');
  });
});

function description(element: Element): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ')
    .trim();
}
