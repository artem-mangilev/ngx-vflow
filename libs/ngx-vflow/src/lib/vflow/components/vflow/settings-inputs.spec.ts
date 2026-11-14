import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Vflow } from '../../vflow';
import { VflowComponent } from './vflow.component';
import { FlowSettingsService } from '../../services/flow-settings.service';
import { FlowEntitiesService } from '../../services/flow-entities.service';
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
  let settings: FlowSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SettingsHostComponent, BareHostComponent] });
    fixture = TestBed.createComponent(SettingsHostComponent);
    fixture.detectChanges();
    const injector = fixture.debugElement.query(By.directive(VflowComponent)).injector;
    settings = injector.get(FlowSettingsService);
  });

  afterEach(() => fixture.destroy());

  function bind(name: string, value: unknown) {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    TestBed.flushEffects();
  }

  it('reads virtualization and lazyLoadTrigger, each falling back to its default when unbound', () => {
    bind('virtualization', true);
    expect([settings.virtualization(), settings.lazyLoadTrigger()]).toEqual([true, 'immediate']);
    bind('lazyLoadTrigger', 'viewport');
    expect([settings.virtualization(), settings.lazyLoadTrigger()]).toEqual([true, 'viewport']);
    bind('virtualization', undefined);
    bind('lazyLoadTrigger', undefined);
    expect([settings.virtualization(), settings.lazyLoadTrigger()]).toEqual([false, 'immediate']);
  });

  it('reads selectionBoxMode, falling back to full when unbound', () => {
    bind('selectionBoxMode', 'partial');
    expect(settings.selectionBoxMode()).toBe('partial');
    bind('selectionBoxMode', undefined);
    expect(settings.selectionBoxMode()).toBe('full');
  });

  it('puts parents below the edges only while parentsBelowEdges is set', async () => {
    bind(
      'nodes',
      createNodes([
        { id: 'parent', point: { x: 0, y: 0 }, width: 200, height: 200, ariaLabel: 'Parent' },
        { id: 'child', parentId: 'parent', point: { x: 10, y: 10 }, ariaLabel: 'Child' },
      ]),
    );
    await fixture.whenStable();
    const parent = fixture.nativeElement.querySelector('[aria-label="Parent"]') as HTMLElement;
    expect(Number(parent.style.zIndex)).toBeGreaterThanOrEqual(0);
    bind('parentsBelowEdges', true);
    expect(Number(parent.style.zIndex)).toBeLessThan(0);
    bind('parentsBelowEdges', false);
    expect(Number(parent.style.zIndex)).toBeGreaterThanOrEqual(0);
  });

  it('fills the parent element by default', () => {
    const bare = TestBed.createComponent(BareHostComponent);
    bare.detectChanges();
    const flow = bare.nativeElement.querySelector('vflow') as HTMLElement;
    const root = flow.querySelector('[data-v-root]') as HTMLElement;
    expect(root.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(root.getBoundingClientRect().width).toBe(flow.getBoundingClientRect().width);
    expect(getComputedStyle(root).height).toBe(getComputedStyle(flow).height);
    bare.destroy();
  });
});

describe('settings inputs of vflow', () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [VflowComponent] });
    const fixture = TestBed.createComponent(VflowComponent);
    fixture.componentRef.setInput('nodes', []);
    fixture.detectChanges();
    const injector = fixture.debugElement.injector;
    return {
      fixture,
      flow: fixture.componentInstance,
      settings: injector.get(FlowSettingsService),
      entities: injector.get(FlowEntitiesService),
    };
  }

  it('binds every setting, with the defaults of the service', () => {
    const { settings } = setup();
    const unbound = new FlowSettingsService();
    for (const key of Object.keys(unbound) as (keyof FlowSettingsService)[]) {
      const value: unknown = unbound[key];
      if (typeof value !== 'function' || !('bind' in value)) continue;
      expect([key, (settings[key] as () => unknown)()]).toEqual([key, (value as () => unknown)()]);
    }
  });

  it('normalizes values on the way in; the inputs keep what was bound', () => {
    const { fixture, flow, settings, entities } = setup();
    fixture.componentRef.setInput('minZoom', 0.2);
    fixture.componentRef.setInput('paneClickDistance', -5);
    fixture.componentRef.setInput('virtualization', true);
    fixture.componentRef.setInput('connection', { allowSelfConnections: true });

    expect(flow.minZoom()).toBe(0.2);
    expect(settings.minZoom()).toBe(0.2);
    expect(settings.paneClickDistance()).toBe(0);
    expect(flow.virtualization()).toBe(true);
    expect(flow.lazyLoadTrigger()).toBeUndefined();
    expect(flow.settings.virtualization()).toBe(true);
    expect(flow.settings.lazyLoadTrigger()).toBe('immediate');
    expect(flow.settings.paneClickDistance()).toBe(0);
    expect(settings.virtualization()).toBe(true);
    expect(entities.connection().allowSelfConnections).toBe(true);
  });
});
