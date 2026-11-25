import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { createNodes, Node } from '../../interfaces/node.interface';
import { LazyLoadTrigger } from '../../types/lazy-load-trigger.type';
import { SelectionBoxMode } from '../../types/selection-box-mode.type';

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow
    [nodes]="nodes"
    [virtualization]="virtualization"
    [lazyLoadTrigger]="lazyLoadTrigger"
    [selectionBoxMode]="selectionBoxMode"
    [parentsBelowEdges]="parentsBelowEdges">
    <div *vNode style="width: 100px; height: 50px"></div>
  </vflow>`,
})
class SettingsHostComponent {
  @Input() nodes: Node[] = [];
  @Input() virtualization?: boolean;
  @Input() lazyLoadTrigger?: LazyLoadTrigger;
  @Input() selectionBoxMode?: SelectionBoxMode;
  @Input() parentsBelowEdges = false;
}

@Component({
  imports: [Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<vflow [nodes]="[]"><div *vNode></div></vflow>`,
})
class BareHostComponent {}

describe('settings of vflow bound from a host', () => {
  let fixture: ComponentFixture<SettingsHostComponent>;
  let flow: VflowComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SettingsHostComponent, BareHostComponent] });
    fixture = TestBed.createComponent(SettingsHostComponent);
    fixture.detectChanges();
    flow = fixture.debugElement.query(By.directive(VflowComponent)).componentInstance;
  });

  afterEach(() => fixture.destroy());

  function bind(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const cases = [
    ['virtualization', true, false],
    ['lazyLoadTrigger', 'viewport', 'immediate'],
    ['selectionBoxMode', 'partial', 'full'],
  ] as const;

  it.each(cases)('reads a bound %s', (name, value) => {
    bind(name, value);

    expect(flow.settings[name]()).toBe(value);
  });

  it.each(cases)('falls back to the default %s when it is unbound again', (name, value, fallback) => {
    bind(name, value);

    bind(name, undefined);

    expect(flow.settings[name]()).toBe(fallback);
  });

  describe('parentsBelowEdges', () => {
    let parent: HTMLElement;

    beforeEach(async () => {
      bind(
        'nodes',
        createNodes([
          { id: 'parent', point: { x: 0, y: 0 }, width: 200, height: 200, ariaLabel: 'Parent' },
          { id: 'child', parentId: 'parent', point: { x: 10, y: 10 }, ariaLabel: 'Child' },
        ]),
      );
      await fixture.whenStable();
      parent = fixture.nativeElement.querySelector('[aria-label="Parent"]');
    });

    it('keeps parents in the layer of the edges by default', () => {
      expect(Number(parent.style.zIndex)).toBeGreaterThanOrEqual(0);
    });

    it('puts parents below the edges while it is set', () => {
      bind('parentsBelowEdges', true);

      expect(Number(parent.style.zIndex)).toBeLessThan(0);
    });

    it('puts parents back when it is unset', () => {
      bind('parentsBelowEdges', true);

      bind('parentsBelowEdges', false);

      expect(Number(parent.style.zIndex)).toBeGreaterThanOrEqual(0);
    });
  });

  it('fills the parent element by default', () => {
    const bare = TestBed.createComponent(BareHostComponent);
    bare.detectChanges();
    const element = bare.nativeElement.querySelector('vflow') as HTMLElement;
    const root = element.querySelector('[data-v-root]') as HTMLElement;

    expect(root.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(root.getBoundingClientRect().width).toBe(element.getBoundingClientRect().width);
    expect(getComputedStyle(root).height).toBe(getComputedStyle(element).height);
    bare.destroy();
  });
});

describe('settings inputs of vflow', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [VflowComponent] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', []);
    fixture.detectChanges();
    return { fixture, flow: fixture.componentInstance };
  }

  it('keeps the bound value in the input and the normalized value in the settings', () => {
    const { fixture, flow } = setup();

    fixture.componentRef.setInput('paneClickDistance', -5);

    expect([flow.paneClickDistance(), flow.settings.paneClickDistance()]).toEqual([-5, 0]);
  });

  it('leaves an unbound input undefined while the settings hold the default', () => {
    const { flow } = setup();

    expect([flow.lazyLoadTrigger(), flow.settings.lazyLoadTrigger()]).toEqual([undefined, 'immediate']);
  });
});
